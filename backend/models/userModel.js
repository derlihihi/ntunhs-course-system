// src/models/userModel.js
const pool = require('../config/db');

class UserModel {
    // 透過學號尋找使用者 (保持不變)
    static async findByStudentId(studentId) {
        const query = `SELECT * FROM users WHERE student_id = $1`;
        const { rows } = await pool.query(query, [studentId]);
        return rows[0];
    }

    // 建立新使用者 (修正邏輯)
    static async createUser({ studentId, password, name, department }) {
        // Role: 1 (代表學生), 0 (代表管理員，這裡註冊預設都是學生)
        // Status: 'active' (正常), 'banned' (禁言)
        const defaultRole = 1; 
        const defaultStatus = 'active';

        const query = `
            INSERT INTO users (student_id, password, name, department, role, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [studentId, password, name, department, defaultRole, defaultStatus];
        
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
    static async findById(id) {
        const query = `SELECT * FROM users WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = UserModel;