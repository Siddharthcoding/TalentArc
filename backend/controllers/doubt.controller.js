import pool from '../db/pool.js';
import { sendBookingConfirmation, sendCancellationNotice, notifyAdminOfBooking, broadcastMeetLink } from '../services/email.service.js';

// ─── Helper: is admin? ─────────────────────────────────────────────────────
function isAdmin(user) {
  if (!user) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  return adminEmails.includes((user.email || '').toLowerCase());
}

// ─── GET /api/doubts ───────────────────────────────────────────────────────
export const getDoubtSessions = async (req, res) => {
  try {
    const userId = req.user?.id;

    const sessionsRes = await pool.query(
      `SELECT * FROM doubt_sessions WHERE is_active = TRUE ORDER BY created_at ASC`
    );

    let bookedIds = new Set();
    if (userId) {
      const bookingsRes = await pool.query(
        `SELECT session_id FROM doubt_bookings WHERE user_id = $1`,
        [userId]
      );
      bookingsRes.rows.forEach((r) => bookedIds.add(r.session_id));
    }

    const isUserAdmin = isAdmin(req.user);
    const data = sessionsRes.rows.map((s) => ({
      id: s.id,
      mentor: isUserAdmin ? s.mentor : (s.role || 'Verified Mentor'),
      role: s.role,
      batch: s.batch,
      topic: s.topic,
      date: s.session_date,
      duration: s.duration,
      totalSeats: s.total_seats,
      bookedSeats: s.booked_seats,
      remainingSeats: Math.max(0, s.total_seats - s.booked_seats),
      tags: s.tags || [],
      avatar: s.avatar,
      meetLink: s.meet_link,
      isBooked: bookedIds.has(s.id),
      createdAt: s.created_at,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('[DoubtController] getDoubtSessions error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch doubt sessions' });
  }
};

// ─── POST /api/doubts/:id/book ─────────────────────────────────────────────
export const bookDoubtSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Login required to book a session' });
    }

    await client.query('BEGIN');

    const sessionRes = await client.query(
      `SELECT * FROM doubt_sessions WHERE id = $1 FOR UPDATE`,
      [id]
    );
    const session = sessionRes.rows[0];
    if (!session) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Doubt session not found' });
    }

    // Fetch user info for email
    const userRes = await client.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    const userEmail = userRes.rows[0]?.email;
    const userName = userRes.rows[0]?.display_name;

    // Check if already booked
    const existingRes = await client.query(
      `SELECT id FROM doubt_bookings WHERE session_id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (existingRes.rows.length > 0) {
      // Cancel booking
      await client.query(`DELETE FROM doubt_bookings WHERE session_id = $1 AND user_id = $2`, [id, userId]);
      await client.query(`UPDATE doubt_sessions SET booked_seats = GREATEST(0, booked_seats - 1) WHERE id = $1`, [id]);
      await client.query('COMMIT');
      client.release();

      // Send cancellation email (non-blocking)
      sendCancellationNotice({ to: userEmail, studentName: userName, sessionTopic: session.topic }).catch(() => {});

      return res.json({
        success: true,
        message: 'Booking cancelled',
        booked: false,
        meetLink: null,
        remainingSeats: session.total_seats - session.booked_seats + 1,
      });
    } else {
      // Book new slot
      if (session.booked_seats >= session.total_seats) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(400).json({ success: false, error: 'No seats left in this session' });
      }

      await client.query(`INSERT INTO doubt_bookings (session_id, user_id) VALUES ($1, $2)`, [id, userId]);
      await client.query(`UPDATE doubt_sessions SET booked_seats = booked_seats + 1 WHERE id = $1`, [id]);
      await client.query('COMMIT');
      client.release();

      // Send confirmation email (non-blocking)
      sendBookingConfirmation({
        to: userEmail,
        studentName: userName,
        sessionTopic: session.topic,
        mentorRole: session.role || 'Verified Placement Mentor',
        batch: session.batch,
        date: session.session_date,
        duration: session.duration,
        meetLink: session.meet_link,
      }).catch(() => {});

      // Notify admin (non-blocking)
      notifyAdminOfBooking({
        sessionTopic: session.topic,
        studentEmail: userEmail,
        studentName: userName,
        mentorName: session.mentor,
      }).catch(() => {});

      return res.json({
        success: true,
        message: 'Slot successfully booked!',
        booked: true,
        meetLink: session.meet_link,
        remainingSeats: session.total_seats - session.booked_seats - 1,
      });
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    console.error('[DoubtController] bookDoubtSession error:', err);
    res.status(500).json({ success: false, error: 'Failed to process booking' });
  }
};

// ─── POST /api/doubts/admin ─ Create session ───────────────────────────────
export const createDoubtSession = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).json({ success: false, error: 'Admin access required' });
  try {
    const { mentor, role, batch, topic, session_date, duration, total_seats, tags, avatar, meet_link } = req.body;
    if (!mentor || !topic || !session_date) {
      return res.status(400).json({ success: false, error: 'mentor, topic, and session_date are required' });
    }
    const tagsArr = Array.isArray(tags)
      ? tags
      : tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const avatarStr = avatar || mentor.split(' ').map((w) => w[0] || '').join('').toUpperCase().slice(0, 2);

    const result = await pool.query(
      `INSERT INTO doubt_sessions (mentor, role, batch, topic, session_date, duration, total_seats, tags, avatar, meet_link, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [mentor, role || '', batch || '', topic, session_date, duration || '60 Mins', total_seats || 20, tagsArr, avatarStr, meet_link || null, req.user.id]
    );
    const s = result.rows[0];
    res.status(201).json({
      success: true,
      data: {
        id: s.id, mentor: s.mentor, role: s.role, batch: s.batch, topic: s.topic,
        date: s.session_date, duration: s.duration, totalSeats: s.total_seats,
        tags: s.tags, avatar: s.avatar, meetLink: s.meet_link, isBooked: false,
        bookedSeats: 0, remainingSeats: s.total_seats,
      },
    });
  } catch (err) {
    console.error('[DoubtController] createDoubtSession error:', err);
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
};

