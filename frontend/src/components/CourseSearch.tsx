'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import CourseListItem from './CourseListItem'
import Cookies from 'js-cookie'

// 定義 Props
interface CourseSearchProps {
  cartItems: any[]
  onToggleCartItem: (course: any) => void
  onLocationClick: (location: string) => void
  onDiscussionClick: (course: any) => void
}

// 定義搜尋條件介面
interface SearchFilters {
  semester: string
  department: string
  grades: string[]
  types: string[]
  days: string[]
  periods: string[]
  teacherId: string
  teacherName: string
  courseId: string
  courseName: string
  classroomId: string
}

// 預設篩選條件
const DEFAULT_FILTERS: SearchFilters = {
  semester: '1132',
  department: '',
  grades: [],
  types: [],
  days: [],
  periods: [],
  teacherId: '',
  teacherName: '',
  courseId: '',
  courseName: '',
  classroomId: ''
}

export default function CourseSearch({ cartItems, onToggleCartItem, onLocationClick, onDiscussionClick }: CourseSearchProps) {
  // --- State 定義 ---
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [isInitialized, setIsInitialized] = useState(false)

  // --- Cookie 讀取 ---
  useEffect(() => {
    const savedFilters = Cookies.get('course_search_filters')
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters))
      } catch (e) {
        console.error('Cookie 解析失敗', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // --- Cookie 寫入 ---
  useEffect(() => {
    if (isInitialized) {
      Cookies.set('course_search_filters', JSON.stringify(filters), { expires: 7 })
    }
  }, [filters, isInitialized])

  // --- 事件處理 Handlers ---
  const handleCheckboxChange = (category: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentList = prev[category] as string[]
      const newList = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value]
      return { ...prev, [category]: newList }
    })
  }

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS)
    setHasSearched(false)
    setSearchResults([])
    Cookies.remove('course_search_filters')
    Cookies.remove('course_has_searched')
  }

  const handleSearch = async () => {
    setHasSearched(true)
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/courses/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error('搜尋失敗');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('連線錯誤', error);
      alert('無法連接到後端，請確認 Server (Port 8000) 是否已啟動');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* 搜尋條件區塊 - 主卡片 */}
      <div className="rounded-3xl shadow-sm p-8 mb-10 transition-colors bg-[var(--card-bg)] border border-[var(--border-color)]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* 左側欄位 */}
          <div className="xl:col-span-6 space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <label className="font-bold min-w-[40px] text-right text-[var(--main-text)]">學期</label>
                <div className="relative w-full">
                  <select 
                    value={filters.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="w-full appearance-none bg-[var(--hover-bg)] border border-[var(--border-color)] text-[var(--main-text)] py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-medium transition"
                  >
                    <option value="1141">1142</option>
                    <option value="1141">1141</option>
                    <option value="1132">1132</option>
                    <option value="1131">1131</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-[var(--sub-text)] pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="font-bold min-w-[40px] text-right text-[var(--main-text)]">系所</label>
                <div className="relative w-full">
                  <select 
                    value={filters.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full appearance-none bg-[var(--hover-bg)] border border-[var(--border-color)] text-[var(--main-text)] py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] font-medium transition"
                  >
                    <option value="">請選擇系所...</option>
                    <option value="護理系">護理系</option>
                    <option value="高齡健康照護系">高齡健康照護系</option>
                    <option value="護理助產及婦女健康系">護理助產及婦女健康系</option>
                    <option value="醫護教育暨數位學習系">醫護教育暨數位學習系</option>
                    <option value="中西醫結合護理研究所">中西醫結合護理研究所</option>
                    <option value="健康事業管理系">健康事業管理系</option>
                    <option value="資訊管理系">資訊管理系</option>
                    <option value="休閒產業與健康促進系">休閒產業與健康促進系</option>
                    <option value="長期照護系">長期照護系</option>
                    <option value="語言治療與聽力學系">語言治療與聽力學系</option>
                    <option value="嬰幼兒保育系">嬰幼兒保育系</option>
                    <option value="運動保健系">運動保健系</option>
                    <option value="生死與健康心理諮商系">生死與健康心理諮商系</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-[var(--sub-text)] pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold min-w-[40px] text-right whitespace-nowrap text-[var(--main-text)]">年級</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-[var(--sub-text)]">
                {['1年級', '2年級', '3年級', '4年級'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-[var(--main-text)] transition">
                    <input 
                      type="checkbox" 
                      checked={filters.grades.includes(label)}
                      onChange={() => handleCheckboxChange('grades', label)}
                      className="w-4 h-4 rounded border-[var(--border-color)] focus:ring-0 accent-[var(--accent-bg)]" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold min-w-[40px] text-right whitespace-nowrap text-[var(--main-text)]">課別</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-[var(--sub-text)]">
                {['通識必修(通識)', '專業必修(系所)', '通識選修(通識)', '專業選修(系所)'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-[var(--main-text)] transition">
                    <input 
                      type="checkbox" 
                      checked={filters.types.includes(label)}
                      onChange={() => handleCheckboxChange('types', label)}
                      className="w-4 h-4 rounded border-[var(--border-color)] focus:ring-0 accent-[var(--accent-bg)]" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold min-w-[40px] text-right whitespace-nowrap text-[var(--main-text)]">星期</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-[var(--sub-text)]">
                {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-[var(--main-text)] transition">
                    <input 
                      type="checkbox" 
                      checked={filters.days.includes(label)}
                      onChange={() => handleCheckboxChange('days', label)}
                      className="w-4 h-4 rounded border-[var(--border-color)] focus:ring-0 accent-[var(--accent-bg)]" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 右側欄位 */}
          <div className="xl:col-span-6 space-y-7 xl:border-l xl:border-[var(--border-color)] xl:pl-10">
            <div className="flex items-start gap-4">
              <label className="font-bold min-w-[40px] text-right whitespace-nowrap pt-[3px] text-[var(--main-text)]">節次</label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-medium text-[var(--sub-text)] w-full">
                {[
                  '節01 (08:10~09:00)', '節02 (09:10~10:00)', 
                  '節03 (10:10~11:00)', '節04 (11:10~12:00)',
                  '節05 (12:40~13:30)', '節06 (13:40~14:30)', 
                  '節07 (14:40~15:30)', '節08 (15:40~16:30)',
                  '節09 (16:40~17:30)', '節10 (17:40~18:30)',
                  '節11 (18:35~19:25)', '節12 (19:30~20:20)',
                  '節13 (20:25~21:15)', '節14 (21:20~22:10)'
                ].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-[var(--main-text)] truncate transition">
                    <input 
                      type="checkbox" 
                      checked={filters.periods.includes(label)}
                      onChange={() => handleCheckboxChange('periods', label)}
                      className="w-4 h-4 rounded border-[var(--border-color)] focus:ring-0 accent-[var(--accent-bg)]" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 進階查詢展開 */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-bold text-[var(--main-text)] hover:opacity-70 transition group"
          >
            <span className="border-b-2 border-[var(--accent-color)] group-hover:opacity-70 pb-0.5">進階查詢</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up bg-[var(--hover-bg)] p-6 rounded-2xl border border-[var(--border-color)]">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--main-text)]">教師</label>
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="代碼" 
                  value={filters.teacherId}
                  onChange={(e) => handleInputChange('teacherId', e.target.value)}
                  className="w-1/3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition text-[var(--main-text)] placeholder-[var(--sub-text)]" 
                />
                <input 
                  type="text" placeholder="姓名" 
                  value={filters.teacherName}
                  onChange={(e) => handleInputChange('teacherName', e.target.value)}
                  className="w-2/3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition text-[var(--main-text)] placeholder-[var(--sub-text)]" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--main-text)]">課程</label>
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="代碼" 
                  value={filters.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  className="w-1/3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition text-[var(--main-text)] placeholder-[var(--sub-text)]" 
                />
                <input 
                  type="text" placeholder="名稱" 
                  value={filters.courseName}
                  onChange={(e) => handleInputChange('courseName', e.target.value)}
                  className="w-2/3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition text-[var(--main-text)] placeholder-[var(--sub-text)]" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--main-text)]">教室</label>
              <input 
                type="text" placeholder="請輸入教室代碼" 
                value={filters.classroomId}
                onChange={(e) => handleInputChange('classroomId', e.target.value)}
                className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-color)] outline-none transition text-[var(--main-text)] placeholder-[var(--sub-text)]" 
              />
            </div>
          </div>
        )}

        {/* 按鈕群 */}
        <div className="flex justify-center gap-4 mt-10">
          <button 
            onClick={handleClear}
            className="bg-[var(--hover-bg)] hover:opacity-80 text-[var(--sub-text)] text-lg font-bold px-10 py-3 rounded-full transition active:scale-95 flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            清除重填
          </button>
          
          <button 
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-[var(--accent-bg)] hover:opacity-90 text-white text-lg font-bold px-12 py-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {isLoading ? '搜尋中...' : '送出查詢'}
          </button>
        </div>
      </div>

      {/* 搜尋結果列表（表頭與分隔線也改用變數） */}
      {hasSearched ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1300px] flex gap-4 px-4 pb-3 border-b border-[var(--border-color)] text-sm font-bold text-[var(--sub-text)]">
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
            <div className="w-16 text-center flex-shrink-0">討論</div>
            <div className="w-12 text-center flex-shrink-0">討論</div>
            <div className="w-24 text-right flex-shrink-0">操作</div>
          </div>

          <div className="min-w-[1300px] flex flex-col">
            {searchResults.length === 0 ? (
              <div className="text-center py-10 text-[var(--sub-text)] font-bold">
                🐢 沒有找到符合條件的課程
              </div>
            ) : (
              searchResults.map((course) => (
                <CourseListItem 
                  key={course.id}
                  course={course}
                  isAdded={cartItems.some(item => item.id == course.id)}
                  onToggle={onToggleCartItem}
                  onLocationClick={onLocationClick}
                  onDiscussionClick={onDiscussionClick}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 opacity-40">
          <div className="w-16 h-16 bg-[var(--hover-bg)] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-[var(--sub-text)]" />
          </div>
          <p className="text-[var(--sub-text)] font-bold text-lg">輸入條件後開始查詢</p>
        </div>
      )}
    </>
  )
}