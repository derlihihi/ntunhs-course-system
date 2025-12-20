'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import CourseListItem from './CourseListItem'
import { MOCK_COURSES } from '../data/mockData'
import Cookies from 'js-cookie'

interface CourseSearchProps {
  cartItems: any[]
  onToggleCartItem: (course: any) => void
  onLocationClick: (location: string) => void
  onDiscussionClick: (course: any) => void
}

interface SearchFilters {
  semester: string
  department: string
  systems: string[]
  grades: string[]
  types: string[]
  categories: string[]
  days: string[]
  periods: string[]
  teacherId: string
  teacherName: string
  courseId: string
  courseName: string
  classroomId: string
}

const DEFAULT_FILTERS: SearchFilters = {
  semester: '1132',
  department: '',
  systems: [],
  grades: [],
  types: [],
  categories: [],
  days: [],
  periods: [],
  teacherId: '',
  teacherName: '',
  courseId: '',
  courseName: '',
  classroomId: ''
}

export default function CourseSearch({ cartItems, onToggleCartItem, onLocationClick, onDiscussionClick }: CourseSearchProps) {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 1. 初始化 State
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  // 【關鍵修正】新增一個狀態，用來標記「是否已經從 Cookie 讀取過資料」
  const [isInitialized, setIsInitialized] = useState(false)

  // 2. 讀取 Cookies (Component Mount 時執行一次)
  useEffect(() => {
    const savedFilters = Cookies.get('course_search_filters')
    const savedHasSearched = Cookies.get('course_has_searched') // 順便讀取「是否搜尋過」的狀態

    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters))
      } catch (e) {
        console.error('Cookie 解析失敗', e)
      }
    }

    // 如果之前有搜尋過，自動恢復搜尋結果 (優化體驗)
    if (savedHasSearched === 'true') {
      setHasSearched(true)
      setSearchResults(MOCK_COURSES) // 實際專案這裡應該要根據 filters 重新 fetch API
    }

    // 【關鍵修正】讀取完成後，將初始化標記設為 true
    setIsInitialized(true)
  }, [])

  // 3. 寫入 Cookies (當 filters 變動時執行)
  useEffect(() => {
    // 【關鍵修正】只有在「已經初始化完成」之後，才允許寫入 Cookie
    // 這樣可以防止元件剛掛載時，用預設值覆蓋掉 Cookie
    if (isInitialized) {
      Cookies.set('course_search_filters', JSON.stringify(filters), { expires: 7 })
    }
  }, [filters, isInitialized])

  // 4. 寫入 hasSearched 到 Cookie
  useEffect(() => {
    if (isInitialized) {
      Cookies.set('course_has_searched', hasSearched.toString(), { expires: 7 })
    }
  }, [hasSearched, isInitialized])

  // --- 以下邏輯保持不變 ---

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
    // 清除 Cookie
    Cookies.remove('course_search_filters')
    Cookies.remove('course_has_searched')
  }

