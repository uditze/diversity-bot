import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// הגדרת החיבור למסד הנתונים באמצעות ה-URL ששמרנו
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // הגדרה חשובה להתחברות למסדי נתונים בענן כמו Render
  ssl: {
    rejectUnauthorized: false
  }
});

// ייצוא החיבור כדי שנוכל להשתמש בו בקבצים אחרים
export default pool;
