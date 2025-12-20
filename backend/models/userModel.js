// src/models/userModel.js
const pool = require('../config/db');

class UserModel {
    // 透過學號尋找使用者
    static async findByStudentId(studentId) {
        const query = `SELECT * FROM users WHERE student_id = $1`;
        const { rows } = await pool.query(query, [studentId]);
        return rows[0];
    }

    // 建立新使用者
    static async createUser({ studentId, password, name, department, role }) {
        const query = `
            INSERT INTO users (student_id, password, name, department, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [studentId, password, name, department, role];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
}

module.exports = UserModel;