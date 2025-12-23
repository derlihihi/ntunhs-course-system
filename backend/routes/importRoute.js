// src/routes/importRoute.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer'); // 引入 multer 處理檔案上傳

// 設定 multer：將上傳的檔案暫存在 uploads/ 資料夾 (或系統暫存區)
const upload = multer({ dest: 'uploads/' });

// 星期代碼轉換表
const dayMap = {
    '1': '週一', '2': '週二', '3': '週三', '4': '週四', '5': '週五', '6': '週六', '7': '週日'
};

// 處理節次字串
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

// POST /api/quick-import
// 使用 upload.single('file') 來接收前端傳來的 name="file" 的檔案
router.post('/', upload.single('file'), async (req, res) => {
    
    // 1. 檢查是否有檔案
    if (!req.file) {
        return res.status(400).json({ message: '請上傳 CSV 檔案' });
    }

    const filePath = req.file.path; // 暫存檔案路徑
    const results = [];

    console.log(`🚀 收到檔案: ${req.file.originalname}, 開始解析 CSV...`);

    try {
        // 2. 讀取並解析 CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`📂 解析完成，共有 ${results.length} 筆資料，準備寫入 DB...`);

        // 3. 開始寫入資料庫
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // 先清空舊資料 (可選，看你要不要覆蓋)
            // await client.query('TRUNCATE TABLE courses RESTART IDENTITY CASCADE');

            let successCount = 0;

            for (const row of results) {
                // 簡單防呆：如果沒有科目代碼就跳過
                if (!row['科目代碼(新碼全碼)']) continue;

                const periodData = parsePeriod(row['上課節次']);
                const dayStr = dayMap[row['上課星期']] || row['上課星期'];
                const fullNote = `${row['課表備註'] || ''} ${row['課程中文摘要'] || ''}`.trim();

                // 檢查是否已存在 (避免重複錯誤，使用 ON CONFLICT UPDATE 或忽略)
                // 這裡示範基本的 INSERT (如果 course_code 重複可能會報錯，建議你的 DB 有設 course_code 為 unique 嗎？)
                // 為了安全，我們改用 UPSERT (存在則更新，不存在則新增)
                const query = `
                    INSERT INTO courses (
                        year_term, course_code, course_name, 
                        teacher, department, grade, class_group,
                        course_type, credits, location,
                        day_of_week, period_raw, period_start, period_end,
                        current_students, note, max_students
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                `;

                const values = [
                    row['學期'] || '',
                    row['科目代碼(新碼全碼)'],
                    row['科目中文名稱'] || '',
                    row['授課教師姓名'] || '',
                    row['系所代碼'] || '',
                    row['年級'] || '',
                    row['上課班組'] || '',
                    row['課別名稱'] || '',
                    parseInt(row['學分數'] || 0),
                    row['上課地點'] || '',
                    dayStr || '',
                    periodData.raw || '',
                    periodData.start || 0,
                    periodData.end || 0,
                    parseInt(row['上課人數'] || 0),
                    fullNote,
                    parseInt(row['限修人數'] || 60) // 補上 max_students
                ];

                await client.query(query, values);
                successCount++;
            }

            await client.query('COMMIT');
            console.log(`✅ 成功處理 ${successCount} 筆資料`);
            
            // 刪除暫存檔案
            fs.unlinkSync(filePath);

            res.json({ 
                success: true, 
                message: `成功匯入 ${successCount} 筆課程資料！`,
                total: results.length,
                processed: successCount
            });

        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('❌ 匯入失敗:', err);
        // 確保刪除暫存檔案
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: '匯入失敗', error: err.message });
    }
});

module.exports = router;