// ─── PUT /api/doubts/admin/:id ─ Update session ────────────────────────────
export const updateDoubtSession = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).json({ success: false, error: 'Admin access required' });
  try {
    const { id } = req.params;
    const { mentor, role, batch, topic, session_date, duration, total_seats, tags, avatar, meet_link, is_active } = req.body;

    const tagsArr = tags != null
      ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean))
      : undefined;

    // Check if meet_link changed — if so, broadcast to all enrolled students
    const existingRes = await pool.query(`SELECT * FROM doubt_sessions WHERE id = $1`, [id]);
    const existing = existingRes.rows[0];
    const meetLinkChanged = meet_link && meet_link !== existing?.meet_link;

    const result = await pool.query(
      `UPDATE doubt_sessions SET
        mentor      = COALESCE($1,  mentor),
        role        = COALESCE($2,  role),
        batch       = COALESCE($3,  batch),
        topic       = COALESCE($4,  topic),
        session_date= COALESCE($5,  session_date),
        duration    = COALESCE($6,  duration),
        total_seats = COALESCE($7,  total_seats),
        tags        = COALESCE($8,  tags),
        avatar      = COALESCE($9,  avatar),
        meet_link   = COALESCE($10, meet_link),
        is_active   = COALESCE($11, is_active)
       WHERE id = $12 RETURNING *`,
      [mentor, role, batch, topic, session_date, duration, total_seats, tagsArr, avatar, meet_link, is_active, id]
    );

    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Session not found' });
    const updated = result.rows[0];

    // If meet link was updated, broadcast to all enrolled students
    if (meetLinkChanged) {
      const studentsRes = await pool.query(
        `SELECT u.email, u.display_name FROM doubt_bookings db JOIN users u ON db.user_id = u.id WHERE db.session_id = $1`,
        [id]
      );
      broadcastMeetLink({
        students: studentsRes.rows,
        sessionTopic: updated.topic,
        mentorRole: updated.role || 'Verified Placement Mentor',
        batch: updated.batch,
        date: updated.session_date,
        meetLink: updated.meet_link,
      }).catch(() => {});
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[DoubtController] updateDoubtSession error:', err);
    res.status(500).json({ success: false, error: 'Failed to update session' });
  }
};

