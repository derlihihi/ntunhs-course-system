// src/controllers/authController.js
const AuthService = require('../services/authService');
// src/controllers/authController.js

class AuthController {
    // 註冊 API (請修改這一段)
    static async register(req, res) {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json({
                message: '註冊成功！',
                user: user,      // <--- 原本是 data，請改成 user
                role: user.role  // <--- 補上這行，確保格式跟登入一樣
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // 登入 API (這段應該不用動，確認一下格式)
    static async login(req, res) {
        try {
            const { studentId, password } = req.body;
            const user = await AuthService.login(studentId, password);
            
            res.status(200).json({
                message: '登入成功',
                role: user.role, 
                user: user       // <--- 這裡本來就是 user，所以登入沒問題
            });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}


module.exports = AuthController;