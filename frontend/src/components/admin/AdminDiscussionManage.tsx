'use client'

import { useState } from 'react'
import { Trash2, MessageSquare, User, Loader2 } from 'lucide-react'
import ConfirmModal from '../ConfirmModal'

interface AdminDiscussionManageProps {
  comments: any[]
  setComments: (comments: any[]) => void
}

export default function AdminDiscussionManage({ comments, setComments }: AdminDiscussionManageProps) {
  
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
  }

  // 🔥 關鍵修改：執行刪除 (打 API)
  const executeDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
        const res = await fetch(`http://localhost:8000/api/forum/${deletingId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            // 從列表移除該留言
            setComments(comments.filter(c => c.id !== deletingId));
            setDeletingId(null);
        } else {
            alert('刪除失敗');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('連線錯誤');
    } finally {
        setIsDeleting(false);
    }
  }

  const targetComment = deletingId ? comments.find(c => c.id === deletingId) : null

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <MessageSquare className="w-6 h-6 text-gray-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">最新留言 ({comments.length})</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {comments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-3xl border border-gray-100">目前沒有留言</div>
        ) : (
            comments.map(comment => (
            <div key={comment.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100">
                    <User className="w-5 h-5" />
                    </div>
                    <div>
                    <div className="flex items-center gap-2">
                        {/* 注意：這裡要確認後端回傳的欄位名稱 (user_name 或 user) */}
                        <span className="text-sm font-bold text-gray-900">{comment.user_name || comment.user || '匿名'}</span>
                        <span className="text-xs text-gray-400">• {new Date(comment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        評論課程：<span className="font-bold text-gray-700">{comment.course_name || comment.course}</span>
                    </div>
                    </div>
                </div>
                
                <button 
                    onClick={() => handleDeleteClick(comment.id)} 
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    title="刪除留言"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                </div>
                
                <div className="p-4 rounded-2xl text-sm leading-relaxed bg-gray-50 text-gray-700">
                {comment.content}
                </div>
            </div>
            ))
        )}
      </div>

      {deletingId && (
        <ConfirmModal
          title="刪除留言確認"
          content={`您確定要刪除此則留言嗎？刪除後無法復原。`}
          confirmText={isDeleting ? "刪除中..." : "確認刪除"}
          isDanger={true}
          onConfirm={executeDelete}
          onClose={() => !isDeleting && setDeletingId(null)}
        />
      )}
    </div>
  )
}