// ─── DELETE /api/doubts/admin/:id ─────────────────────────────────────────
export const deleteDoubtSession = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).json({ success: false, error: 'Admin access required' });
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM doubt_sessions WHERE id = $1`, [id]);
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    console.error('[DoubtController] deleteDoubtSession error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete session' });
  }
};

// ─── GET /api/doubts/admin/bookings/:id ───────────────────────────────────
export const getSessionBookings = async (req, res) => {
  if (!isAdmin(req.user)) return res.status(403).json({ success: false, error: 'Admin access required' });
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT db.id, db.booked_at, u.display_name, u.email, u.avatar_url
       FROM doubt_bookings db
       JOIN users u ON db.user_id = u.id
       WHERE db.session_id = $1
       ORDER BY db.booked_at ASC`,
      [id]
    );
    res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('[DoubtController] getSessionBookings error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ─── DOUBT POLLS (Company Wishlist / Demand Voting) ─────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

// ─── GET /api/doubts/polls ──────────────────────────────────────────────────
export const getDoubtPolls = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Fetch active polls
    const pollsRes = await pool.query(
      `SELECT dp.*, u.display_name as creator_name
       FROM doubt_polls dp
       LEFT JOIN users u ON dp.created_by = u.id
       WHERE dp.is_active = TRUE
       ORDER BY dp.created_at DESC`
    );

    if (pollsRes.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const pollIds = pollsRes.rows.map((p) => p.id);

    // Fetch options for these polls
    const optionsRes = await pool.query(
      `SELECT * FROM doubt_poll_options
       WHERE poll_id = ANY($1::uuid[])
       ORDER BY votes_count DESC, created_at ASC`,
      [pollIds]
    );

    // Fetch user's votes if logged in
    let userVotesMap = new Map();
    if (userId) {
      const votesRes = await pool.query(
        `SELECT poll_id, option_id FROM doubt_poll_votes WHERE user_id = $1 AND poll_id = ANY($2::uuid[])`,
        [userId, pollIds]
      );
      votesRes.rows.forEach((v) => userVotesMap.set(v.poll_id, v.option_id));
    }

    // Group options by poll
    const optionsByPoll = new Map();
    optionsRes.rows.forEach((opt) => {
      if (!optionsByPoll.has(opt.poll_id)) optionsByPoll.set(opt.poll_id, []);
      optionsByPoll.get(opt.poll_id).push({
        id: opt.id,
        text: opt.option_text,
        company: opt.company_name,
        votes: opt.votes_count,
      });
    });

    const data = pollsRes.rows.map((poll) => {
      const options = optionsByPoll.get(poll.id) || [];
      const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
      const userVotedOptionId = userVotesMap.get(poll.id) || null;

      const formattedOptions = options.map((opt) => ({
        ...opt,
        percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
        isUserVoted: userVotedOptionId === opt.id,
      }));

      return {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        createdBy: poll.created_by,
        creatorName: poll.creator_name || 'Kampus Ace Team',
        createdAt: poll.created_at,
        totalVotes,
        userVotedOptionId,
        hasVoted: Boolean(userVotedOptionId),
        options: formattedOptions,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error('[DoubtController] getDoubtPolls error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch doubt polls' });
  }
};

// ─── POST /api/doubts/polls ─ Create a new poll ──────────────────────────────
export const createDoubtPoll = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Login required to create a poll' });

    if (!isAdmin(req.user)) {
      return res.status(403).json({ success: false, error: 'Admin access required to create demand polls' });
    }

    const { title, description, options } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Poll title / question is required' });
    }

    const optionsList = Array.isArray(options) ? options : [];
    if (optionsList.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 company options are required' });
    }

    await client.query('BEGIN');

    const pollRes = await client.query(
      `INSERT INTO doubt_polls (title, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [title.trim(), description?.trim() || null, userId]
    );
    const newPoll = pollRes.rows[0];

    const insertedOptions = [];
    for (const opt of optionsList) {
      const text = typeof opt === 'string' ? opt : opt.text || opt.company || '';
      const comp = typeof opt === 'object' ? opt.company || opt.text : text;
      if (text.trim()) {
        const optRes = await client.query(
          `INSERT INTO doubt_poll_options (poll_id, option_text, company_name, votes_count)
           VALUES ($1, $2, $3, 0) RETURNING *`,
          [newPoll.id, text.trim(), comp.trim()]
        );
        insertedOptions.push({
          id: optRes.rows[0].id,
          text: optRes.rows[0].option_text,
          company: optRes.rows[0].company_name,
          votes: 0,
          percentage: 0,
          isUserVoted: false,
        });
      }
    }

    await client.query('COMMIT');
    client.release();

    res.status(201).json({
      success: true,
      message: 'Poll created successfully!',
      data: {
        id: newPoll.id,
        title: newPoll.title,
        description: newPoll.description,
        createdBy: newPoll.created_by,
        creatorName: req.user.displayName || 'You',
        createdAt: newPoll.created_at,
        totalVotes: 0,
        userVotedOptionId: null,
        hasVoted: false,
        options: insertedOptions,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    console.error('[DoubtController] createDoubtPoll error:', err);
    res.status(500).json({ success: false, error: 'Failed to create doubt poll' });
  }
};

// ─── POST /api/doubts/polls/:pollId/vote ─ Cast or toggle vote ───────────────
export const voteDoubtPoll = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Login required to vote' });

    const { pollId } = req.params;
    const { optionId } = req.body;

    if (!optionId) return res.status(400).json({ success: false, error: 'optionId is required' });

    await client.query('BEGIN');

    // Check existing vote
    const existingVoteRes = await client.query(
      `SELECT * FROM doubt_poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [pollId, userId]
    );
    const existingVote = existingVoteRes.rows[0];

    let userVotedOptionId = null;

    if (existingVote) {
      if (existingVote.option_id === optionId) {
        // Toggle OFF (unvote)
        await client.query(`DELETE FROM doubt_poll_votes WHERE id = $1`, [existingVote.id]);
        await client.query(
          `UPDATE doubt_poll_options SET votes_count = GREATEST(0, votes_count - 1) WHERE id = $1`,
          [optionId]
        );
        userVotedOptionId = null;
      } else {
        // Switch vote to another option
        await client.query(
          `UPDATE doubt_poll_options SET votes_count = GREATEST(0, votes_count - 1) WHERE id = $1`,
          [existingVote.option_id]
        );
        await client.query(
          `UPDATE doubt_poll_votes SET option_id = $1, voted_at = NOW() WHERE id = $2`,
          [optionId, existingVote.id]
        );
        await client.query(
          `UPDATE doubt_poll_options SET votes_count = votes_count + 1 WHERE id = $1`,
          [optionId]
        );
        userVotedOptionId = optionId;
      }
    } else {
      // New vote
      await client.query(
        `INSERT INTO doubt_poll_votes (poll_id, option_id, user_id) VALUES ($1, $2, $3)`,
        [pollId, optionId, userId]
      );
      await client.query(
        `UPDATE doubt_poll_options SET votes_count = votes_count + 1 WHERE id = $1`,
        [optionId]
      );
      userVotedOptionId = optionId;
    }

    await client.query('COMMIT');
    client.release();

    // Fetch updated options for this poll
    const optionsRes = await pool.query(
      `SELECT * FROM doubt_poll_options WHERE poll_id = $1 ORDER BY votes_count DESC, created_at ASC`,
      [pollId]
    );

    const totalVotes = optionsRes.rows.reduce((sum, opt) => sum + (opt.votes_count || 0), 0);
    const formattedOptions = optionsRes.rows.map((opt) => ({
      id: opt.id,
      text: opt.option_text,
      company: opt.company_name,
      votes: opt.votes_count,
      percentage: totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0,
      isUserVoted: userVotedOptionId === opt.id,
    }));

    res.json({
      success: true,
      data: {
        pollId,
        totalVotes,
        userVotedOptionId,
        hasVoted: Boolean(userVotedOptionId),
        options: formattedOptions,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    console.error('[DoubtController] voteDoubtPoll error:', err);
    res.status(500).json({ success: false, error: 'Failed to record vote' });
  }
};

// ─── POST /api/doubts/polls/:pollId/options ─ Add new option to existing poll ──
export const addDoubtPollOption = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Login required to add option' });

    const { pollId } = req.params;
    const { optionText, companyName } = req.body;

    if (!optionText || !optionText.trim()) {
      return res.status(400).json({ success: false, error: 'Company or session option text is required' });
    }

    const comp = companyName?.trim() || optionText.trim().split(/[-:]/)[0].trim();

    const result = await pool.query(
      `INSERT INTO doubt_poll_options (poll_id, option_text, company_name, votes_count)
       VALUES ($1, $2, $3, 0) RETURNING *`,
      [pollId, optionText.trim(), comp]
    );

    const opt = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Option suggested and added to poll!',
      data: {
        id: opt.id,
        text: opt.option_text,
        company: opt.company_name,
        votes: 0,
        percentage: 0,
        isUserVoted: false,
      },
    });
  } catch (err) {
    console.error('[DoubtController] addDoubtPollOption error:', err);
    res.status(500).json({ success: false, error: 'Failed to add option to poll' });
  }
};

// ─── DELETE /api/doubts/polls/:pollId ─────────────────────────────────────────
export const deleteDoubtPoll = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Login required' });

    const { pollId } = req.params;
    const pollRes = await pool.query(`SELECT * FROM doubt_polls WHERE id = $1`, [pollId]);
    const poll = pollRes.rows[0];

    if (!poll) return res.status(404).json({ success: false, error: 'Poll not found' });

    if (poll.created_by !== userId && !isAdmin(req.user)) {
      return res.status(403).json({ success: false, error: 'Only creator or admin can delete this poll' });
    }

    await pool.query(`DELETE FROM doubt_polls WHERE id = $1`, [pollId]);
    res.json({ success: true, message: 'Poll deleted successfully' });
  } catch (err) {
    console.error('[DoubtController] deleteDoubtPoll error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete poll' });
  }
};

