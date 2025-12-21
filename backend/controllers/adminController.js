// src/controllers/adminController.js
const pool = require('../config/db');

class AdminController {
    // 取得所有使用者
    static async getAllUsers(req, res) {
        try {
            // 排除密碼欄位，只抓需要的
            const query = `
                SELECT id, student_id, name, department, role, status, created_at 
                FROM users 
                ORDER BY created_at DESC
            `;
            const { rows } = await pool.query(query);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '取得使用者列表失敗' });
        }
    }

    // 取得所有留言 (包含被刪除的，如果要做垃圾桶功能)
    static async getAllComments(req, res) {
        try {
            const query = `
                SELECT 
                    fp.id, fp.content, fp.created_at AS date,
                    u.name AS user_name,
                    c.course_name AS course_name,
                    'normal' as status -- 目前資料庫沒 status 欄位，先假裝正常
                FROM forum_posts fp
                JOIN users u ON fp.user_id = u.id
                JOIN courses c ON fp.course_id = c.id
                ORDER BY fp.created_at DESC
            `;
            const { rows } = await pool.query(query);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '取得留言列表失敗' });
        }
    }

    // 取得 Dashboard 統計數據 (可選)
    static async getDashboardStats(req, res) {
        try {
            const userCount = await pool.query('SELECT COUNT(*) FROM users');
            const courseCount = await pool.query('SELECT COUNT(*) FROM courses');
            const commentCount = await pool.query('SELECT COUNT(*) FROM forum_posts');
            
            res.json({
                users: parseInt(userCount.rows[0].count),
                courses: parseInt(courseCount.rows[0].count),
                comments: parseInt(commentCount.rows[0].count)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '取得統計失敗' });
        }
    }
}

module.exports = AdminController;