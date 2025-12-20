'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, User, MoreHorizontal, MessageCircle } from 'lucide-react'

interface DiscussionModalProps {
  course: any
  onClose: () => void
}

// 模擬留言資料
const MOCK_COMMENTS = [
  { id: 1, user: '匿名同學 (資管系)', content: '這堂課老師人很好，只要有去上課通常都會過！', time: '2天前', isMine: false },
  { id: 2, user: '我', content: '請問期中考是考筆試還是上機？', time: '1天前', isMine: true },
  { id: 3, user: '匿名學長', content: '期中考是筆試喔，主要考名詞解釋跟畫圖，考古題很重要。', time: '5小時前', isMine: false },
]

export default function DiscussionModal({ course, onClose }: DiscussionModalProps) {
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // 自動捲動到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments])

  const handleSend = () => {
    if (!inputText.trim()) return
    const newComment = {
      id: Date.now(),
      user: '我',
      content: inputText,
      time: '剛剛',
      isMine: true
    }
    setComments([...comments, newComment])
    setInputText('')
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* 背景遮罩 (毛玻璃) */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity" onClick={onClose}></div>
      
      {/* Modal 本體 (Apple 風格彈窗) */}
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

        {/* 留言列表區 (類似聊天室) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {comments.map((comment) => (
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
                  <span>·</span>
                  <span>{comment.time}</span>
                </div>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${comment.isMine 
                    ? 'bg-blue-500 text-white rounded-tr-sm' // Apple iMessage Blue
                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100' // Apple Received Gray
                  }`}>
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 輸入區 Footer */}
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
            <input 
              type="text" 
              className="flex-1 bg-transparent outline-none text-sm py-1 placeholder-gray-400 text-gray-900"
              placeholder="輸入留言 (匿名)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              className={`p-1.5 rounded-full transition-all ${inputText.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <Send className="w-4 h-4" />
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