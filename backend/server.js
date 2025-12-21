// server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const createTables = require('./models/initTables');
require('dotenv').config();
const importRoute = require('./routes/importRoute');
const cartRoutes = require('./routes/cartRoutes');
const forumRoutes = require('./routes/forumRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 掛載路由
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quick-import', importRoute);
app.use('/api/cart', cartRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', require('./routes/userRoutes'));
createTables().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
});