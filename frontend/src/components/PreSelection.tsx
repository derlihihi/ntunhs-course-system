'use client'

import { useState, useEffect, useRef } from 'react'
import { Pin, Eye, EyeOff, Trash2, Download, Lock, Plus, AlertCircle, X, Search, Loader2, Check, ChevronDown } from 'lucide-react'
import Cookies from 'js-cookie'
import ConfirmModal from './ConfirmModal'

interface Course {
  id: string
  name: string
  time: string 
  credits: number
  teacher: string
  location: string
  type: string
  semester?: string
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

const getCourseColor = (type: string, isConflict: boolean) => {
  if (isConflict) return 'bg-red-100/30 text-red-600 border-red-300/50'
  if (type === '必修') return 'bg-blue-100/30 text-blue-600 border-blue-300/50'
  if (type === '選修') return 'bg-orange-100/30 text-orange-600 border-orange-300/50'
  if (type === '通識') return 'bg-green-100/30 text-green-600 border-green-300/50'
  return 'bg-[var(--hover-bg)] text-[var(--main-text)] border-[var(--border-color)]'
}

export default function PreSelection({ initialCourses, user, onRemoveFromGlobalCart, onOpenLogin, onAddCourse }: PreSelectionProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedSemester, setSelectedSemester] = useState('1132')
  const scheduleRef = useRef<HTMLDivElement>(null)
  
  const [showWeekend, setShowWeekend] = useState(false)
  const [showTimeDetail, setShowTimeDetail] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [hoverSlot, setHoverSlot] = useState<{day: number, period: number} | null>(null)
  
  // 這個狀態控制左側是否顯示「推薦課程」，我們需要將它存入 Cookie
  const [selectedSlot, setSelectedSlot] = useState<{day: number, period: number} | null>(null)
  
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [isLoadingRecs, setIsLoadingRecs] = useState(false)
  
  // 匯出按鈕 Loading 狀態
  const [isExporting, setIsExporting] = useState(false)
  
  // 初始化標記
  const [isInitialized, setIsInitialized] = useState(false)

  // 1. 初始化：讀取 Cookies (包含推薦課程的狀態 selectedSlot)
  useEffect(() => {
    const savedSemester = Cookies.get('pre_selected_semester')
    const savedShowWeekend = Cookies.get('pre_show_weekend')
    const savedShowTimeDetail = Cookies.get('pre_show_time_detail')
    const savedSelectedSlot = Cookies.get('pre_selected_slot') // 讀取選中的格子

    if (savedSemester) setSelectedSemester(savedSemester)
    if (savedShowWeekend) setShowWeekend(savedShowWeekend === 'true')
    if (savedShowTimeDetail) setShowTimeDetail(savedShowTimeDetail === 'true')
    
    if (savedSelectedSlot) {
      try {
        setSelectedSlot(JSON.parse(savedSelectedSlot))
      } catch (e) {
        console.error('Cookie 解析失敗', e)
        Cookies.remove('pre_selected_slot')
      }
    }
    
    setIsInitialized(true)
  }, [])

  // 2. 當狀態改變時：寫入 Cookies
  useEffect(() => {
    if (isInitialized) {
      Cookies.set('pre_selected_semester', selectedSemester, { expires: 7 })
      Cookies.set('pre_show_weekend', String(showWeekend), { expires: 7 })
      Cookies.set('pre_show_time_detail', String(showTimeDetail), { expires: 7 })
      
      // 如果有選中格子，就存起來；否則移除 Cookie
      if (selectedSlot) {
        Cookies.set('pre_selected_slot', JSON.stringify(selectedSlot), { expires: 7 })
      } else {
        Cookies.remove('pre_selected_slot')
      }
    }
  }, [selectedSemester, showWeekend, showTimeDetail, selectedSlot, isInitialized])

