'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, ArrowRight, Clock, Lock, AlertTriangle, Loader2 } from 'lucide-react'

// 定義資料介面
interface HistoryItem {
  id: string        // 這是 Post ID
  courseId: string  // 這是 Course ID (用來開啟討論串)
  name: string      // 課程名稱
  teacher: string
  lastComment: string
  time: string
  course_code?: string
}

interface DiscussionHistoryProps {
  user: any
  onOpenDiscussion: (course: any) => void
  onOpenLogin: () => void
}

export default function DiscussionHistory({ user, onOpenDiscussion, onOpenLogin }: DiscussionHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 1. 抓取資料
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true)
      fetch(`http://localhost:8000/api/forum/history?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          const formattedData = data.map((item: any) => ({
            ...item,
            time: new Date(item.time).toLocaleDateString() 
          }))
          setHistory(formattedData)
        })
        .catch(err => console.error('取得紀錄失敗', err))
        .finally(() => setIsLoading(false))
    }
  }, [user])

  // 2. 如果未登入，顯示鎖定畫面
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="w-20 h-20 bg-[var(--hover-bg)] rounded-3xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-[var(--sub-text)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--main-text)] mb-2">請先登入</h2>
        <p className="text-[var(--sub-text)] mb-8">登入後即可查看您的討論紀錄與追蹤課程</p>
        <button 
          onClick={onOpenLogin}
          className="bg-[var(--accent-bg)] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition active:scale-95"
        >
          登入 / 註冊
        </button>
      </div>
    )
  }

  // 3. 已登入，顯示列表
  return (
    <div className="animate-fade-in-up">
      {/* 標題區 */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-[var(--main-text)] tracking-tight">討論紀錄</h2>
        <p className="text-[var(--sub-text)] mt-2">早安，{user.name}。這是您參與過的討論。</p>
        
        {/* 停權警告提示 */}
        {user.status === 'banned' && (
           <div className="mt-4 inline-flex items-center gap-2 bg-red-100/30 text-red-600 px-4 py-2 rounded-full text-sm font-bold border border-red-300/50 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              您的帳號目前已被禁言，僅能瀏覽無法發言。
           </div>
        )}
      </div>

      {/* 列表容器 */}
      <div className="bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--border-color)] overflow-hidden max-w-4xl mx-auto min-h-[200px]">
        
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--sub-text)]">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>正在載入紀錄...</p>
            </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center text-[var(--sub-text)] flex flex-col items-center">
             <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
             目前沒有討論紀錄
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => {
                  onOpenDiscussion({
                      id: item.courseId,
                      name: item.name,
                      teacher: item.teacher,
                  })
              }}
              className="group flex items-center justify-between p-6 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--hover-bg)] cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-blue-100/30 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6" />
                </div>

                {/* 內容 */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[var(--main-text)] text-lg">{item.name}</h3>
                    <span className="text-xs bg-[var(--hover-bg)] text-[var(--sub-text)] px-2 py-0.5 rounded-full">{item.teacher}</span>
                  </div>
                  <p className="text-sm text-[var(--sub-text)] line-clamp-1 group-hover:text-[var(--main-text)]">
                    <span className="font-bold text-[var(--sub-text)] mr-2">您說:</span> 
                    {item.lastComment}
                  </p>
                </div>
              </div>

              {/* 右側資訊 */}
              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                   <div className="text-xs text-[var(--sub-text)] mb-1 flex items-center justify-end gap-1">
                     <Clock className="w-3 h-3" /> {item.time}
                   </div>
                 </div>
                 <ArrowRight className="w-5 h-5 text-[var(--sub-text)] group-hover:text-[var(--main-text)] transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}