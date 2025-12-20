'use client'

import { useState, useEffect, useRef } from 'react'
import { Pin, Eye, EyeOff, Trash2, Download, Lock, Plus, AlertCircle, X, Search, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import ConfirmModal from './ConfirmModal'

interface Course {
  id: string
  name: string
  time: string 
  credits: number
  teacher: string
  location: string
  type: string // 必修/選修/通識
  isPinned?: boolean
  isHidden?: boolean
}

interface PreSelectionProps {
  initialCourses: any[]
  user: any
  onRemoveFromGlobalCart: (id: string) => void
  onOpenLogin: () => void
  onAddCourse: (course: any) => void
}

// 課程配色邏輯
const getCourseColor = (type: string, isConflict: boolean) => {
  if (isConflict) return 'bg-red-50 text-red-600 border-red-200'
  if (type === '必修') return 'bg-blue-50 text-blue-700 border-blue-100'
  if (type === '選修') return 'bg-orange-50 text-orange-700 border-orange-100'
  if (type === '通識') return 'bg-green-50 text-green-700 border-green-100'
  return 'bg-gray-50 text-gray-700 border-gray-100'
}

export default function PreSelection({ initialCourses, user, onRemoveFromGlobalCart, onOpenLogin, onAddCourse }: PreSelectionProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const scheduleRef = useRef<HTMLDivElement>(null)
  
  // 顯示設定
  const [showWeekend, setShowWeekend] = useState(false)
  const [showTimeDetail, setShowTimeDetail] = useState(true)
  
  // 刪除確認
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)

  // 智能選課 Hover 狀態
  const [hoverSlot, setHoverSlot] = useState<{day: number, period: number} | null>(null)

  // 選中的時段 (控制左側面板切換)
  const [selectedSlot, setSelectedSlot] = useState<{day: number, period: number} | null>(null)
  
  // 推薦課程清單 (從後端抓取)
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [isLoadingRecs, setIsLoadingRecs] = useState(false)

  // 同步外部傳入的課程
  useEffect(() => {
    setCourses(prev => {
      return initialCourses.map(newCourse => {
        const exist = prev.find(p => p.id === newCourse.id)
        return exist ? { ...newCourse, isPinned: exist.isPinned, isHidden: exist.isHidden } : { ...newCourse, isPinned: false, isHidden: false }
      })
    })
  }, [initialCourses])

  // 🔥 關鍵邏輯：當使用者點選某個格子時，去後端抓取該時段的課程
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedSlot) return;

      setIsLoadingRecs(true);
      setRecommendations([]);

      // 1. 轉換天數： 1 -> "週一"
      const dayMap = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
      const targetDay = dayMap[selectedSlot.day - 1];

      // 2. 轉換節次： 3 -> "節03" (配合後端邏輯: substring(1,3))
      // 確保格式是兩位數，例如 "03", "10"
      const periodStr = selectedSlot.period < 10 ? `0${selectedSlot.period}` : `${selectedSlot.period}`;
      const targetPeriod = `節${periodStr}`; 

      // 3. 準備搜尋條件 (Payload)
      const filters = {
        semester: '1132', // ⚠️ 注意：這裡預設搜 1141，如果你的 CSV 是其他學期請修改
        days: [targetDay],
        periods: [targetPeriod],
        // 其他欄位留空
        department: '',
        systems: [],
        grades: [],
        types: [],
        categories: [],
        teacherId: '',
        teacherName: '',
        courseId: '',
        courseName: '',
        classroomId: ''
      };

      try {
        const res = await fetch('http://localhost:8000/api/courses/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filters)
        });
        
        if (res.ok) {
          const data = await res.json();
          // 過濾掉已經在課表中的課程，避免重複顯示
          const existingIds = courses.map(c => c.id);
          const filteredData = data.filter((c: any) => !existingIds.includes(c.id));
          setRecommendations(filteredData);
        }
      } catch (error) {
        console.error('取得推薦課程失敗', error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [selectedSlot, courses]); // courses 變動時也重新過濾 (例如剛加了一堂課，推薦清單要把它拿掉)


  // --- 權限控管 ---
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up h-[60vh]">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">預先選課功能已鎖定</h2>
        <p className="text-gray-500 mb-8">請先登入以檢視您的排課結果與匯出課表</p>
        <button onClick={onOpenLogin} className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition active:scale-95">
          登入 / 註冊
        </button>
      </div>
    )
  }

  // --- 邏輯函數 ---
  const togglePin = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c))
  }

  const toggleHide = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, isHidden: !c.isHidden } : c))
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      onRemoveFromGlobalCart(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleSlotClick = (day: number, period: number) => {
    if (selectedSlot?.day === day && selectedSlot?.period === period) {
      setSelectedSlot(null)
    } else {
      setSelectedSlot({ day, period })
    }
  }

  const totalVisibleCredits = courses.filter(c => !c.isHidden).reduce((acc, c) => acc + c.credits, 0)

  const handleExportImage = async () => {
    if (scheduleRef.current) {
      try {
        const canvas = await html2canvas(scheduleRef.current, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true 
        })
        const image = canvas.toDataURL("image/png")
        const link = document.createElement('a')
        link.href = image
        link.download = `${user.name}_1141課表.png`
        link.click()
      } catch (err) {
        alert('圖片匯出失敗，請稍後再試')
      }
    }
  }

  const parseTime = (timeStr: string) => {
    try {
      if (!timeStr) return { day: 0, periods: [] }
      const [dayPart, periodPart] = timeStr.split('/').map(s => s.trim())
      const dayMap: { [key: string]: number } = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '日': 7 }
      const day = dayMap[dayPart] || 0
      const periods = periodPart ? periodPart.split(',').map(p => parseInt(p)) : []
      return { day, periods }
    } catch (e) {
      return { day: 0, periods: [] }
    }
  }

  const sortedCourses = [...courses].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0
    return a.isPinned ? -1 : 1
  })

  const displayDays = showWeekend ? ['一', '二', '三', '四', '五', '六', '日'] : ['一', '二', '三', '四', '五']
  
  const timeMap: {[key: number]: string} = {
    1: '08:10', 2: '09:10', 3: '10:10', 4: '11:10',
    5: '12:40', 6: '13:40', 7: '14:40', 8: '15:40',
    9: '16:40', 10: '17:40', 11: '18:35', 12: '19:30', 13: '20:25', 14: '21:20'
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-fade-in-up">
        
        {/* === 左側面板 (根據 selectedSlot 切換內容) === */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-300">
            
            {selectedSlot ? (
              // 模式 B：智能推薦列表 (真實資料)
              <>
                <div className="p-4 border-b border-gray-100 bg-blue-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-blue-900">週{['一','二','三','四','五','六','日'][selectedSlot.day-1]}第{selectedSlot.period}節 推薦課程</h3>
                  </div>
                  <button onClick={() => setSelectedSlot(null)} className="p-1.5 hover:bg-blue-100 rounded-full text-blue-400 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-blue-50/10">
                  {isLoadingRecs ? (
                    <div className="flex flex-col items-center justify-center h-full text-blue-300 space-y-2">
                       <Loader2 className="w-8 h-8 animate-spin" />
                       <p className="text-xs font-bold">正在搜尋適合的課程...</p>
                    </div>
                  ) : recommendations.length > 0 ? (
                    recommendations.map(course => (
                      <div key={course.id} className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-900 line-clamp-1">{course.name}</span>
                          <span className="flex-shrink-0 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded ml-2">{course.type}</span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>{course.teacher} · {course.location}</p>
                          <p>{course.time} ({course.credits}學分)</p>
                        </div>
                        <button 
                          onClick={() => {
                            onAddCourse(course) // 呼叫父層加課函式
                            // 加課後不用關閉，可以繼續加其他課
                          }}
                          className="w-full mt-3 bg-black text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> 加入此課程
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <p className="text-xs">此時段沒有其他可用課程</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // 模式 A：已選課程列表 (保持不變)
              <>
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">已選課程 ({courses.length})</h3>
                  <span className="text-[10px] text-gray-400">點擊右側格子可尋找課程</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {sortedCourses.map(course => (
                    <div key={course.id} className={`p-4 rounded-2xl border transition-all duration-200 group relative ${course.isPinned ? 'border-gray-300 bg-gray-50 shadow-inner' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'} ${course.isHidden ? 'opacity-40 grayscale' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {course.isPinned && <Pin className="w-3 h-3 text-black fill-black" />}
                          <span className="font-bold text-gray-900 line-clamp-1">{course.name}</span>
                          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${course.type === '必修' ? 'text-blue-600 border-blue-100 bg-blue-50' : course.type === '選修' ? 'text-orange-600 border-orange-100 bg-orange-50' : 'text-gray-600 border-gray-100 bg-gray-50'}`}>{course.type}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => togglePin(course.id)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition"><Pin className="w-4 h-4" /></button>
                          <button onClick={() => toggleHide(course.id)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition">{course.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                          <button onClick={() => setDeleteTarget(course)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                        <span>{course.id}</span><span>{course.time}</span><span>{course.credits} 學分</span>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-gray-300" /></div>
                      <p className="text-sm">尚未加入任何課程</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右側：視覺化課表 (保持不變) */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
             <div className="flex items-center gap-6">
                <div className="flex items-baseline gap-2"><span className="text-sm font-bold text-gray-500">預排總學分</span><span className="text-2xl font-bold text-gray-900">{totalVisibleCredits}</span></div>
                <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer hover:text-black transition"><input type="checkbox" checked={showTimeDetail} onChange={e => setShowTimeDetail(e.target.checked)} className="rounded text-black focus:ring-0 cursor-pointer w-4 h-4" />顯示時間</label>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer hover:text-black transition"><input type="checkbox" checked={showWeekend} onChange={e => setShowWeekend(e.target.checked)} className="rounded text-black focus:ring-0 cursor-pointer w-4 h-4" />顯示週末</label>
                </div>
             </div>
             <button onClick={handleExportImage} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition active:scale-95"><Download className="w-4 h-4" /> 匯出課表圖片</button>
          </div>

          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden flex flex-col relative">
            <div className="flex-1 overflow-auto" ref={scheduleRef}>
              <div className="w-full h-full min-w-[600px]"> 
                <div className={`grid gap-1 mb-2`} style={{ gridTemplateColumns: `3rem repeat(${displayDays.length}, 1fr)` }}>
                  <div className="text-center text-xs font-bold text-gray-300 py-2">節次</div>
                  {displayDays.map(day => <div key={day} className="text-center font-bold text-gray-600 text-sm bg-gray-50 rounded-lg py-2">{day}</div>)}
                </div>
                <div className={`grid gap-1 auto-rows-fr`} style={{ gridTemplateColumns: `3rem repeat(${displayDays.length}, 1fr)` }}>
                  {Array.from({ length: 14 }, (_, i) => i + 1).map(period => (
                    <>
                      <div key={`p-${period}`} className="flex flex-col items-center justify-center text-xs text-gray-400 font-mono h-24 border-t border-gray-50"><span className="font-bold text-sm text-gray-600">{period}</span>{showTimeDetail && <span className="scale-75 opacity-70 mt-1">{timeMap[period]}</span>}</div>
                      {displayDays.map((_, dayIndex) => {
                        const currentDay = dayIndex + 1
                        const activeCourses = courses.filter(c => {
                          if (c.isHidden) return false
                          const { day, periods } = parseTime(c.time)
                          return day === currentDay && periods.includes(period)
                        })
                        const isConflict = activeCourses.length > 1
                        const isHovered = hoverSlot?.day === currentDay && hoverSlot?.period === period
                        const isSelected = selectedSlot?.day === currentDay && selectedSlot?.period === period

                        return (
                          <div 
                            key={`${period}-${currentDay}`} 
                            className={`relative border-t h-24 p-1 group transition cursor-pointer
                              ${isSelected ? 'bg-blue-50/30 border-blue-200' : 'border-gray-50 hover:bg-gray-50/50'}
                            `}
                            onMouseEnter={() => setHoverSlot({ day: currentDay, period })}
                            onMouseLeave={() => setHoverSlot(null)}
                            onClick={() => handleSlotClick(currentDay, period)}
                          >
                            {/* 智能選課提示圖示 */}
                            {activeCourses.length === 0 && (isHovered || isSelected) && (
                              <div className={`absolute inset-0 flex items-center justify-center transition animate-fade-in ${isSelected ? 'text-blue-200' : 'text-gray-200'}`}>
                                <Plus className="w-6 h-6" />
                              </div>
                            )}

                            <div className="w-full h-full flex gap-1">
                              {activeCourses.map((course) => {
                                const colorClass = getCourseColor(course.type, isConflict)
                                return (
                                  <div key={course.id} className={`flex-1 rounded-xl p-2 flex flex-col justify-center text-center text-[11px] leading-tight hover:scale-[1.02] hover:shadow-md transition duration-200 border relative overflow-hidden ${colorClass}`} title={`${course.name} (${course.teacher})\n${course.location}`}>
                                    <div className="font-bold truncate w-full mb-0.5">{course.name}</div>
                                    <div className="truncate opacity-80 scale-90">{course.location}</div>
                                    {isConflict && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse m-1"></div>}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 刪除確認彈窗 */}
      {deleteTarget && (
        <ConfirmModal 
          title="移除課程"
          content={`確定要將「${deleteTarget.name}」從清單中移除嗎？這將無法復原。`}
          confirmText="確認移除"
          isDanger={true}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}