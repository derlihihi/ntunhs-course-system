// src/controllers/authController.js
const AuthService = require('../services/authService');

class AuthController {
    // 註冊 API
    static async register(req, res) {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json({
                message: '註冊成功！',
                data: user
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // 登入 API
    static async login(req, res) {
        try {
            const { studentId, password } = req.body;
            const user = await AuthService.login(studentId, password);
            
            res.status(200).json({
                message: '登入成功',
                // 根據你的流程，前端會根據這個 role 決定跳轉到哪個介面
                role: user.role, 
                user: user
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}

module.exports = AuthController;