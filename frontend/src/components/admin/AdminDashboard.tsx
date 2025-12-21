'use client'

import { useState, useEffect } from 'react'
import { MOCK_COURSES } from '../../data/mockData'
import Cookies from 'js-cookie' // 引入 js-cookie

// 引入拆分後的子元件
import AdminHeader from './AdminHeader'
import AdminCourseList from './AdminCourseList'
import AdminImportCourse from './AdminImportCourse'
import AdminAddCourse from './AdminAddCourse'
import AdminUserManage from './AdminUserManage'
import AdminDiscussionManage from './AdminDiscussionManage'

interface AdminDashboardProps {
  user: any
  onLogout: () => void
}

// 模擬資料 (資料庫狀態)
const MOCK_USERS = [
  { id: '122214250', name: '吳名式', department: '資管系', status: 'normal' },
  { id: '110213001', name: '王小明', department: '護理系', status: 'banned' },
]

const MOCK_COMMENTS = [
  { id: 1, course: '系統分析與設計', user: '吳名式', content: '老師人很好，推推！', status: 'normal', date: '2024-02-20' },
  { id: 2, course: '資料庫管理', user: '王小明', content: '這堂課根本學不到東西...', status: 'normal', date: '2024-02-21' },
]

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('課程管理')
  const [isInitialized, setIsInitialized] = useState(false) // 標記：是否已從 Cookie 讀取
  
  // 全域資料狀態 (模擬資料庫)
  const [courses, setCourses] = useState(MOCK_COURSES)
  const [users, setUsers] = useState(MOCK_USERS)
  const [comments, setComments] = useState(MOCK_COMMENTS)

  // 1. 初始化：讀取 Cookie
  useEffect(() => {
    const savedTab = Cookies.get('admin_active_tab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
    setIsInitialized(true)
  }, [])

  // 2. 當 Tab 改變時：寫入 Cookie
  useEffect(() => {
    if (isInitialized) {
      Cookies.set('admin_active_tab', activeTab, { expires: 7 })
    }
  }, [activeTab, isInitialized])

  // 處理新增課程 (從 Tab 3 呼叫)
  const handleCreateCourse = (newCourse: any) => {
    if (courses.some(c => c.id === newCourse.id)) {
      alert('錯誤：課程代碼已存在！')
      return
    }
    setCourses([...courses, newCourse])
    alert('新增成功！')
    setActiveTab('課程管理') 
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-gray-900">
      
      {/* 1. Header */}
      <AdminHeader 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* 2. Main Content */}
      <main className="max-w-[1440px] mx-auto p-8 animate-fade-in-up">
        
        {activeTab === '課程管理' && (
          <AdminCourseList courses={courses} setCourses={setCourses} />
        )}

        {activeTab === '匯入課程' && (
          <AdminImportCourse 
            currentCourses={courses} 
            onImport={(newCourses) => setCourses(newCourses)} 
          />
        )}

        {activeTab === '新增課程' && (
          <AdminAddCourse 
            onAddCourse={handleCreateCourse} 
            onCancel={() => setActiveTab('課程管理')} 
          />
        )}

        {activeTab === '使用者管理' && (
          <AdminUserManage users={users} setUsers={setUsers} />
        )}

        {activeTab === '討論區管理' && (
          <AdminDiscussionManage comments={comments} setComments={setComments} />
        )}

      </main>
    </div>
  )
}