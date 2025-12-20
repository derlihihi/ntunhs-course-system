// src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

// 取得購物車
router.get('/', CartController.getCart);

// 加入購物車
router.post('/', CartController.addToCart);

// 移除購物車 (用 ID)
router.delete('/:courseId', CartController.removeFromCart);

module.exports = router;