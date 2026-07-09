import pool from "./pool.js";

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

export default async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(CREATE_USERS_TABLE);
    await client.query(CREATE_REPORTS_TABLE);
    console.log("Database migrations complete");
  } finally {
    client.release();
  }
}
