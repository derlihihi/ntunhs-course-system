'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation' 
import { Loader2 } from 'lucide-react'
import MapModal from '../MapModal'

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

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('課程管理')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 資料狀態
  const [courses, setCourses] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  
  // 🔥 地圖狀態
  const [mapLocation, setMapLocation] = useState<string | null>(null)

  // 1. 權限檢查 & 初始化 Cookie
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 0 && user.role !== '0')) {
      alert('權限不足，無法存取管理後台！')
      onLogout() 
      return
    }

    const savedTab = Cookies.get('admin_active_tab')
    if (savedTab) {
      setActiveTab(savedTab)
    }
    setIsInitialized(true)
  }, [user])

  // 2. 寫入 Cookie
  useEffect(() => {
    if (isInitialized) {
      Cookies.set('admin_active_tab', activeTab, { expires: 7 })
    }
  }, [activeTab, isInitialized])

  // 3. 從後端抓取所有資料
  useEffect(() => {
    // 這裡放寬檢查，只要 user 存在就跑 (後端 API 會自己擋權限，或者依賴上方 useEffect 的檢查)
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [resCourses, resUsers, resComments] = await Promise.all([
          fetch('http://localhost:8000/api/courses/search', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}) // 空條件 = 抓全部
          }),
          fetch('http://localhost:8000/api/admin/users'),
          fetch('http://localhost:8000/api/admin/comments')
        ]);

        if (resCourses.ok && resUsers.ok && resComments.ok) {
          const coursesData = await resCourses.json();
          const usersData = await resUsers.json();
          const commentsData = await resComments.json();

          setCourses(coursesData);
          setUsers(usersData);
          setComments(commentsData);
        } else {
          console.error('部分資料載入失敗');
        }
      } catch (error) {
        console.error('連線錯誤', error);
        alert('無法連線至伺服器，請檢查後端狀態');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCreateCourseSuccess = (newCourse: any) => {
    setCourses(prev => [...prev, newCourse]); 
    setActiveTab('課程管理');
  }

  // 權限驗證失敗或載入中
  if (!user || (user.role !== 'admin' && user.role !== 0 && user.role !== '0')) {
      return null;
  }

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                  <p className="text-gray-500 font-bold">正在載入管理後台數據...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans text-gray-900">
      
      <AdminHeader 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      <main className="max-w-[1440px] mx-auto p-8 animate-fade-in-up">
        
        {activeTab === '課程管理' && (
          <AdminCourseList 
              courses={courses} 
              setCourses={setCourses} 
              // 🔥 這裡使用箭頭函式傳遞，解決型別報錯
              onOpenMap={(location) => setMapLocation(location)}
          />
        )}

        {activeTab === '匯入課程' && (
          <AdminImportCourse 
            currentCourses={courses} 
            onImport={(newCourses) => setCourses(newCourses)} 
          />
        )}

        {activeTab === '新增課程' && (
          <AdminAddCourse 
            onAddCourseSuccess={handleCreateCourseSuccess} 
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

      {/* 🔥 地圖彈窗放在最外層 */}
      {mapLocation && (
        <MapModal 
          location={mapLocation} 
          onClose={() => setMapLocation(null)} 
        />
      )}
    </div>
  )
}