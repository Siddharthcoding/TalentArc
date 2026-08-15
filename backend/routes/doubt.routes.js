import { Router } from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import optionalAuth from '../middleware/optionalAuth.js';
import {
  getDoubtSessions,
  bookDoubtSession,
  createDoubtSession,
  updateDoubtSession,
  deleteDoubtSession,
  getSessionBookings,
  getDoubtPolls,
  createDoubtPoll,
  voteDoubtPoll,
  addDoubtPollOption,
  deleteDoubtPoll,
} from '../controllers/doubt.controller.js';

const router = Router();

// Public with optional auth (shows isBooked state when logged in)
router.get('/', optionalAuth, getDoubtSessions);

// ─── Doubt Demand Polls ───────────────────────────────────────────────────────
router.get('/polls', optionalAuth, getDoubtPolls);
router.post('/polls', isAuthenticated, createDoubtPoll);
router.post('/polls/:pollId/vote', isAuthenticated, voteDoubtPoll);
router.post('/polls/:pollId/options', isAuthenticated, addDoubtPollOption);
router.delete('/polls/:pollId', isAuthenticated, deleteDoubtPoll);

// Requires auth — book/cancel a slot
router.post('/:id/book', isAuthenticated, bookDoubtSession);

// Admin only — session management
// Note: /admin routes must come BEFORE /:id routes to avoid routing conflicts
router.post('/admin', isAuthenticated, createDoubtSession);
router.put('/admin/:id', isAuthenticated, updateDoubtSession);
router.delete('/admin/:id', isAuthenticated, deleteDoubtSession);
router.get('/admin/bookings/:id', isAuthenticated, getSessionBookings);

export default router;

