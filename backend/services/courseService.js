// src/services/courseService.js
const CourseModel = require('../models/courseModel');

class CourseService {
    static async search(filters) {
        const courses = await CourseModel.searchCourses(filters);

        // 格式轉換：Database -> Frontend format
        return courses.map(course => ({
            id: course.id.toString(), // 確保是字串
            courseCode: course.course_code, // 額外回傳代碼
            semester: course.semester,
            classGroup: course.class_group || '',
            name: course.name,
            department: course.department,
            grade: course.grade,
            teacher: course.teacher,
            credits: course.credits,
            
            // 組合時間字串： "週一" + "02,03,04" -> "一 / 02,03,04"
            time: `${course.day_of_week?.replace('週', '') || ''} / ${course.period_raw || ''}`,
            
            location: course.location,
            
            // 組合容量字串： "22/60"
            capacity: `${course.current_students || 0}/${course.max_students || 0}`,
            
            type: course.type
        }));
    }
}

module.exports = CourseService;