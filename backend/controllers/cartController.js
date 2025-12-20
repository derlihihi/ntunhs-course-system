// src/controllers/cartController.js
const CartService = require('../services/cartService');

class CartController {
    // GET /api/cart?userId=1
    static async getCart(req, res) {
        try {
            const { userId } = req.query; // 從網址參數拿 userId
            if (!userId) return res.status(400).json({ message: '缺少 userId' });

            const cartItems = await CartService.getUserCart(userId);
            res.json(cartItems);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '取得購物車失敗' });
        }
    }

    // POST /api/cart
    // Body: { userId: 1, courseId: 58 }
    static async addToCart(req, res) {
        try {
            const { userId, courseId } = req.body;
            if (!userId || !courseId) return res.status(400).json({ message: '資料不完整' });

            await CartService.addItem(userId, courseId);
            res.json({ message: '已加入清單' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '加入失敗' });
        }
    }

    // DELETE /api/cart/:courseId
    // Body: { userId: 1 } (因為 DELETE 請求帶 Body 比較非主流，也可以放 Query)
    static async removeFromCart(req, res) {
        try {
            const { courseId } = req.params;
            const { userId } = req.query; // 這裡改用 Query 比較符合規範: DELETE /api/cart/58?userId=1
            
            if (!userId) return res.status(400).json({ message: '缺少 userId' });

            await CartService.removeItem(userId, courseId);
            res.json({ message: '已移除課程' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '移除失敗' });
        }
    }
}

module.exports = CartController;