const handleSearch = async () => {
    setHasSearched(true)
    
    try {
        const response = await fetch('http://localhost:8000/api/courses/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filters) // 把目前的 filters 狀態送出去
        });

        const data = await response.json();
        
        if (response.ok) {
            setSearchResults(data); // 填入後端回傳的真資料
        } else {
            console.error('查詢失敗');
        }
    } catch (error) {
        console.error('連線錯誤', error);
    }
}

  return (
    <>
      {/* 搜尋條件區塊 */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-8 mb-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* 左側欄位 */}
          <div className="xl:col-span-6 space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <label className="font-bold text-gray-900 min-w-[40px] text-right">學期</label>
                <div className="relative w-full">
                  <select 
                    value={filters.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 font-medium transition"
                  >
                    <option value="1132">1132</option>
                    <option value="1131">1131</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="font-bold text-gray-900 min-w-[40px] text-right">系所</label>
                <div className="relative w-full">
                  <select 
                    value={filters.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 font-medium transition"
                  >
                    <option value="">請選擇系所...</option>
                    <option value="護理系">護理系</option>
                    <option value="高齡健康照護系">高齡健康照護系</option>
                    <option value="護理助產及婦女健康系">護理助產及婦女健康系</option>
                    <option value="醫護教育暨數位學習系">醫護教育暨數位學習系</option>
                    <option value="中西醫結合護理研究所">中西醫結合護理研究所</option>
                    <option value="中西醫結合護理研究所(舊)">中西醫結合護理研究所(舊)</option>
                    <option value="健康科技學院(不分系)">健康科技學院(不分系)</option>
                    <option value="健康事業管理系">健康事業管理系</option>
                    <option value="資訊管理系">資訊管理系</option>
                    <option value="休閒產業與健康促進系">休閒產業與健康促進系</option>
                    <option value="長期照護系">長期照護系</option>
                    <option value="語言治療與聽力學系">語言治療與聽力學系</option>
                    <option value="國際健康科技碩士學位學程">國際健康科技碩士學位學程</option>
                    <option value="人類發展與健康學院(不分系)">人類發展與健康學院(不分系)</option>
                    <option value="嬰幼兒保育系">嬰幼兒保育系</option>
                    <option value="運動保健系">運動保健系</option>
                    <option value="生死與健康心理諮商系">生死與健康心理諮商系</option>
                    <option value="高齡健康暨運動保健技優專班">高齡健康暨運動保健技優專班</option>
                    <option value="智慧健康科技技優專班">智慧健康科技技優專班</option>
                    <option value="人工智慧與健康大數據研究所">人工智慧與健康大數據研究所</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap">學制</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-gray-600">
                {['二專', '二技', '二技(三年)', '四技', '碩士班', '博士班', '學士後'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                    <input 
                      type="checkbox" 
                      checked={filters.systems.includes(label)}
                      onChange={() => handleCheckboxChange('systems', label)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-500 accent-black" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap">年級</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-gray-600">
                {['1年級', '2年級', '3年級', '4年級', '5年級', '6年級', '7年級'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                    <input 
                      type="checkbox" 
                      checked={filters.grades.includes(label)}
                      onChange={() => handleCheckboxChange('grades', label)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-500 accent-black" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap">課別</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-gray-600">
                {['通識必修(通識)', '專業必修(系所)', '通識選修(通識)', '專業選修(系所)'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                    <input 
                      type="checkbox" 
                      checked={filters.types.includes(label)}
                      onChange={() => handleCheckboxChange('types', label)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-500 accent-black" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap">分類</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-gray-600">
                {['跨校', '跨域課程', '全英語', 'EMI全英語', '遠距教學', '遠距輔助'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                    <input 
                      type="checkbox" 
                      checked={filters.categories.includes(label)}
                      onChange={() => handleCheckboxChange('categories', label)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-500 accent-black" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 右側欄位 */}
          <div className="xl:col-span-6 space-y-7 xl:border-l xl:border-gray-100 xl:pl-10">
            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap">星期</label>
              <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-gray-600">
                {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                    <input 
                      type="checkbox" 
                      checked={filters.days.includes(label)}
                      onChange={() => handleCheckboxChange('days', label)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-500 accent-black" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap pt-[3px]">節次</label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-medium text-gray-600 w-full">
                {[
                  '節01 (08:10~09:00)', '節02 (09:10~10:00)', 
                  '節03 (10:10~11:00)', '節04 (11:10~12:00)',
                  '節05 (12:40~13:30)', '節06 (13:40~14:30)', 
                  '節07 (14:40~15:30)', '節08 (15:40~16:30)',
                  '節09 (16:40~17:30)', '節10 (17:40~18:30)',
                  '節11 (18:35~19:25)', '節12 (19:30~20:20)',
                  '節13 (20:25~21:15)', '節14 (21:20~22:10)'
                ].map((label) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black truncate transition">
                    <input 
                      type="checkbox" 
                      checked={filters.periods.includes(label)}
                      onChange={() => handleCheckboxChange('periods', label)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-gray-500 accent-black" 
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 進階查詢展開 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-gray-600 transition group"
          >
            <span className="border-b-2 border-gray-900 group-hover:border-gray-600 pb-0.5">進階查詢</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">教師</label>
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="代碼" 
                  value={filters.teacherId}
                  onChange={(e) => handleInputChange('teacherId', e.target.value)}
                  className="w-1/3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none transition" 
                />
                <input 
                  type="text" placeholder="姓名" 
                  value={filters.teacherName}
                  onChange={(e) => handleInputChange('teacherName', e.target.value)}
                  className="w-2/3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none transition" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">課程</label>
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="代碼" 
                  value={filters.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  className="w-1/3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none transition" 
                />
                <input 
                  type="text" placeholder="名稱" 
                  value={filters.courseName}
                  onChange={(e) => handleInputChange('courseName', e.target.value)}
                  className="w-2/3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none transition" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">教室</label>
              <input 
                type="text" placeholder="請輸入教室代碼" 
                value={filters.classroomId}
                onChange={(e) => handleInputChange('classroomId', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-200 outline-none transition" 
              />
            </div>
          </div>
        )}

        {/* 按鈕群 */}
        <div className="flex justify-center gap-4 mt-10">
          <button 
            onClick={handleClear}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold px-10 py-3 rounded-full transition active:scale-95 flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            清除重填
          </button>
          <button 
            onClick={handleSearch}
            className="bg-black hover:bg-gray-800 text-white text-lg font-bold px-12 py-3 rounded-full shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            送出查詢
          </button>
        </div>
      </div>

      {/* 搜尋結果列表 */}
      {hasSearched ? (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1300px] flex gap-4 px-4 pb-3 border-b border-gray-200 text-sm font-bold text-gray-400">
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
            <div className="w-24 text-right flex-shrink-0">操作</div>
          </div>

          <div className="min-w-[1300px] flex flex-col">
            {searchResults.map((course) => (
              <CourseListItem 
                key={course.id}
                course={course}
                isAdded={cartItems.some(item => item.id === course.id)}
                onToggle={onToggleCartItem}
                onLocationClick={onLocationClick}
                onDiscussionClick={onDiscussionClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 opacity-40">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 font-bold text-lg">輸入條件後開始查詢</p>
        </div>
      )}
    </>
  )
}