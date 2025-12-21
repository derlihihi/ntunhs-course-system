// src/controllers/userController.js
const UserModel = require('../models/userModel');

class UserController {
    // 修改使用者狀態 (停權/復權)
    static async updateUserStatus(req, res) {
        try {
            const { id } = req.params; // 使用者 ID
            const { status } = req.body; // 新狀態 'normal' 或 'banned'

            if (!['normal', 'banned'].includes(status)) {
                return res.status(400).json({ message: '狀態無效' });
            }

            const updatedUser = await UserModel.updateStatus(id, status);

            if (!updatedUser) {
                return res.status(404).json({ message: '找不到使用者' });
            }

            res.json({ message: '更新成功', user: updatedUser });
        } catch (error) {
            console.error('Update status error:', error);
            res.status(500).json({ message: '更新失敗' });
        }
    }
}

module.exports = UserController;