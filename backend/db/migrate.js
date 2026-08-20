import "dotenv/config";
import pool from "./pool.js";

const ENABLE_UUID_EXTENSION = `CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

// ─── Payment tables ───────────────────────────────────────────────────────────
const CREATE_SUBSCRIPTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'pro_monthly',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions (user_id);
  CREATE INDEX IF NOT EXISTS subscriptions_status_end_idx ON subscriptions (status, end_date);
`;

const CREATE_FREE_TRIAL_USAGE_TABLE = `
  CREATE TABLE IF NOT EXISTS free_trial_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service TEXT NOT NULL CHECK (service IN ('ats', 'jd_match', 'mock_test')),
    used_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service)
  );
`;

const CREATE_PAYMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('subscription', 'doubt_session')),
    reference_id UUID,
    amount NUMERIC(10, 2) NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'captured',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments (user_id);
`;

// Add payment columns to doubt_bookings if they don't exist yet
const ALTER_DOUBT_BOOKINGS_PAYMENT = `
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='doubt_bookings' AND column_name='payment_status'
    ) THEN
      ALTER TABLE doubt_bookings ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'paid';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='doubt_bookings' AND column_name='razorpay_order_id'
    ) THEN
      ALTER TABLE doubt_bookings ADD COLUMN razorpay_order_id TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name='doubt_bookings' AND column_name='razorpay_payment_id'
    ) THEN
      ALTER TABLE doubt_bookings ADD COLUMN razorpay_payment_id TEXT;
    END IF;
  END $$;
`;

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const CREATE_REPORTS_TABLE = `
  CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('ats', 'jd_match')),
    input_data JSONB,
    result_payload JSONB,
    temp_uuid UUID UNIQUE,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const CREATE_QUESTIONS_STORE_TABLE = `
  CREATE TABLE IF NOT EXISTS questions_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT,
    difficulty TEXT NOT NULL,
    image_url TEXT,
    company_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const CREATE_ASSESSMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    input_type TEXT NOT NULL,
    input_value TEXT,
    questions JSONB NOT NULL,
    answers JSONB,
    score INTEGER,
    max_score INTEGER,
    status TEXT NOT NULL DEFAULT 'created',
    fullscreen_violations INTEGER DEFAULT 0,
    duration_seconds INTEGER NOT NULL DEFAULT 600,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
  );
`;

const CREATE_COMPANIES_TABLE = `
  CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'General',
    description TEXT,
    logo_url TEXT,
    website TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const CREATE_COMPANY_QUESTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS company_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text','mcq','image')),
    title TEXT NOT NULL,
    body TEXT,
    options JSONB,
    correct_option INTEGER,
    image_url TEXT,
    tags TEXT[],
    difficulty TEXT DEFAULT 'Medium',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const CREATE_COMPANY_INDEXES = `
  DROP INDEX IF EXISTS companies_name_lower_idx;
  CREATE UNIQUE INDEX IF NOT EXISTS companies_name_role_lower_idx ON companies (LOWER(name), LOWER(role));
  CREATE INDEX IF NOT EXISTS company_questions_company_id_idx ON company_questions (company_id);
  CREATE INDEX IF NOT EXISTS company_questions_type_idx ON company_questions (type);
  CREATE INDEX IF NOT EXISTS company_questions_difficulty_idx ON company_questions (difficulty);
`;

const CREATE_DOUBT_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS doubt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor TEXT NOT NULL,
    role TEXT NOT NULL,
    batch TEXT NOT NULL,
    topic TEXT NOT NULL,
    session_date TEXT NOT NULL,
    duration TEXT NOT NULL DEFAULT '60 Mins',
    total_seats INTEGER NOT NULL DEFAULT 20,
    booked_seats INTEGER NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    avatar TEXT NOT NULL,
    meet_link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

const CREATE_DOUBT_BOOKINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS doubt_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES doubt_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id)
  );
`;


