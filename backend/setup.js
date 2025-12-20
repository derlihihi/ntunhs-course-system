// setup.js
const { Client } = require('pg');
require('dotenv').config();

const createDatabaseAndTables = async () => {
  // 1. 先連線到系統預設的 'postgres' 資料庫
  const systemClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres', // <--- 關鍵！先連到這裡
  });

  try {
    await systemClient.connect();
    console.log('🔌 已連線到系統預設資料庫 (postgres)...');

    // 2. 檢查 'course_system' 資料庫是否存在
    const checkDbQuery = "SELECT 1 FROM pg_database WHERE datname = $1";
    const checkDbResult = await systemClient.query(checkDbQuery, [process.env.DB_NAME]);

    if (checkDbResult.rowCount === 0) {
      // 3. 如果不存在，就建立它
      console.log(`🛠️ 正在建立資料庫: ${process.env.DB_NAME}...`);
      // 注意：CREATE DATABASE 不能放在 transaction block，也不能用參數化查詢，所以直接組字串
      await systemClient.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`✅ 資料庫 ${process.env.DB_NAME} 建立成功！`);
    } else {
      console.log(`ℹ️ 資料庫 ${process.env.DB_NAME} 已經存在，跳過建立步驟。`);
    }
    
  } catch (err) {
    console.error('❌ 建立資料庫時發生錯誤:', err);
    process.exit(1); // 發生錯誤就停下來
  } finally {
    await systemClient.end(); // 斷開與 postgres 的連線
  }

  // ==========================================
  // 4. 現在資料庫確定有了，我們連進去建立 Tables
  // ==========================================
  
  const targetClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME, // <--- 這次連到我們剛剛建好的 course_system
  });

  try {
    await targetClient.connect();
    console.log(`🔌 已切換連線到 ${process.env.DB_NAME}，準備建立 Table...`);

    // 建立 Users 表
    await targetClient.query(`
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

    // 建立 Courses 表
    await targetClient.query(`
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

    // 建立 Cart Items 表
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );
    `);

    // 建立 Forum Posts 表
    await targetClient.query(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('資料庫與資料表已準備好');

  } catch (err) {
    console.error('❌ 建立 Table 時發生錯誤:', err);
  } finally {
    await targetClient.end();
  }
};

// 執行主程式
createDatabaseAndTables();