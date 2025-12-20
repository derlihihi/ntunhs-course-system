// src/models/courseModel.js
const pool = require('../config/db');

class CourseModel {
    /**
     * 根據前端的 SearchFilters 物件進行動態查詢
     * @param {Object} filters - 前端傳來的篩選條件
     */
    static async searchCourses(filters) {
        // 1. 初始 SQL
        let query = `
            SELECT 
                id, 
                course_code, 
                year_term AS semester, 
                class_group, 
                course_name AS name, 
                department, 
                grade, 
                teacher, 
                credits, 
                day_of_week, 
                period_raw, 
                location, 
                current_students,
                max_students,
                course_type AS type
            FROM courses
            WHERE 1=1
        `;

        const values = [];
        let counter = 1;

        // 2. 動態加入條件 (如果前端有傳值才加入 WHERE)

        // 學期 (semester)
        if (filters.semester) {
            query += ` AND year_term = $${counter++}`;
            values.push(filters.semester);
        }

        // 系所 (department)
        if (filters.department) {
            query += ` AND department = $${counter++}`;
            values.push(filters.department);
        }

        // 年級 (grades) - 陣列處理: WHERE grade = ANY($n)
        if (filters.grades && filters.grades.length > 0) {
            // 前端傳來的是 "3年級"，如果資料庫只存 "3"，這裡需要處理一下
            // 假設資料庫存的是 "3"，我們把 "年級" 兩個字去掉
            const cleanGrades = filters.grades.map(g => g.replace('年級', ''));
            query += ` AND grade = ANY($${counter++}::text[])`;
            values.push(cleanGrades);
        }

        // 課別 (types) - 例如 ['專業必修(系所)']
        if (filters.types && filters.types.length > 0) {
            query += ` AND course_type = ANY($${counter++}::text[])`;
            values.push(filters.types);
        }

        // 星期 (days) - 例如 ['週一', '週五']
        if (filters.days && filters.days.length > 0) {
            query += ` AND day_of_week = ANY($${counter++}::text[])`;
            values.push(filters.days);
        }

        // 節次 (periods) - 這比較複雜，通常用模糊搜尋或陣列交集
        // 這裡示範簡單作法：只要該課程的 period_raw 有包含查詢的任一節次即可
        // 前端傳來: "節02 (09:10~10:00)" -> 我們只取 "02"
        if (filters.periods && filters.periods.length > 0) {
        // 1. 資料清洗：把 "節03 (xxx)" 變成 "3" (移除前面的0)
        const cleanPeriods = filters.periods.map(p => {
            const numStr = p.substring(1, 3); // 取出 "03"
            return parseInt(numStr, 10).toString(); // 轉成數字再轉回字串: "03" -> 3 -> "3"
        });

        // 2. SQL 魔法：使用 && (Overlap) 運算子
        // string_to_array(period_raw, ',') 會把資料庫裡的 "3,4" 變成陣列 ['3', '4']
        // $n::text[] 會把前端傳來的 ['3', '4'] 變成 SQL 陣列
        query += ` AND string_to_array(period_raw, ',') && $${counter++}::text[]`;
        
        values.push(cleanPeriods);
    }

        // 教師姓名 (模糊搜尋)
        if (filters.teacherName) {
            query += ` AND teacher LIKE $${counter++}`;
            values.push(`%${filters.teacherName}%`);
        }

        // 課程名稱 (模糊搜尋)
        if (filters.courseName) {
            query += ` AND course_name LIKE $${counter++}`;
            values.push(`%${filters.courseName}%`);
        }
        
        // 教室代碼
        if (filters.classroomId) {
            query += ` AND location LIKE $${counter++}`;
            values.push(`%${filters.classroomId}%`);
        }

        // 排序：預設依年級和科目代碼排序
        query += ` ORDER BY grade ASC, course_code ASC`;

        console.log('SQL Query:', query); // 開發時除錯用
        console.log('Values:', values);

        const { rows } = await pool.query(query, values);
        return rows;
    }

    // 取得單一課程詳情 (點擊討論區時可能會用到)
    static async findById(id) {
        const query = `SELECT * FROM courses WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = CourseModel;