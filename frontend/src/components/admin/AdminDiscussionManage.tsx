'use client'

import { useState } from 'react'
import { Trash2, MessageSquare, User } from 'lucide-react' // 新增 User icon
import ConfirmModal from '../ConfirmModal'

interface AdminDiscussionManageProps {
  comments: any[]
  setComments: (comments: any[]) => void
}

export default function AdminDiscussionManage({ comments, setComments }: AdminDiscussionManageProps) {
  
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <MessageSquare className="w-6 h-6 text-gray-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">最新留言</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                {/* 修改處：移除文字，改用 User Icon */}
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{comment.user}</span>
                    <span className="text-xs text-gray-400">• {comment.date}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    評論課程：<span className="font-bold text-gray-700">{comment.course}</span>
                  </div>
                </div>
              </div>
              
              {comment.status !== 'deleted' && (
                <button 
                  onClick={() => handleDeleteClick(comment.id)} 
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title="刪除 / 遮蔽留言"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${comment.status === 'deleted' ? 'bg-red-50 text-red-400 italic' : 'bg-gray-50 text-gray-700'}`}>
              {comment.content}
            </div>
          </div>
        ))}
      </div>

      {deletingId && (
        <ConfirmModal
          title="刪除留言確認"
          content={`您確定要刪除 ${targetComment?.user} 在「${targetComment?.course}」的留言嗎？`}
          confirmText="確認刪除"
          isDanger={true}
          onConfirm={executeDelete}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}