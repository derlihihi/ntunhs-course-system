// src/services/cartService.js
const CartModel = require('../models/cartModel');

class CartService {
    // 取得清單並格式化
static async getUserCart(userId) {
    const items = await CartModel.getCartItems(userId);

    return items.map(item => ({
        id: item.id,
        code: item.course_code,
        name: item.name,
        credits: item.credits,
        // 組合時間字串
        time: `${item.day_of_week?.replace('週', '') || ''} / ${item.period_raw || ''}`,
        location: item.location || '', // 🔥【請補上這行】把 location 傳出去
        semester: item.semester || ''  // 🔥 建議順便補上學期
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