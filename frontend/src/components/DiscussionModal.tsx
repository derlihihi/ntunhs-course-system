'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, User, MessageCircle, Loader2, AlertTriangle } from 'lucide-react'

interface DiscussionModalProps {
  course: any
  user: any  // 🔥 關鍵：必須傳入 user，才知道是誰在留言
  onClose: () => void
}

export default function DiscussionModal({ course, user, onClose }: DiscussionModalProps) {
  const [comments, setComments] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. 載入該課程的留言
  const fetchComments = async () => {
    try {
      // 這裡假設你的 course 物件裡有 id (資料庫的 ID)
      // 如果 course.id 是 '0058' 這種代碼，要確保你後端是用哪個查
      // 這裡假設 course.id 就是資料庫的 PK (例如 1, 2, 3)
      const res = await fetch(`http://localhost:8000/api/forum/course/${course.id}`);
      if (res.ok) {
        const data = await res.json();
        // 整理資料格式
        const formattedData = data.map((item: any) => ({
          id: item.id,
          user: item.user_name, // 顯示真實姓名或暱稱
          department: item.department,
          content: item.content,
          time: new Date(item.created_at).toLocaleString(), // 簡單轉時間格式
          // 判斷這篇是不是自己發的 (比對 user_id)
          isMine: user && item.user_id === user.id 
        }));
        setComments(formattedData);
      }
    } catch (error) {
      console.error('載入留言失敗', error);
    }
  };

  // 初始載入
  useEffect(() => {
    setIsLoading(true);
    fetchComments().finally(() => setIsLoading(false));
  }, [course.id]);

  // 自動捲動到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments]);

  // 2. 發送留言
  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    
    // 如果被禁言，前端先擋 (雖然 User 還是可以透過 API 硬打，但後端有防守)
    if (user.status === 'banned') {
        alert('您已被禁言，無法發送訊息。');
        return;
    }

    setIsSending(true);

    try {
      const res = await fetch('http://localhost:8000/api/forum/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          content: inputText
        })
      });

      if (res.ok) {
        setInputText('');
        fetchComments(); // 發送成功後，重新抓取最新留言列表
      } else {
        alert('發送失敗，請稍後再試');
      }
    } catch (error) {
      console.error('發送錯誤', error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in-up">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      {/* Modal 本體 */}
      <div className="relative bg-[#F5F5F7] w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <MessageCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{course.name}</h3>
              <p className="text-xs text-gray-500">{course.teacher} · 課程討論區</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 留言列表區 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {isLoading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
                <p>目前還沒有人留言，搶頭香！🚀</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`flex gap-3 ${comment.isMine ? 'flex-row-reverse' : ''}`}>
                {/* 頭像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                  ${comment.isMine ? 'bg-black' : 'bg-gray-300'}`}>
                  <User className="w-4 h-4 text-white" />
                </div>

                {/* 氣泡內容 */}
                <div className={`max-w-[70%] space-y-1 ${comment.isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
                    <span>{comment.user}</span>
                    {/* 可以顯示系所 */}
                    {/* <span>({comment.department})</span> */}
                    <span>·</span>
                    <span>{comment.time}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                    ${comment.isMine 
                      ? 'bg-blue-500 text-white rounded-tr-sm' 
                      : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100' 
                    }`}>
                    {comment.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 輸入區 Footer */}
        <div className="bg-white p-4 border-t border-gray-200">
          
          {/* 禁言提示 */}
          {user && user.status === 'banned' && (
             <div className="mb-2 flex items-center justify-center gap-2 text-red-500 text-xs font-bold bg-red-50 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3" /> 您已被停權，無法發言
             </div>
          )}

          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
            <input 
              type="text" 
              className="flex-1 bg-transparent outline-none text-sm py-1 placeholder-gray-400 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={user?.status === 'banned' ? "您無法留言" : "輸入留言..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isSending || user?.status === 'banned'}
            />
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isSending || user?.status === 'banned'}
              className={`p-1.5 rounded-full transition-all flex items-center justify-center
                ${inputText.trim() && !isSending && user?.status !== 'banned'
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-gray-400">留言請遵守校園網路規範，保持理性討論。</p>
          </div>
        </div>

      </div>
    </div>
  )
}