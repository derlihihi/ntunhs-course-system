// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// 取得所有資料 (Dashboard 初始化用)
// 為了效能，我們可以寫一支 API 一次回傳所有必要的數據，或者分開打
// 這裡示範分開打比較單純，或者寫一個 dashboard-stats

router.get('/stats', AdminController.getDashboardStats); // 取得統計數據
router.get('/users', AdminController.getAllUsers);       // 取得所有使用者
router.get('/comments', AdminController.getAllComments); // 取得所有留言

// 課程相關操作通常在 courseRoutes，但如果需要管理者特權的可以放這裡
// 為了保持一致性，建議課程相關的 CRUD 還是放在 courseRoutes，但要有 middleware 擋權限
// 這裡我們先專注於 Dashboard 需要的資料

module.exports = router;