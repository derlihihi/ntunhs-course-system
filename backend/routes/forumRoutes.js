const express = require('express');
const router = express.Router();
const ForumController = require('../controllers/forumController');

// GET /api/forum/history?userId=1
router.get('/history', ForumController.getHistory);

// POST /api/forum/post (之後 DiscussionModal 用)
router.post('/post', ForumController.createPost);
router.get('/course/:courseId', ForumController.getCoursePosts);

module.exports = router;