const SEED_QUESTIONS = [
  {
    topic: "JavaScript",
    question_text: "What is the output of `typeof null` in JavaScript?",
    options: JSON.stringify(["'null'", "'undefined'", "'object'", "'boolean'"]),
    correct_option: 2,
    explanation: "In JavaScript, `typeof null` is a historical bug that returns 'object'.",
    difficulty: "Easy",
  },
  {
    topic: "JavaScript",
    question_text: "Which of the following is NOT a JavaScript framework/library?",
    options: JSON.stringify(["React", "Laravel", "Vue", "Angular"]),
    correct_option: 1,
    explanation: "Laravel is a PHP framework, whereas React, Vue, and Angular are JavaScript-based technologies.",
    difficulty: "Easy",
  },
  {
    topic: "JavaScript",
    question_text: "What is the purpose of `Promise.all` in JavaScript?",
    options: JSON.stringify([
      "To resolve promises sequentially, waiting for each to finish",
      "To run multiple promises concurrently and resolve when all of them are completed",
      "To catch errors in a try-catch block automatically",
      "To create a new Promise chain that executes on a background web worker thread",
    ]),
    correct_option: 1,
    explanation: "Promise.all takes an iterable of promises and returns a single Promise that resolves when all input promises have resolved.",
    difficulty: "Medium",
  },
  {
    topic: "React",
    question_text: "What does the React Hook `useEffect` do?",
    options: JSON.stringify([
      "It checks if component props are valid",
      "It lets you perform side effects in function components",
      "It creates a state variable that persists across renders",
      "It improves rendering speed by using visual virtual DOM caching",
    ]),
    correct_option: 1,
    explanation: "useEffect lets you synchronize a component with an external system and execute side effects in React function components.",
    difficulty: "Easy",
  },
  {
    topic: "Python",
    question_text: "What is the correct way to declare a list in Python?",
    options: JSON.stringify(["x = (1, 2, 3)", "x = {1, 2, 3}", "x = [1, 2, 3]", "x = <1, 2, 3>"]),
    correct_option: 2,
    explanation: "Lists in Python are defined using square brackets `[...]`.",
    difficulty: "Easy",
  },
  {
    topic: "SQL",
    question_text: "Which SQL clause is used to filter records after aggregate functions have been applied?",
    options: JSON.stringify(["WHERE", "GROUP BY", "HAVING", "ORDER BY"]),
    correct_option: 2,
    explanation: "The HAVING clause was added to SQL because the WHERE keyword could not be used with aggregate functions.",
    difficulty: "Medium",
  },
];

export default async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(ENABLE_UUID_EXTENSION);
    await client.query(CREATE_USERS_TABLE);
    await client.query(CREATE_REPORTS_TABLE);
    await client.query(CREATE_QUESTIONS_STORE_TABLE);
    await client.query(CREATE_ASSESSMENTS_TABLE);
    await client.query(CREATE_COMPANIES_TABLE);
    await client.query("ALTER TABLE companies ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'General'");
    await client.query(CREATE_COMPANY_QUESTIONS_TABLE);
    await client.query(CREATE_COMPANY_INDEXES);
    console.log("Database tables checked/created");

    // Payment tables
    await client.query(CREATE_SUBSCRIPTIONS_TABLE);
    await client.query(CREATE_FREE_TRIAL_USAGE_TABLE);
    await client.query(CREATE_PAYMENTS_TABLE);
    await client.query(ALTER_DOUBT_BOOKINGS_PAYMENT);
    console.log("Payment tables checked/created");

    const countRes = await client.query("SELECT COUNT(*) FROM questions_store");
    const count = parseInt(countRes.rows[0].count, 10);
    if (count === 0) {
      console.log("Seeding questions_store...");
      for (const q of SEED_QUESTIONS) {
        await client.query(
          `INSERT INTO questions_store (topic, question_text, options, correct_option, explanation, difficulty)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [q.topic, q.question_text, q.options, q.correct_option, q.explanation, q.difficulty]
        );
      }
      console.log("Questions seeded successfully");
    }

    // Doubt session tables
    await client.query(CREATE_DOUBT_SESSIONS_TABLE);
    await client.query(CREATE_DOUBT_BOOKINGS_TABLE);
    console.log("Doubt session tables checked/created");


    // Doubt poll tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS doubt_polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS doubt_poll_options (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID NOT NULL REFERENCES doubt_polls(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        company_name TEXT,
        votes_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS doubt_poll_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        poll_id UUID NOT NULL REFERENCES doubt_polls(id) ON DELETE CASCADE,
        option_id UUID NOT NULL REFERENCES doubt_poll_options(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        voted_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(poll_id, user_id)
      );
    `);
    console.log("Doubt poll tables checked/created");


    console.log("Database migrations complete");

  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith("db/migrate.js")) {
  migrate()
    .then(async () => {
      console.log("Migration executed directly: SUCCESS");
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Migration executed directly: FAILED", err);
      await pool.end();
      process.exit(1);
    });
}


