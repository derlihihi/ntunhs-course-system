'use client'

import { MapPin, Plus, Check, MessageCircle } from 'lucide-react'

interface CourseProps {
  course: any;
  isAdded: boolean;
  onToggle: (course: any) => void;
  onLocationClick: (location: string) => void;
  onDiscussionClick: (course: any) => void;
}

export default function CourseListItem({ course, isAdded, onToggle, onLocationClick, onDiscussionClick,}: CourseProps) {
  return (
    <div className="group bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 py-3 px-4 flex items-center gap-4 text-sm text-gray-700">
      
      {/* 1. 學期 */}
      <div className="w-14 font-mono font-bold text-gray-900 flex-shrink-0">{course.semester}</div>

      {/* 2. 系所 */}
      <div className="w-24 truncate flex-shrink-0" title={course.department}>{course.department}</div>

      {/* 3. 年級 */}
      <div className="w-12 text-center flex-shrink-0">{course.grade}年級</div>

      {/* 4. 班組 */}
      <div className="w-12 text-center font-bold text-gray-900 flex-shrink-0">{course.classGroup}</div>

      {/* 5. 代碼 */}
      <div className="w-16 font-mono text-gray-500 flex-shrink-0">{course.id}</div>

      {/* 6. 課程名稱 */}
      <div className="flex-1 min-w-[200px] flex items-center gap-2">
        <span className="font-bold text-gray-900 truncate" title={course.name}>
          {course.name}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0
          ${course.type === '必修' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
          {course.type}
        </span>
      </div>

      {/* 7. 教師 */}
      <div className="w-20 truncate flex-shrink-0" title={course.teacher}>{course.teacher}</div>

      {/* 8. 學分 */}
      <div className="w-12 text-center flex-shrink-0">{course.credits}</div>

      {/* 9. 時間 */}
      <div className="w-28 truncate text-xs font-mono flex-shrink-0" title={course.time}>{course.time}</div>

      {/* 10. 地點 */}
      <div className="w-20 flex-shrink-0">
        <button 
            onClick={(e) => { e.stopPropagation(); onLocationClick(course.location); }}
            className="flex items-center gap-1 text-blue-600 hover:underline truncate w-full"
        >
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{course.location}</span>
        </button>
      </div>

      {/* 11. 人數 */}
      <div className="w-16 text-xs text-gray-500 text-center flex-shrink-0">{course.capacity}</div>

      {/* 12. 討論區 (修改這裡) */}
      <div className="w-12 flex justify-center flex-shrink-0">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); // 避免觸發整行的點擊 (如果未來有做)
            onDiscussionClick(course); 
          }}
          className="text-gray-400 hover:text-black transition hover:scale-110 p-1"
        >
            <MessageCircle className="w-4 h-4" />
        </button>
      </div>

      {/* 13. 操作按鈕 (Apple 風格：黑 vs 淺灰) */}
      <div className="w-24 flex justify-end flex-shrink-0">
        {isAdded ? (
          // 狀態：已加入 (淺灰色背景，看起來像「已完成」，點擊可取消)
          <button 
            onClick={() => onToggle(course)}
            className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold hover:bg-gray-200 hover:text-gray-900 transition active:scale-95 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            已選
          </button>
        ) : (
          // 狀態：未加入 (黑色背景，強調動作)
          <button 
            onClick={() => onToggle(course)}
            className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition active:scale-95 flex items-center gap-1 shadow-md shadow-gray-200"
          >
            <Plus className="w-3 h-3" />
            加入
          </button>
        )}
      </div>

    </div>
  )
}