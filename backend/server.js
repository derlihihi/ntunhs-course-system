// server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const createTables = require('./models/initTables');
require('dotenv').config();
const importRoute = require('./routes/importRoute');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 掛載路由
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quick-import', importRoute);
createTables().then(() => {
    app.listen(port, () => {
        console.log(`🚀 Server is running on port ${port}`);
    });
});