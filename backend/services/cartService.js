// src/services/cartService.js
const CartModel = require('../models/cartModel');

class CartService {
    // 取得清單並格式化
    static async getUserCart(userId) {
        const items = await CartModel.getCartItems(userId);

        // 格式化資料以符合前端 CartDrawer 的需求
        return items.map(item => ({
            id: item.id, // 資料庫的 ID，用來刪除用
            code: item.course_code, // 顯示用的代碼
            name: item.name,
            credits: item.credits,
            // 組合時間字串： "週一 / 02,03,04"
            time: `${item.day_of_week?.replace('週', '') || ''} / ${item.period_raw || ''}`
        }));
    }

    static async addItem(userId, courseId) {
        return await CartModel.addToCart(userId, courseId);
    }

    static async removeItem(userId, courseId) {
        return await CartModel.removeFromCart(userId, courseId);
    }
}

module.exports = CartService;