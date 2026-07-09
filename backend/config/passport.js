import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import pool from "../db/pool.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const displayName = profile.displayName;
        const avatarUrl = profile.photos?.[0]?.value || null;

        let result = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId]
        );

        if (result.rows.length === 0) {
          result = await pool.query(
            `INSERT INTO users (google_id, email, display_name, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [googleId, email, displayName, avatarUrl]
          );
        } else {
          result = await pool.query(
            `UPDATE users SET email = $1, display_name = $2, avatar_url = $3
             WHERE google_id = $4
             RETURNING *`,
            [email, displayName, avatarUrl, googleId]
          );
        }

        done(null, result.rows[0]);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;
