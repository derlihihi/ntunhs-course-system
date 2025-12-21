'use client'

import { MapPin, Plus, Check, MessageCircle } from 'lucide-react'

interface CourseProps {
  course: any;
  isAdded: boolean;
  onToggle: (course: any) => void;
  onLocationClick: (location: string) => void;
  onDiscussionClick: (course: any) => void;
}

export default function CourseListItem({ course, isAdded, onToggle, onLocationClick, onDiscussionClick }: CourseProps) {
  return (
    <div className="group bg-[var(--card-bg)] border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors duration-150 py-3 px-4 flex items-center gap-4 text-sm text-[var(--main-text)]">
      
      {/* 1. 學期 */}
      <div className="w-14 font-mono font-bold text-[var(--main-text)] flex-shrink-0">{course.semester}</div>

      {/* 2. 系所 */}
      <div className="w-24 truncate flex-shrink-0" title={course.department}>{course.department}</div>

      {/* 3. 年級 */}
      <div className="w-12 text-center flex-shrink-0">{course.grade}年級</div>

      {/* 4. 班組 */}
      <div className="w-12 text-center font-bold text-[var(--main-text)] flex-shrink-0">{course.classGroup}</div>

      {/* 5. 代碼 */}
      <div className="w-16 font-mono text-[var(--sub-text)] flex-shrink-0">{course.id}</div>

      {/* 6. 課程名稱 */}
      <div className="flex-1 min-w-[200px] flex items-center gap-2">
        <span className="font-bold text-[var(--main-text)] truncate" title={course.name}>
          {course.name}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0
          ${course.type === '必修' 
            ? 'bg-red-100/30 text-red-600 border-red-300/50' 
            : 'bg-green-100/30 text-green-600 border-green-300/50'}`}>
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
            className="flex items-center gap-1 text-blue-600 hover:underline truncate w-full transition"
        >
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{course.location}</span>
        </button>
      </div>

      {/* 11. 人數 */}
      <div className="w-16 text-xs text-[var(--sub-text)] text-center flex-shrink-0">{course.capacity}</div>

      {/* 12. 討論區 */}
      <div className="w-12 flex justify-center flex-shrink-0">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDiscussionClick(course); 
          }}
          className="text-[var(--sub-text)] hover:text-[var(--main-text)] transition hover:scale-110 p-1"
        >
            <MessageCircle className="w-4 h-4" />
        </button>
      </div>

      {/* 13. 操作按鈕 */}
      <div className="w-24 flex justify-end flex-shrink-0">
        {isAdded ? (
          // 已加入狀態
          <button 
            onClick={() => onToggle(course)}
            className="px-4 py-1.5 rounded-full bg-[var(--hover-bg)] text-[var(--sub-text)] text-xs font-bold hover:bg-[var(--hover-bg)]/80 hover:text-[var(--main-text)] transition active:scale-95 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            已選
          </button>
        ) : (
          // 未加入狀態（主動作按鈕）
          <button 
            onClick={() => onToggle(course)}
            className="px-4 py-1.5 rounded-full bg-[var(--accent-bg)] text-white text-xs font-bold hover:opacity-90 transition active:scale-95 flex items-center gap-1 shadow-md"
          >
            <Plus className="w-3 h-3" />
            加入
          </button>
        )}
      </div>

    </div>
  )
}