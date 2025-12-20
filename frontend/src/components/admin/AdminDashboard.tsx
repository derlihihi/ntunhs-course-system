'use client'

import { useState } from 'react'
import { 
  LogOut, ShieldCheck, Users, MessageSquare, 
  FileText, Upload, Plus, Edit, Trash2, Search, X, Save, 
  ChevronDown, ChevronUp // 新增這兩個 Icon
} from 'lucide-react'
import { MOCK_COURSES } from '../../data/mockData'

interface AdminDashboardProps {
  user: any
  onLogout: () => void
}

// 模擬使用者資料
const MOCK_USERS = [
  { id: '122214250', name: '吳名式', department: '資管系', status: 'normal' },
  { id: '110213001', name: '王小明', department: '護理系', status: 'banned' },
]

// 模擬討論區留言
const MOCK_COMMENTS = [
  { id: 1, course: '系統分析與設計', user: '吳名式', content: '老師人很好，推推！', status: 'normal', date: '2024-02-20' },
  { id: 2, course: '資料庫管理', user: '王小明', content: '這堂課根本學不到東西...', status: 'normal', date: '2024-02-21' },
]

// 搜尋條件介面 (與使用者端一致)
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

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('課程管理')
  const [courses, setCourses] = useState(MOCK_COURSES)
  const [users, setUsers] = useState(MOCK_USERS)
  const [comments, setComments] = useState(MOCK_COMMENTS)

  // 課程編輯 Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)

  // --- 搜尋相關狀態 (復刻 CourseSearch) ---
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hasSearched, setHasSearched] = useState(false) // 管理者預設可能想先看到空的，或是全部資料，這邊先設 false
  const [searchResults, setSearchResults] = useState<any[]>(courses) // 搜尋結果

  // --- 搜尋邏輯處理函數 ---
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
    setSearchResults(courses) // 重置時顯示所有課程 (或清空，看需求)
  }

  const handleSearch = () => {
    setHasSearched(true)
    // 這裡做本地搜尋模擬
    const filtered = courses.filter(c => {
      // 簡單模擬：如果選了系所，就比對系所
      if (filters.department && !c.department.includes(filters.department)) return false;
      // 如果輸入了課程名稱
      if (filters.courseName && !c.name.includes(filters.courseName)) return false;
      return true;
    })
    setSearchResults(filtered)
  }

  // --- 課程管理邏輯 ---
  const handleDeleteCourse = (id: string) => {
    if (confirm('確定要永久刪除這門課程嗎？此動作無法復原。')) {
      const newCourses = courses.filter(c => c.id !== id)
      setCourses(newCourses)
      setSearchResults(newCourses) // 同步更新搜尋結果
    }
  }

  const openEditModal = (course: any = null) => {
    setEditingCourse(course || { 
      id: '', name: '', teacher: '', credits: 3, time: '', location: '', 
      department: '資管系', classGroup: 'A', semester: '1132', type: '必修' 
    })
    setIsEditModalOpen(true)
  }

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault()
    // 簡單模擬：如果是現有ID就更新，沒有就新增
    const exists = courses.some(c => c.id === editingCourse.id)
    let newCourses;
    if (exists) {
      newCourses = courses.map(c => c.id === editingCourse.id ? editingCourse : c)
    } else {
      newCourses = [...courses, editingCourse]
    }
    setCourses(newCourses)
    setSearchResults(newCourses) // 同步更新
    setIsEditModalOpen(false)
    alert('儲存成功！')
  }

  // --- 其他管理邏輯 ---
  const toggleUserBan = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'normal' ? 'banned' : 'normal' } : u))
  }

  const deleteComment = (id: number) => {
    if (confirm('確定要遮蔽這則留言嗎？')) {
      setComments(comments.map(c => c.id === id ? { ...c, status: 'deleted', content: '(此留言因違反版規已被管理員移除)' } : c))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      alert(`已選擇檔案：${file.name}，正在模擬匯入...`)
      setTimeout(() => alert('匯入成功！新增了 50 筆課程資料。'), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-gray-900">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 h-[70px] flex items-center justify-between px-6 md:px-10 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">N</div>
          <span className="text-lg font-bold text-gray-900 tracking-tight hidden md:block">後台管理系統</span>
        </div>

        <nav className="hidden md:flex items-center gap-2 h-full">
          {['課程管理', '匯入課程', '使用者管理', '討論區管理'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-200
                ${activeTab === tab ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <ShieldCheck className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-bold text-gray-600">管理員：{user.name}</span>
          </div>
          <button onClick={onLogout} className="p-2.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto p-8 animate-fade-in-up">
        
        {/* === TAB 1: 課程管理 === */}
        {activeTab === '課程管理' && (
          <div className="space-y-6">
            
            {/* 1. 搜尋條件區塊 (復刻使用者介面) */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* 左側欄位 */}
                <div className="xl:col-span-6 space-y-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-900 min-w-[40px] text-right">學期</label>
                      <div className="relative w-full">
                        <select value={filters.semester} onChange={(e) => handleInputChange('semester', e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 font-medium transition">
                          <option value="1132">1132</option><option value="1131">1131</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-900 min-w-[40px] text-right">系所</label>
                      <div className="relative w-full">
                        <select value={filters.department} onChange={(e) => handleInputChange('department', e.target.value)} className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 font-medium transition">
                          <option value="">全部系所</option><option value="資訊管理系">資訊管理系</option><option value="護理系">護理系</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  {/* Checkbox Groups - 簡化版展示，結構與使用者端相同 */}
                  <div className="flex items-center gap-4">
                    <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap">學制</label>
                    <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-gray-600">
                      {['二專', '二技', '四技', '碩士班'].map((label) => (
                        <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                          <input type="checkbox" checked={filters.systems.includes(label)} onChange={() => handleCheckboxChange('systems', label)} className="w-4 h-4 rounded border-gray-300 accent-black" />{label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap">年級</label>
                    <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-gray-600">
                      {['1年級', '2年級', '3年級', '4年級'].map((label) => (
                        <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                          <input type="checkbox" checked={filters.grades.includes(label)} onChange={() => handleCheckboxChange('grades', label)} className="w-4 h-4 rounded border-gray-300 accent-black" />{label}
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
                      {['週一', '週二', '週三', '週四', '週五'].map((label) => (
                        <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black transition">
                          <input type="checkbox" checked={filters.days.includes(label)} onChange={() => handleCheckboxChange('days', label)} className="w-4 h-4 rounded border-gray-300 accent-black" />{label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <label className="font-bold text-gray-900 min-w-[40px] text-right whitespace-nowrap pt-[3px]">節次</label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm font-medium text-gray-600 w-full">
                      {['節01', '節02', '節03', '節04'].map((label) => (
                        <label key={label} className="flex items-center gap-2 cursor-pointer hover:text-black truncate transition">
                          <input type="checkbox" checked={filters.periods.includes(label)} onChange={() => handleCheckboxChange('periods', label)} className="w-4 h-4 rounded border-gray-300 accent-black" />{label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 進階查詢 */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-gray-600 transition group">
                  <span className="border-b-2 border-gray-900 group-hover:border-gray-600 pb-0.5">進階查詢</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showAdvanced && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">課程</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="代碼" value={filters.courseId} onChange={(e) => handleInputChange('courseId', e.target.value)} className="w-1/3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      <input type="text" placeholder="名稱" value={filters.courseName} onChange={(e) => handleInputChange('courseName', e.target.value)} className="w-2/3 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
                    </div>
                  </div>
                  {/* ... 其他進階欄位 ... */}
                </div>
              )}

              {/* 按鈕群 */}
              <div className="flex justify-center gap-4 mt-10">
                <button onClick={handleClear} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg font-bold px-10 py-3 rounded-full transition active:scale-95 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> 清除重填
                </button>
                <button onClick={handleSearch} className="bg-black hover:bg-gray-800 text-white text-lg font-bold px-12 py-3 rounded-full shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center gap-2">
                  <Search className="w-5 h-5" /> 送出查詢
                </button>
              </div>
            </div>

            {/* 2. 功能按鈕列 (管理者專屬) */}
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-gray-900">查詢結果 ({searchResults.length})</h2>
              <button 
                onClick={() => openEditModal()} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition active:scale-95"
              >
                <Plus className="w-5 h-5" /> 新增課程
              </button>
            </div>

            {/* 3. 查詢結果 (管理者專屬列表，含操作按鈕) */}
            {hasSearched ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="min-w-[1000px]">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <div className="col-span-1">代碼</div>
                    <div className="col-span-3">課程名稱</div>
                    <div className="col-span-2">系所 / 班級</div>
                    <div className="col-span-2">教師</div>
                    <div className="col-span-2">時間地點</div>
                    <div className="col-span-2 text-right">管理操作</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-100">
                    {searchResults.map(course => (
                      <div key={course.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/80 transition group">
                        <div className="col-span-1 font-mono text-gray-500 text-sm">{course.id}</div>
                        <div className="col-span-3 font-bold text-gray-900 flex items-center gap-2">
                          {course.name}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${course.type === '必修' ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-orange-600 border-orange-100 bg-orange-50'}`}>{course.type}</span>
                        </div>
                        <div className="col-span-2 text-sm text-gray-600">{course.department} {course.classGroup}</div>
                        <div className="col-span-2 text-sm text-gray-900">{course.teacher}</div>
                        <div className="col-span-2 text-xs text-gray-500">
                          <p>{course.time}</p>
                          <p>{course.location}</p>
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => alert(`跳轉到 ${course.name} 的討論區管理`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="管理討論區"><MessageSquare className="w-4 h-4" /></button>
                          <button onClick={() => openEditModal(course)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="編輯課程"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="刪除課程"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
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
          </div>
        )}

        {/* === TAB 2: 匯入課程 === */}
        {activeTab === '匯入課程' && (
          <div className="max-w-2xl mx-auto py-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
                <Upload className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">批次匯入課程</h2>
              <p className="text-gray-500 mb-8">請上傳 .csv 格式檔案，系統將自動解析並覆蓋/新增課程資料。</p>
              <div className="relative group">
                <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 group-hover:border-black group-hover:bg-gray-50 transition">
                  <p className="text-sm font-bold text-gray-900">點擊選擇檔案 或 拖放至此</p>
                  <p className="text-xs text-gray-400 mt-1">支援檔案格式：CSV</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 3: 使用者管理 === */}
        {activeTab === '使用者管理' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <th className="p-5 pl-8">學號</th>
                    <th className="p-5">姓名</th>
                    <th className="p-5">系所</th>
                    <th className="p-5 text-center">狀態</th>
                    <th className="p-5 text-center">權限管理</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="p-5 pl-8 font-mono text-gray-600">{u.id}</td>
                      <td className="p-5 font-bold text-gray-900">{u.name}</td>
                      <td className="p-5 text-gray-500">{u.department}</td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === 'banned' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {u.status === 'banned' ? '停權中' : '正常'}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <button 
                          onClick={() => toggleUserBan(u.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                            u.status === 'banned' ? 'bg-white border-gray-200 text-gray-600' : 'bg-white border-red-200 text-red-500 hover:bg-red-50'
                          }`}
                        >
                          {u.status === 'banned' ? '解除封鎖' : '禁止發言'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB 4: 討論區管理 === */}
        {activeTab === '討論區管理' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">最新留言審核</h2>
            <div className="grid grid-cols-1 gap-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">{comment.user[0]}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{comment.user} <span className="text-gray-400 font-normal">評論了</span> {comment.course}</p>
                      </div>
                    </div>
                    {comment.status !== 'deleted' && (
                      <button onClick={() => deleteComment(comment.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${comment.status === 'deleted' ? 'bg-red-50 text-red-400 italic' : 'bg-gray-50 text-gray-700'}`}>{comment.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- Modal: 新增/修改課程 --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in-up">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 overflow-hidden flex flex-col max-h-[90vh]">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{editingCourse?.id ? '修改課程資料' : '新增課程'}</h3>
            <form onSubmit={handleSaveCourse} className="flex-1 overflow-y-auto pr-2 space-y-5">
              {/* 表單內容與之前相同，省略重複部分以保持整潔，邏輯是一樣的 */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 ml-1">課程代碼</label><input required type="text" value={editingCourse?.id} onChange={e => setEditingCourse({...editingCourse, id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 ml-1">課程名稱</label><input required type="text" value={editingCourse?.name} onChange={e => setEditingCourse({...editingCourse, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" /></div>
              </div>
              <div className="pt-6 border-t border-gray-100 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">取消</button>
                <button type="submit" className="flex-1 bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg active:scale-95 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> 儲存變更</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}