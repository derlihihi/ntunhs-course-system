'use client'

import { useState } from 'react'
import { X, Trash2, User, MessageSquare } from 'lucide-react'
import ConfirmModal from '../ConfirmModal'

interface AdminDiscussionModalProps {
  course: any
  onClose: () => void
}

const MOCK_COURSE_COMMENTS = [
  { id: 101, user: '陳小美', content: '請問這堂課需要買課本嗎？', date: '2024-02-18 10:00', status: 'normal' },
  { id: 102, user: '林大華', content: '老師上課很有趣，分組報告要找好組員。', date: '2024-02-19 14:30', status: 'normal' },
  { id: 103, user: '王小明', content: '這堂課根本是浪費時間...(此留言涉及攻擊)', date: '2024-02-20 09:15', status: 'normal' },
]

export default function AdminDiscussionModal({ course, onClose }: AdminDiscussionModalProps) {
  const [comments, setComments] = useState(MOCK_COURSE_COMMENTS)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
  }

  const executeDelete = () => {
    if (deletingId) {
      setComments(comments.map(c => 
        c.id === deletingId 
          ? { ...c, status: 'deleted', content: '(此留言因違反版規已被管理員移除)' } 
          : c
      ))
      setDeletingId(null)
    }
  }

  const targetComment = deletingId ? comments.find(c => c.id === deletingId) : null

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in-up">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose}></div>
        
        <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{course.id}</span>
                <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> 討論區管理 ({comments.length} 則留言)
              </p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F5F7]">
            {comments.length === 0 ? (
              <div className="text-center py-10 text-gray-400">目前沒有留言</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition hover:shadow-md">
                  
                  {/* 修改處：使用統一風格的 User Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100">
                      <User className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{comment.user}</span>
                        <span className="text-xs text-gray-400 ml-2">{comment.date}</span>
                      </div>
                      
                      {comment.status !== 'deleted' && (
                        <button 
                          onClick={() => handleDeleteClick(comment.id)} 
                          className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition"
                          title="刪除留言"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <p className={`mt-2 text-sm leading-relaxed ${comment.status === 'deleted' ? 'text-red-400 italic' : 'text-gray-700'}`}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="z-[80] relative">
        {deletingId && (
          <ConfirmModal
            title="刪除留言確認"
            content={`您確定要刪除 ${targetComment?.user} 的留言：「${targetComment?.content}」嗎？刪除後內容將無法檢視。`}
            confirmText="確認刪除"
            isDanger={true}
            onConfirm={executeDelete}
            onClose={() => setDeletingId(null)}
          />
        )}
      </div>
    </>
  )
}