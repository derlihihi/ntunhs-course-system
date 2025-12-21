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

            // ============================================
            // 🛑 這裡就是「後端警衛」！
            // ============================================
            
            // 1. 去資料庫查這個人現在的最新狀態
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({ message: '找不到使用者' });
            }

            // 2. 檢查是否被停權
            if (user.status === 'banned') {
                console.log(`⛔️ 攔截到停權帳號發言嘗試: ${user.name}`);
                return res.status(403).json({ message: '您的帳號已被停權，禁止發言！' });
            }

            // ============================================

            // 3. 通過檢查，才准寫入資料庫
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
            // 呼叫 Model
            const posts = await ForumModel.getPostsByCourseId(courseId);
            res.json(posts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '取得留言失敗' });
        }
    }
    static async deletePost(req, res) {
        try {
            const { id } = req.params;
            await ForumModel.deletePost(id);
            res.json({ message: '留言已刪除' });
        } catch (error) {
            console.error('Delete post error:', error);
            res.status(500).json({ message: '刪除失敗' });
        }
    }
}

module.exports = ForumController;