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
    static async createCourse(data) {
        const query = `
            INSERT INTO courses (
                year_term, course_code, course_name, department, 
                grade, class_group, teacher, credits, 
                day_of_week, period_raw, location, 
                course_type, note, max_students
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;
        
        const values = [
            data.semester,      // 1132
            data.id,            // 科目代碼 (注意：前端傳來的 key 可能是 id 或 courseCode)
            data.name,          // 課程名稱
            data.department,    // 系所
            data.grade,         // 年級
            data.classGroup || '', // 班組
            data.teacher,       // 教師
            parseInt(data.credits), 
            data.day,           // 週一
            data.periods,       // 02,03,04 (原始字串)
            data.location,
            data.type,          // 必修/選修
            data.note || '',    // 備註
            parseInt(data.capacity || 60) // 人數上限
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }
static async updateCourse(id, data) {
        // 使用 id (資料庫 PK) 來更新
        // 注意：這裡假設前端傳來的 id 是資料庫的 primary key (例如 1, 2, 3)
        // 如果是用課程代碼更新，要把 WHERE id = $15 改成 WHERE course_code = $15
        
        const query = `
            UPDATE courses 
            SET 
                year_term = $1, 
                course_code = $2, 
                course_name = $3, 
                department = $4, 
                grade = $5, 
                class_group = $6, 
                teacher = $7, 
                credits = $8, 
                day_of_week = $9, 
                period_raw = $10, 
                location = $11, 
                course_type = $12, 
                current_students = $13,
                max_students = $14
            WHERE id = $15
            RETURNING *
        `;
        
        const values = [
            data.semester,
            data.courseCode, // 課程代碼 (例如 "0058")
            data.name,
            data.department,
            data.grade,
            data.classGroup,
            data.teacher,
            parseInt(data.credits),
            data.day,
            data.periods,
            data.location,
            data.type,
            parseInt(data.currentStudents),
            parseInt(data.maxStudents),
            id // WHERE 條件
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }
    static async deleteCourse(id) {
    const query = `DELETE FROM courses WHERE id = $1`;
    await pool.query(query, [id]);
}
static async importCourses(coursesData) {
        const client = await pool.connect();
        let successCount = 0;
        let skippedCount = 0;

        try {
            await client.query('BEGIN'); // 開啟交易

            for (const course of coursesData) {
                // 1. 檢查必填欄位 (後端再防呆一次)
                if (!course.id || !course.name) {
                    skippedCount++;
                    continue;
                }

                // 2. 嘗試用 ID 找舊資料
                // 注意：這裡假設 course.id 對應資料庫的 course_code (如果是 PK 則是 id)
                // 根據你的 CSV，course.id 應該是 'course_code' (例如 0058)
                const checkQuery = `SELECT * FROM courses WHERE course_code = $1`;
                const { rows } = await client.query(checkQuery, [course.id]);
                const existing = rows[0];

                // 準備要寫入的欄位 (這裡要跟資料庫欄位對齊)
                const newValues = [
                    course.semester || '', 
                    course.id, 
                    course.name, 
                    course.department || '', 
                    course.grade || '', 
                    course.classGroup || '', 
                    course.teacher || '', 
                    parseInt(course.credits) || 0, 
                    course.time ? course.time.split('/')[0].trim() : '', // day
                    course.time ? course.time.split('/')[1]?.trim() || '' : '', // periods
                    course.location || '', 
                    course.type || '',
                    60 // 預設人數上限
                ];

                if (existing) {
                    // 3. 比對內容是否完全一樣 (這裡就是你要求的邏輯)
                    // 我們把新舊資料都轉成字串來比對關鍵欄位
                    // 注意：資料庫取出的欄位名稱是 snake_case
                    const isIdentical = 
                        existing.course_name === course.name &&
                        existing.teacher === course.teacher &&
                        existing.credits === (parseInt(course.credits) || 0) &&
                        // ... 其他你想比對的欄位 ...
                        true; // 簡化示範

                    if (isIdentical) {
                        skippedCount++;
                        continue; // 完全一樣就跳過
                    }

                    // 4. 不一樣 -> UPDATE (更新)
                    const updateQuery = `
                        UPDATE courses SET 
                            year_term=$1, course_name=$3, department=$4, grade=$5, class_group=$6, 
                            teacher=$7, credits=$8, day_of_week=$9, period_raw=$10, location=$11, course_type=$12,max_students=$13
                        WHERE course_code = $2
                    `;
                    await client.query(updateQuery, newValues);
                    successCount++;

                } else {
                    // 5. 沒找到 -> INSERT (新增)
                    const insertQuery = `
                        INSERT INTO courses (
                            year_term, course_code, course_name, department, grade, class_group, 
                            teacher, credits, day_of_week, period_raw, location, course_type, max_students
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    `;
                    await client.query(insertQuery, newValues);
                    successCount++;
                }
            }

            await client.query('COMMIT'); // 提交交易
            return { success: successCount, skipped: skippedCount };

        } catch (e) {
            await client.query('ROLLBACK'); // 發生錯誤全部復原
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = CourseModel;