// src/models/forumModel.js
const pool = require('../config/db');

class ForumModel {
    // 取得某使用者的歷史留言 (包含課程資訊)
    static async getHistoryByUserId(userId) {
        const query = `
            SELECT 
                fp.id,
                fp.content AS "lastComment",
                fp.created_at AS time,
                c.id AS "courseId",
                c.course_name AS name,
                c.teacher,
                c.course_code
            FROM forum_posts fp
            JOIN courses c ON fp.course_id = c.id
            WHERE fp.user_id = $1
            ORDER BY fp.created_at DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    }

    // 新增留言 (這之後 DiscussionModal 會用到)
    static async createPost(userId, courseId, content) {
        const query = `
            INSERT INTO forum_posts (user_id, course_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [userId, courseId, content]);
        return rows[0];
    }
    static async getPostsByCourseId(courseId) {
        const query = `
            SELECT 
                fp.id,
                fp.content,
                fp.created_at,
                fp.user_id,
                u.name AS user_name,
                u.department
            FROM forum_posts fp
            JOIN users u ON fp.user_id = u.id
            WHERE fp.course_id = $1
            ORDER BY fp.created_at ASC
        `;
        const { rows } = await pool.query(query, [courseId]);
        return rows;
    }
}

module.exports = ForumModel;