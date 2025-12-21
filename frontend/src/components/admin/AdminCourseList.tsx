'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, Edit, MessageSquare, ChevronDown, ChevronUp, Download, CheckSquare, Square, Loader2, MapPin } from 'lucide-react'
import Cookies from 'js-cookie'
import AdminDiscussionModal from './AdminDiscussionModal'
import AdminEditCourseModal from './AdminEditCourseModal' 
import ConfirmModal from '../ConfirmModal' 

interface AdminCourseListProps {
  courses: any[]
  setCourses: (courses: any[]) => void
  onOpenMap: (location: string) => void // 🔥 這裡定義了父層傳下來的函式
}

const DEFAULT_FILTERS = {
  semester: '1132',
  department: '',
  grades: [] as string[],
  types: [] as string[],
  days: [] as string[],
  periods: [] as string[],
  teacherId: '',
  teacherName: '',
  courseId: '',
  courseName: '',
  classroomId: ''
}

export default function AdminCourseList({ courses, setCourses, onOpenMap }: AdminCourseListProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [isInitialized, setIsInitialized] = useState(false)

  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  const [editingCourse, setEditingCourse] = useState<any>(null) 
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [discussionCourse, setDiscussionCourse] = useState<any>(null)

  useEffect(() => {
    const savedHasSearched = Cookies.get('admin_has_searched')
    const savedFilters = Cookies.get('admin_search_filters')

    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters))
      } catch (e) {
        console.error('Cookie 解析失敗', e)
      }
    }
    
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      Cookies.set('admin_has_searched', hasSearched.toString(), { expires: 7 })
      Cookies.set('admin_search_filters', JSON.stringify(filters), { expires: 7 })
    }
  }, [hasSearched, filters, isInitialized])

  const handleInputChange = (field: keyof typeof DEFAULT_FILTERS, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (category: keyof typeof DEFAULT_FILTERS, value: string) => {
    setFilters(prev => {
      const currentList = prev[category] as string[]
      const newList = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value]
      return { ...prev, [category]: newList }
    })
  }

  const handleAdminSearch = async () => {
    setHasSearched(true)
    setIsLoading(true)
    setSelectedIds([])

    try {
        const res = await fetch('http://localhost:8000/api/courses/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters)
        });

        if (res.ok) {
            const data = await res.json();
            setFilteredCourses(data);
        } else {
            alert('搜尋失敗');
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('連線錯誤');
    } finally {
        setIsLoading(false);
    }
  }

  const handleClear = () => {
    setHasSearched(false)
    setFilteredCourses([])
    setSelectedIds([])
    setFilters(DEFAULT_FILTERS)
    Cookies.remove('admin_has_searched')
    Cookies.remove('admin_search_filters')
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCourses.length && filteredCourses.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCourses.map(c => c.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleExport = () => {
    if (selectedIds.length === 0) {
      alert('請至少勾選一筆課程！')
      return
    }
    const exportData = filteredCourses.filter(c => selectedIds.includes(c.id))
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = `courses_export_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
  }

  const handleDeleteClick = (id: string) => { setDeletingId(id) }

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
        const res = await fetch(`http://localhost:8000/api/courses/${deletingId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            const newCourses = courses.filter(c => c.id !== deletingId);
            setCourses(newCourses);
            setFilteredCourses(prev => prev.filter(c => c.id !== deletingId));
            setSelectedIds(prev => prev.filter(id => id !== deletingId));
            alert('刪除成功');
        } else {
            alert('刪除失敗');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('連線錯誤');
    } finally {
        setDeletingId(null);
    }
  }

  const handleEditClick = (course: any) => { setEditingCourse(course) }

  const handleSaveEdit = (updatedCourse: any) => {
    const newCourses = courses.map(c => c.id === updatedCourse.id ? updatedCourse : c)
    setCourses(newCourses)
    
    if (hasSearched) {
      const newFiltered = filteredCourses.map(c => c.id === updatedCourse.id ? updatedCourse : c)
      setFilteredCourses(newFiltered)
    }
    setEditingCourse(null)
  }

  const courseToDelete = deletingId ? filteredCourses.find(c => c.id === deletingId) : null;

  return (
    <div className="space-y-6">
      
      {/* 查詢條件區塊 (省略部分重複代碼，保持你的 UI 不變，重點在 onOpenMap) */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
        {/* ... 這裡請保留你原本的搜尋 UI，跟上一版完全一樣 ... */}
        {/* 為了節省篇幅，這裡我只放按鈕群組，請確保上面的下拉選單等都還在 */}
        
        {/* 上半部 UI 請參照之前的完整代碼，這裡不重複貼上以免太長 */}
        {/* ... */}
        
        <div className="relative flex justify-center items-center gap-4 mt-10 border-t border-gray-100 pt-6">
          <button onClick={handleClear} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold px-10 py-3 rounded-full transition active:scale-95 flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> 清除重填
          </button>

          <button onClick={handleAdminSearch} disabled={isLoading} className="bg-black hover:bg-gray-800 text-white text-lg font-bold px-12 py-3 rounded-full shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {isLoading ? '搜尋中...' : '送出查詢'}
          </button>

          <button onClick={handleExport} className={`absolute right-0 flex items-center gap-2 px-6 py-3 rounded-full font-bold transition active:scale-95 shadow-sm border ${selectedIds.length > 0 ? 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50' : 'bg-white text-gray-300 border-gray-100 cursor-not-allowed'}`} disabled={selectedIds.length === 0}>
            <Download className="w-5 h-5" /> 匯出 JSON ({selectedIds.length})
          </button>
        </div>
      </div>

      {hasSearched && (
        <div className="overflow-x-auto pb-4 animate-fade-in-up">
          <div className="min-w-[1350px] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-400">
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <button onClick={handleSelectAll} className="hover:text-gray-600 transition">
                  {selectedIds.length === filteredCourses.length && filteredCourses.length > 0 ? <CheckSquare className="w-5 h-5 text-black" /> : <Square className="w-5 h-5" />}
                </button>
              </div>
              <div className="w-14 flex-shrink-0">學期</div>
              <div className="w-24 flex-shrink-0">系所</div>
              <div className="w-12 text-center flex-shrink-0">年級</div>
              <div className="w-12 text-center flex-shrink-0">班組</div>
              <div className="w-16 flex-shrink-0">代碼</div>
              <div className="flex-1 min-w-[200px]">課程名稱</div>
              <div className="w-20 flex-shrink-0">教師</div>
              <div className="w-12 text-center flex-shrink-0">學分</div>
              <div className="w-28 flex-shrink-0">時間</div>
              <div className="w-20 flex-shrink-0">地點</div>
              <div className="w-16 text-center flex-shrink-0">人數</div>
              <div className="w-12 text-center flex-shrink-0">討論</div>
              <div className="w-32 text-right flex-shrink-0 text-gray-900">管理操作</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredCourses.length === 0 ? (
                <div className="p-10 text-center text-gray-400">沒有符合條件的課程</div>
              ) : (
                filteredCourses.map(course => (
                  <div key={course.id} className={`flex gap-4 px-6 py-4 items-center transition group ${selectedIds.includes(course.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50/80'}`}>
                    <div className="w-10 flex-shrink-0 flex items-center justify-center">
                      <button onClick={() => handleSelectOne(course.id)} className="text-gray-400 hover:text-black transition">
                        {selectedIds.includes(course.id) ? <CheckSquare className="w-5 h-5 text-black" /> : <Square className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="w-14 flex-shrink-0 text-sm text-gray-500">{course.semester}</div>
                    <div className="w-24 flex-shrink-0 text-sm text-gray-500 truncate">{course.department}</div>
                    <div className="w-12 text-center flex-shrink-0 text-sm text-gray-500">{course.grade}</div>
                    <div className="w-12 text-center flex-shrink-0 text-sm text-gray-500">{course.class_group || course.classGroup}</div>
                    <div className="w-16 flex-shrink-0 font-mono text-sm text-gray-500">{course.code || course.course_code || course.id}</div>
                    <div className="flex-1 min-w-[200px] font-bold text-gray-900 flex items-center gap-2">
                      {course.name}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${course.type === '必修' ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-orange-600 border-orange-100 bg-orange-50'}`}>{course.type}</span>
                    </div>
                    <div className="w-20 flex-shrink-0 text-sm text-gray-900">{course.teacher}</div>
                    <div className="w-12 text-center flex-shrink-0 text-sm text-gray-900">{course.credits}</div>
                    <div className="w-28 flex-shrink-0 text-xs text-gray-500 font-mono">{course.time}</div>
                    
                    {/* 🔥 地點欄位：變成按鈕 🔥 */}
                    <div className="w-20 flex-shrink-0 text-sm text-gray-500">
                        <button 
                            onClick={() => onOpenMap(course.location)}
                            className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition -ml-2"
                            title="查看教室地圖"
                        >
                            <MapPin className="w-3 h-3" />
                            {course.location}
                        </button>
                    </div>

                    <div className="w-16 text-center flex-shrink-0 text-sm text-gray-500">{course.capacity || `${course.current_students}/${course.max_students}`}</div>
                    
                    <div className="w-12 text-center flex-shrink-0">
                      <button onClick={() => setDiscussionCourse(course)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="管理討論區">
                        <MessageSquare className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                    
                    <div className="w-32 flex justify-end gap-2">
                      <button onClick={() => handleEditClick(course)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="編輯課程">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteClick(course.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="刪除課程">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {editingCourse && (
        <AdminEditCourseModal 
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={handleSaveEdit}
        />
      )}

      {discussionCourse && (
        <AdminDiscussionModal 
          course={discussionCourse} 
          onClose={() => setDiscussionCourse(null)} 
        />
      )}

      {deletingId && (
        <ConfirmModal 
          title="刪除確認"
          content={`您確定要永久刪除「${courseToDelete?.name || ''}」嗎？此動作無法復原。`}
          confirmText="確認刪除"
          isDanger={true}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}