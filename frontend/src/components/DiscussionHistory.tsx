'use client'

import { MessageCircle, ArrowRight, Clock, Lock } from 'lucide-react'

// 模擬的歷史紀錄 (未來從 DB 抓)
const MOCK_HISTORY = [
  { id: '0058', name: '系統分析與設計', teacher: '連中岳', lastComment: '請問期中考是考筆試還是上機？', time: '1天前', count: 12 },
  { id: '0132', name: '網頁程式設計', teacher: '林劍秋', lastComment: '老師說下週要交期末專案題目...', time: '3天前', count: 5 },
  { id: '0205', name: '資料庫管理', teacher: '陳偉業', lastComment: '有人知道這堂課有點名嗎？', time: '1週前', count: 8 },
]

interface DiscussionHistoryProps {
  user: any
  onOpenDiscussion: (course: any) => void
  onOpenLogin: () => void
}

export default function DiscussionHistory({ user, onOpenDiscussion, onOpenLogin }: DiscussionHistoryProps) {
  
  // 1. 如果未登入，顯示鎖定畫面
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">請先登入</h2>
        <p className="text-gray-500 mb-8">登入後即可查看您的討論紀錄與追蹤課程</p>
        <button 
          onClick={onOpenLogin}
          className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition active:scale-95"
        >
          登入 / 註冊
        </button>
      </div>
    )
  }

  // 2. 已登入，顯示列表
  return (
    <div className="animate-fade-in-up">
      {/* 標題區 */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">討論紀錄</h2>
        <p className="text-gray-500 mt-2">早安，{user.name}。這是您參與過的討論。</p>
      </div>

      {/* 列表容器 */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden max-w-4xl mx-auto">
        {MOCK_HISTORY.map((item, index) => (
          <div 
            key={item.id} 
            onClick={() => onOpenDiscussion(item)}
            className="group flex items-center justify-between p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6" />
              </div>

              {/* 內容 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{item.teacher}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1 group-hover:text-gray-700">
                  <span className="font-bold text-gray-400 mr-2">最新回應:</span> 
                  {item.lastComment}
                </p>
              </div>
            </div>

            {/* 右側資訊 */}
            <div className="flex items-center gap-6">
               <div className="text-right hidden sm:block">
                 <div className="text-xs text-gray-400 mb-1 flex items-center justify-end gap-1">
                   <Clock className="w-3 h-3" /> {item.time}
                 </div>
                 <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
                   {item.count} 則留言
                 </div>
               </div>
               <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}

        {MOCK_HISTORY.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            目前沒有討論紀錄
          </div>
        )}
      </div>
    </div>
  )
}