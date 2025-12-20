// src/models/initTables.js
const pool = require('../config/db');

const createTables = async () => {
  try {
    // 1. 建立 Users 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50) NOT NULL,
        department VARCHAR(50),
        role VARCHAR(10) DEFAULT 'student',
        status VARCHAR(10) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. 建立 Courses 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        year_term VARCHAR(10),
        grade VARCHAR(10),
        department VARCHAR(50),
        course_type VARCHAR(20),
        course_name VARCHAR(100),
        teacher VARCHAR(50),
        day_of_week VARCHAR(10),
        period VARCHAR(20),
        location VARCHAR(50),
        credits INTEGER
      );
    `);

    // 3. 建立 Cart Items 表 (購物車)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );
    `);

    // 4. 建立 Forum Posts 表 (討論區)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ 所有資料表檢查/建立完成！');
  } catch (error) {
    console.error('❌ 建立資料表失敗:', error);
  }
};

module.exports = createTables;