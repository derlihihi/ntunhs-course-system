// src/models/cartModel.js
const pool = require('../config/db');

class CartModel {
    // 1. 加入課程到購物車
    static async addToCart(userId, courseId) {
        // 使用 ON CONFLICT DO NOTHING 避免重複加入報錯
        const query = `
            INSERT INTO cart_items (user_id, course_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, course_id) DO NOTHING
            RETURNING *
        `;
        const { rows } = await pool.query(query, [userId, courseId]);
        return rows[0];
    }

    // 2. 從購物車移除課程
    static async removeFromCart(userId, courseId) {
        const query = `
            DELETE FROM cart_items 
            WHERE user_id = $1 AND course_id = $2
            RETURNING *
        `;
        const { rows } = await pool.query(query, [userId, courseId]);
        return rows[0];
    }

    // 3. 取得使用者的購物車清單 (包含課程詳細資訊)
    static async getCartItems(userId) {
        const query = `
            SELECT 
                c.id, 
                c.course_code, 
                c.course_name AS name, 
                c.credits, 
                c.day_of_week, 
                c.period_raw
            FROM cart_items ci
            JOIN courses c ON ci.course_id = c.id
            WHERE ci.user_id = $1
            ORDER BY ci.added_at DESC
        `;
        const { rows } = await pool.query(query, [userId]);
        return rows;
    }
    
    // 4. 清空購物車 (結帳後可能需要)
    static async clearCart(userId) {
        const query = `DELETE FROM cart_items WHERE user_id = $1`;
        await pool.query(query, [userId]);
    }
}

module.exports = CartModel;