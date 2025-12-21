// src/controllers/courseController.js
const CourseService = require('../services/courseService');
const CourseModel = require('../models/courseModel');
class CourseController {
    // 處理 POST /api/courses/search
    // 為什麼用 POST？因為 filters 包含很多陣列，用 GET URL 參數會太長且難處理
    static async searchCourses(req, res) {
        try {
            const filters = req.body; // 從 Body 拿篩選條件
            const results = await CourseService.search(filters);
            
            res.status(200).json(results);
        } catch (error) {
            console.error('Search Error:', error);
            res.status(500).json({ message: '伺服器查詢錯誤' });
        }
    }
    static async createCourse(req, res) {
        try {
            const newCourseData = req.body;
            
            // 簡易防呆：檢查必填
            if (!newCourseData.id || !newCourseData.name) {
                return res.status(400).json({ message: '課程代碼與名稱為必填！' });
            }

            // 呼叫 Model 寫入
            const createdCourse = await CourseModel.createCourse(newCourseData);
            
            res.status(201).json({ 
                message: '課程新增成功', 
                course: createdCourse 
            });
        } catch (error) {
            console.error('新增失敗:', error);
            // 處理 Unique Constraint (例如代碼重複)
            if (error.code === '23505') { 
                return res.status(409).json({ message: '課程代碼已存在，請勿重複新增！' });
            }
            res.status(500).json({ message: '新增失敗，請檢查資料格式' });
        }
    }
    static async updateCourse(req, res) {
        try {
            const { id } = req.params; // 網址參數上的 ID (PK)
            const updatedData = req.body;

            // 呼叫 Model 更新
            const course = await CourseModel.updateCourse(id, updatedData);

            if (!course) {
                return res.status(404).json({ message: '找不到該課程' });
            }

            res.json({ message: '更新成功', course });
        } catch (error) {
            console.error('更新失敗:', error);
            res.status(500).json({ message: '更新失敗，請檢查資料格式' });
        }
    }
    static async deleteCourse(req, res) {
    try {
        const { id } = req.params;
        
        // 假設 Model 有 deleteCourse 方法
        await CourseModel.deleteCourse(id); 
        
        res.json({ message: '刪除成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '刪除失敗' });
    }
}
static async importCourses(req, res) {
        try {
            const coursesData = req.body;
            
            if (!Array.isArray(coursesData)) {
                return res.status(400).json({ message: '格式錯誤：必須是陣列' });
            }

            const result = await CourseModel.importCourses(coursesData);
            
            res.json({ 
                message: '匯入完成', 
                result 
            });
        } catch (error) {
            console.error('Import error:', error);
            res.status(500).json({ message: '匯入失敗，請檢查資料格式' });
        }
    }
}

module.exports = CourseController;