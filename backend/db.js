import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// פונקציה חדשה שיוצרת את הטבלה שלנו אם היא לא קיימת
export async function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS responses (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      scenario_id INT,
      bot_question TEXT,
      user_response TEXT NOT NULL,
      language VARCHAR(10),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    client.release();
    console.log('✅ Table "responses" is ready.');
  } catch (err) {
    console.error('❌ Error initializing database table:', err);
  }
}

export default pool;