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
      const res = await fetch(`http://localhost:8000/api/forum/course/${course.id}`);
      if (res.ok) {
        const data = await res.json();
        const formattedData = data.map((item: any) => ({
          id: item.id,
          user: item.user_name,
          department: item.department,
          content: item.content,
          time: new Date(item.created_at).toLocaleString(),
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

      const data = await res.json();

      if (res.ok) {
        setInputText('');
        fetchComments(); 
      } else {
        alert(data.message || '發送失敗');
      }
    } catch (error) {
      console.error('發送錯誤', error);
      alert('連線錯誤');
    } finally {
      setIsSending(false);
    }
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in-up">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      {/* Modal 本體 */}
      <div className="relative bg-[var(--hover-bg)] w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        
        {/* Header */}
        <div className="bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--border-color)] p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--hover-bg)] p-2 rounded-full">
              <MessageCircle className="w-6 h-6 text-[var(--sub-text)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--main-text)] text-lg leading-tight">{course.name}</h3>
              <p className="text-xs text-[var(--sub-text)]">{course.teacher} · 課程討論區</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-[var(--hover-bg)] hover:opacity-80 rounded-full transition text-[var(--sub-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 留言列表區 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {isLoading ? (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--sub-text)]" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-[var(--sub-text)] mt-10">
                <p>目前還沒有人留言，搶頭香！🚀</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`flex gap-3 ${comment.isMine ? 'flex-row-reverse' : ''}`}>
                {/* 頭像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                  ${comment.isMine ? 'bg-[var(--accent-bg)]' : 'bg-[var(--hover-bg)]'}`}>
                  <User className="w-4 h-4 text-white" />
                </div>

                {/* 氣泡內容 */}
                <div className={`max-w-[70%] space-y-1 ${comment.isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-center gap-2 text-xs text-[var(--sub-text)] px-1">
                    <span>{comment.user}</span>
                    <span>·</span>
                    <span>{comment.time}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words
                    ${comment.isMine 
                      ? 'bg-[var(--accent-bg)] text-white rounded-tr-sm' 
                      : 'bg-[var(--card-bg)] text-[var(--main-text)] rounded-tl-sm border border-[var(--border-color)]' 
                    }`}>
                    {comment.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 輸入區 Footer */}
        <div className="bg-[var(--card-bg)] p-4 border-t border-[var(--border-color)]">
          
          {/* 禁言提示 */}
          {user && user.status === 'banned' && (
             <div className="mb-2 flex items-center justify-center gap-2 text-red-500 text-xs font-bold bg-red-100/30 py-1 rounded-lg border border-red-300/50">
                <AlertTriangle className="w-3 h-3" /> 您已被停權，無法發言
             </div>
          )}

          <div className="flex items-center gap-3 bg-[var(--hover-bg)] px-4 py-2 rounded-full border border-transparent focus-within:border-[var(--accent-color)] focus-within:bg-[var(--card-bg)] transition-all">
            <input 
              type="text" 
              className="flex-1 bg-transparent outline-none text-sm py-1 placeholder-[var(--sub-text)] text-[var(--main-text)] disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ? 'bg-[var(--accent-bg)] text-white hover:opacity-90' 
                    : 'bg-[var(--hover-bg)] text-[var(--sub-text)] cursor-not-allowed'}`}
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-center mt-2">
             <p className="text-[10px] text-[var(--sub-text)]">留言請遵守校園網路規範，保持理性討論。</p>
          </div>
        </div>

      </div>
    </div>
  )
}