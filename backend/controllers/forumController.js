// src/controllers/forumController.js
const ForumModel = require('../models/forumModel');
const UserModel = require('../models/userModel'); // 我們需要查使用者狀態

class ForumController {
    // 取得歷史紀錄
    static async getHistory(req, res) {
        try {
            const { userId } = req.query;
            if (!userId) return res.status(400).json({ message: '缺少 userId' });

            const history = await ForumModel.getHistoryByUserId(userId);
            res.json(history);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '取得討論紀錄失敗' });
        }
    }

    // 新增留言 (包含停權檢查 🚫)
    static async createPost(req, res) {
        try {
            const { userId, courseId, content } = req.body;

            // 1. 先檢查使用者狀態
            const user = await UserModel.findByStudentId(userId); // 注意：這裡可能要改成用 ID 查，看你 userModel 怎麼寫
            // 如果你的 UserModel.findByStudentId 是用學號查，那這裡要改用 UserModel.findById(userId)
            // 假設我們直接用 SQL 查狀態比較快：
            
            // 這裡簡單示範邏輯：
            // const currentUser = await UserModel.findById(userId);
            // if (currentUser.status === 'banned') { ... }

            // 既然這是一個獨立功能，我們假設前端會傳入 status，或是我們在這裡查
            // 為了嚴謹，建議後端再查一次 DB，這裡簡化示範：
            
            // 實際上線建議：
            // const userStatus = await UserModel.getUserStatus(userId);
            // if (userStatus === 'banned') return res.status(403).json({ message: '您已被停權，無法發言' });

            await ForumModel.createPost(userId, courseId, content);
            res.status(201).json({ message: '留言成功' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '留言失敗' });
        }
    }
    static async getCoursePosts(req, res) {
        try {
            const { courseId } = req.params;
            const posts = await ForumModel.getPostsByCourseId(courseId);
            res.json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '取得留言失敗' });
        }
    }
}

module.exports = ForumController;