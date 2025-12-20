// src/services/authService.js
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

class AuthService {
    // 處理註冊邏輯
    static async register(data) {
        // 1. 檢查學號是否已經存在
        const existingUser = await UserModel.findByStudentId(data.studentId);
        if (existingUser) {
            throw new Error('該學號已經註冊過了');
        }

        // 2. 密碼加密 (雜湊)
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 3. 建立使用者
        const newUser = await UserModel.createUser({
            ...data,
            password: hashedPassword,
            role: 'student' // 預設都是學生，管理者可能要手動改 DB 或設特殊入口
        });

        return newUser;
    }

    // 處理登入邏輯
    static async login(studentId, password) {
        // 1. 找使用者
        const user = await UserModel.findByStudentId(studentId);
        if (!user) {
            throw new Error('帳號或密碼錯誤');
        }

        // 2. 比對密碼
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('帳號或密碼錯誤');
        }

        // 3. 回傳使用者資料 (之後這裡可以發 JWT Token)
        // 把密碼拿掉再回傳比較安全
        const { password: _, ...userWithoutPassword } = user; 
        return userWithoutPassword;
    }
}

module.exports = AuthService;