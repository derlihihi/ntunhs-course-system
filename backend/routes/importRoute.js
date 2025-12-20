// src/routes/importRoute.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // 引用你的資料庫連線
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// 星期代碼轉換表
const dayMap = {
    '1': '週一', '2': '週二', '3': '週三', '4': '週四', '5': '週五', '6': '週六', '7': '週日'
};

// 處理節次字串 (例如 "6,7" -> start:6, end:7)
function parsePeriod(periodStr) {
    if (!periodStr) return { start: 0, end: 0, raw: '' };
    const parts = periodStr.toString().split(',').map(Number);
    if (parts.length === 0) return { start: 0, end: 0, raw: periodStr };
    return {
        start: Math.min(...parts),
        end: Math.max(...parts),
        raw: periodStr
    };
}

// 定義匯入的 API
// 用法: 瀏覽器或 Postman 打 POST http://localhost:8000/api/quick-import
router.post('/', async (req, res) => {
    const results = [];
    // 請確認你的 CSV 檔名與路徑
    const filePath = path.join(__dirname, '../../data.csv'); 

    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: '找不到 data.csv，請確認檔案是否在根目錄！' });
    }

    console.log('🚀 開始讀取 CSV...');

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            console.log(`📂 讀取完成，共有 ${results.length} 筆資料，準備寫入 DB...`);
            
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');

                for (const row of results) {
                    const periodData = parsePeriod(row['上課節次']);
                    const dayStr = dayMap[row['上課星期']] || row['上課星期'];
                    const fullNote = `${row['課表備註'] || ''} ${row['課程中文摘要'] || ''}`.trim();

                    // 修正後的 SQL：移除了 course_name_en
                    const insertQuery = `
                        INSERT INTO courses (
                            year_term, course_code, course_name, 
                            teacher, department, grade, class_group,
                            course_type, credits, location,
                            day_of_week, period_raw, period_start, period_end,
                            current_students, note
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    `;

                    const values = [
                        row['學期'],                        // $1
                        row['科目代碼(新碼全碼)'],          // $2
                        row['科目中文名稱'],                // $3
                        // 移除英文名稱
                        row['授課教師姓名'],                // $4
                        row['系所代碼'],                    // $5
                        row['年級'],                        // $6
                        row['上課班組'],                    // $7
                        row['課別名稱'],                    // $8
                        parseInt(row['學分數'] || 0),       // $9
                        row['上課地點'],                    // $10
                        dayStr,                             // $11
                        periodData.raw,                     // $12
                        periodData.start,                   // $13
                        periodData.end,                     // $14
                        parseInt(row['上課人數'] || 0),     // $15
                        fullNote                            // $16
                    ];

                    await client.query(insertQuery, values);
                }

                await client.query('COMMIT');
                console.log('✅ 全部匯入成功！');
                res.json({ message: `成功匯入 ${results.length} 筆課程資料！` });

            } catch (err) {
                await client.query('ROLLBACK');
                console.error('❌ 匯入失敗:', err);
                res.status(500).json({ message: '匯入失敗', error: err.message });
            } finally {
                client.release();
            }
        });
});

module.exports = router;