  // 同步外部傳入的課程
  useEffect(() => {
    setCourses(prev => {
      return initialCourses.map(newCourse => {
        const exist = prev.find(p => p.id === newCourse.id)
        return exist ? { ...newCourse, isPinned: exist.isPinned, isHidden: exist.isHidden } : { ...newCourse, isPinned: false, isHidden: false }
      })
    })
  }, [initialCourses])

  // 抓取推薦課程 (當 selectedSlot 恢復時，這裡會自動觸發，從而恢復推薦列表)
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedSlot) return;

      setIsLoadingRecs(true);
      setRecommendations([]);

      const dayMap = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
      const targetDay = dayMap[selectedSlot.day - 1];
      const periodStr = selectedSlot.period < 10 ? `0${selectedSlot.period}` : `${selectedSlot.period}`;
      const targetPeriod = `節${periodStr}`; 

      const filters = {
        semester: selectedSemester, 
        days: [targetDay],
        periods: [targetPeriod],
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
          setRecommendations(data);
        }
      } catch (error) {
        console.error('取得推薦課程失敗', error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [selectedSlot, selectedSemester]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up h-[60vh]">
        <div className="w-20 h-20 bg-[var(--hover-bg)] rounded-3xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-[var(--sub-text)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--main-text)] mb-2">預先選課功能已鎖定</h2>
        <p className="text-[var(--sub-text)] mb-8">請先登入以檢視您的排課結果與匯出課表</p>
        <button onClick={onOpenLogin} className="bg-[var(--accent-bg)] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition active:scale-95">
          登入 / 註冊
        </button>
      </div>
    )
  }

  // --- 操作邏輯 ---
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

  const currentSemesterCourses = courses.filter(c => !c.semester || c.semester === selectedSemester);
  const totalVisibleCredits = currentSemesterCourses.filter(c => !c.isHidden).reduce((acc, c) => acc + c.credits, 0)

  // 🔥 修正版圖片匯出函式
  const handleExportImage = async () => {
    if (scheduleRef.current) {
      setIsExporting(true)
      try {
        // 動態載入並處理 default export 問題
        const module = await import('html2canvas')
        const html2canvas = module.default || module

        const element = scheduleRef.current
        
        const canvas = await html2canvas(element, {
          scale: 3, // 高解析度
          useCORS: true,
          backgroundColor: '#ffffff', // 強制白底，避免透明或黑色
          logging: false,
          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          // 確保字型渲染
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById('schedule-export-target')
            if (clonedElement) {
              clonedElement.style.fontFamily = 'inherit'
            }
          }
        })

        const image = canvas.toDataURL("image/png")
        const link = document.createElement('a')
        link.href = image
        link.download = `${user.name}_${selectedSemester}_課表.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

      } catch (err) {
        console.error('Export Error:', err)
        alert('圖片匯出失敗，請查看 Console 錯誤訊息')
      } finally {
        setIsExporting(false)
      }
    } else {
      alert('無法找到課表元件')
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

  const sortedCourses = [...currentSemesterCourses].sort((a, b) => {
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
        
        {/* 左側面板 */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          <div className="flex-1 bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden flex flex-col transition-all duration-300">
            
            {selectedSlot ? (
              // 模式 B：智能推薦列表
              <>
                <div className="p-4 border-b border-[var(--border-color)] bg-blue-100/20 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-blue-700">
                      {selectedSemester} 週{['一','二','三','四','五','六','日'][selectedSlot.day-1]}第{selectedSlot.period}節 推薦
                    </h3>
                  </div>
                  <button onClick={() => setSelectedSlot(null)} className="p-1.5 hover:bg-[var(--hover-bg)] rounded-full text-[var(--sub-text)] transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--hover-bg)]/30">
                  {isLoadingRecs ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--sub-text)] space-y-2">
                       <Loader2 className="w-8 h-8 animate-spin" />
                       <p className="text-xs font-bold">正在搜尋適合的課程...</p>
                    </div>
                  ) : recommendations.length > 0 ? (
                    recommendations.map(course => {
                      const isAdded = courses.some(c => String(c.id) === String(course.id));
                      return (
                        <div key={course.id} className={`p-4 rounded-2xl border shadow-sm transition group ${isAdded ? 'bg-[var(--hover-bg)] border-[var(--border-color)]' : 'bg-[var(--card-bg)] border-[var(--border-color)] hover:shadow-md'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`font-bold line-clamp-1 ${isAdded ? 'text-[var(--sub-text)]' : 'text-[var(--main-text)]'}`}>{course.name}</span>
                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded ml-2 bg-[var(--hover-bg)] text-[var(--sub-text)]`}>{course.type}</span>
                          </div>
                          <div className={`text-xs space-y-1 ${isAdded ? 'text-[var(--sub-text)]' : 'text-[var(--sub-text)]'}`}>
                            <p>{course.teacher} · {course.location}</p>
                            <p>{course.time} ({course.credits}學分)</p>
                          </div>
                          
                          <button 
                            disabled={isAdded}
                            onClick={() => { if (!isAdded) onAddCourse(course) }}
                            className={`w-full mt-3 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1
                              ${isAdded ? 'bg-[var(--hover-bg)] text-[var(--sub-text)] cursor-not-allowed' : 'bg-[var(--accent-bg)] text-white hover:opacity-90 active:scale-95'}`}
                          >
                            {isAdded ? <><Check className="w-3 h-3" /> 已選擇該課程</> : <><Plus className="w-3 h-3" /> 加入此課程</>}
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--sub-text)] space-y-2">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <p className="text-xs">此時段沒有其他可用課程</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // 模式 A：已選課程列表
              <>
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--hover-bg)] flex justify-between items-center">
                  <h3 className="font-bold text-[var(--main-text)]">已選課程 ({sortedCourses.length})</h3>
                  <span className="text-[10px] text-[var(--sub-text)]">學期：{selectedSemester}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {sortedCourses.map(course => (
                    <div key={course.id} className={`p-4 rounded-2xl border transition-all duration-200 group relative ${course.isPinned ? 'border-[var(--border-color)] bg-[var(--hover-bg)] shadow-inner' : 'border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--accent-color)]/50 hover:shadow-sm'} ${course.isHidden ? 'opacity-40 grayscale' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {course.isPinned && <Pin className="w-3 h-3 text-[var(--accent-bg)] fill-[var(--accent-bg)]" />}
                          <span className="font-bold text-[var(--main-text)] line-clamp-1">{course.name}</span>
                          <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded border ${course.type === '必修' ? 'text-blue-600 border-blue-300/50 bg-blue-100/30' : course.type === '選修' ? 'text-orange-600 border-orange-300/50 bg-orange-100/30' : 'text-[var(--sub-text)] border-[var(--border-color)] bg-[var(--hover-bg)]'}`}>{course.type}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => togglePin(course.id)} className="p-1.5 rounded-full hover:bg-[var(--hover-bg)] text-[var(--sub-text)] hover:text-[var(--main-text)] transition"><Pin className="w-4 h-4" /></button>
                          <button onClick={() => toggleHide(course.id)} className="p-1.5 rounded-full hover:bg-[var(--hover-bg)] text-[var(--sub-text)] hover:text-[var(--main-text)] transition">{course.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                          <button onClick={() => setDeleteTarget(course)} className="p-1.5 rounded-full hover:bg-red-100/50 text-[var(--sub-text)] hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-[var(--sub-text)] mt-2 font-mono">
                        <span>{course.id}</span><span>{course.time}</span><span>{course.credits} 學分</span>
                      </div>
                    </div>
                  ))}
                  {sortedCourses.length === 0 && (
                    <div className="text-center text-[var(--sub-text)] py-10 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-[var(--hover-bg)] rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-[var(--sub-text)]" /></div>
                      <p className="text-sm">此學期尚未加入課程</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 右側：視覺化課表 */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--card-bg)] p-4 rounded-2xl shadow-sm border border-[var(--border-color)] gap-4">
             <div className="flex items-center gap-6">
                <div className="relative">
                  <select 
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="appearance-none bg-[var(--hover-bg)] border-none font-bold text-[var(--main-text)] py-2 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] cursor-pointer"
                  >
                    <option value="1142">1142 學期</option>
                    <option value="1141">1141 學期</option>
                    <option value="1132">1132 學期</option>
                    <option value="1131">1131 學期</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-[var(--sub-text)] pointer-events-none" />
                </div>

                <div className="flex items-baseline gap-2"><span className="text-sm font-bold text-[var(--sub-text)]">學分</span><span className="text-2xl font-bold text-[var(--main-text)]">{totalVisibleCredits}</span></div>
                <div className="hidden sm:flex items-center gap-4 border-l border-[var(--border-color)] pl-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-[var(--sub-text)] cursor-pointer hover:text-[var(--main-text)] transition"><input type="checkbox" checked={showTimeDetail} onChange={e => setShowTimeDetail(e.target.checked)} className="rounded accent-[var(--accent-bg)] cursor-pointer w-4 h-4" />顯示時間</label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[var(--sub-text)] cursor-pointer hover:text-[var(--main-text)] transition"><input type="checkbox" checked={showWeekend} onChange={e => setShowWeekend(e.target.checked)} className="rounded accent-[var(--accent-bg)] cursor-pointer w-4 h-4" />顯示週末</label>
                </div>
             </div>
             <button 
               onClick={handleExportImage} 
               disabled={isExporting}
               className={`flex items-center gap-2 bg-[var(--accent-bg)] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition active:scale-95 ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
             >
               {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
               {isExporting ? '匯出中...' : '匯出課表圖片'}
             </button>
          </div>

          <div className="flex-1 bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--border-color)] p-6 overflow-hidden flex flex-col relative">
            <div className="flex-1 overflow-auto">
                <div className="w-full min-w-[600px] h-full" ref={scheduleRef} id="schedule-export-target">
                  <div className="bg-[var(--card-bg)] p-2 h-full">
                    <div className={`grid gap-1 mb-2`} style={{ gridTemplateColumns: `3rem repeat(${displayDays.length}, 1fr)` }}>
                      <div className="text-center text-xs font-bold text-[var(--sub-text)] py-2">節次</div>
                      {displayDays.map(day => <div key={day} className="text-center font-bold text-[var(--main-text)] text-sm bg-[var(--hover-bg)] rounded-lg py-2">{day}</div>)}
                    </div>
                    <div className={`grid gap-1 auto-rows-fr`} style={{ gridTemplateColumns: `3rem repeat(${displayDays.length}, 1fr)` }}>
                      {Array.from({ length: 14 }, (_, i) => i + 1).map(period => (
                        <>
                          <div key={`p-${period}`} className="flex flex-col items-center justify-center text-xs text-[var(--sub-text)] font-mono h-24 border-t border-[var(--border-color)]"><span className="font-bold text-sm text-[var(--main-text)]">{period}</span>{showTimeDetail && <span className="scale-75 opacity-70 mt-1">{timeMap[period]}</span>}</div>
                          {displayDays.map((_, dayIndex) => {
                            const currentDay = dayIndex + 1
                            const activeCourses = currentSemesterCourses.filter(c => {
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
                                  ${isSelected ? 'bg-blue-100/20 border-blue-300/50' : 'border-[var(--border-color)] hover:bg-[var(--hover-bg)]'}
                                `}
                                onMouseEnter={() => setHoverSlot({ day: currentDay, period })}
                                onMouseLeave={() => setHoverSlot(null)}
                                onClick={() => handleSlotClick(currentDay, period)}
                              >
                                {activeCourses.length === 0 && (isHovered || isSelected) && (
                                  <div className={`absolute inset-0 flex items-center justify-center transition animate-fade-in text-[var(--sub-text)]`}>
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
      </div>

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