'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, User, MessageSquare, Loader2 } from 'lucide-react'
import ConfirmModal from '../ConfirmModal'

interface AdminDiscussionModalProps {
  course: any
  onClose: () => void
}

export default function AdminDiscussionModal({ course, onClose }: AdminDiscussionModalProps) {
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 🔥 載入該課程的留言
  useEffect(() => {
    const fetchComments = async () => {
      // 確保 course.id 存在，如果是用 courseCode 搜尋的，要確認 id 是哪個欄位
      const courseId = course.id || course.course_code; 
      
      try {
        const res = await fetch(`http://localhost:8000/api/forum/course/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.error('Fetch comments error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (course) {
      fetchComments();
    }
  }, [course]);

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
  }

  // 🔥 刪除留言
  const executeDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);

    try {
        const res = await fetch(`http://localhost:8000/api/forum/${deletingId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            setComments(prev => prev.filter(c => c.id !== deletingId));
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
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in-up">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose}></div>
        
        <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">{course.id || course.code}</span>
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
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>載入留言中...</p>
                </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10 text-gray-400">目前沒有留言</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 transition hover:shadow-md">
                  
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border border-gray-100">
                      <User className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        {/* 這裡同樣要注意後端回傳的欄位名稱 */}
                        <span className="font-bold text-gray-900 text-sm">{comment.user_name || comment.user_id || '匿名'}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(comment.created_at || comment.date).toLocaleDateString()}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteClick(comment.id)} 
                        className="text-gray-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition"
                        title="刪除留言"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
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
            content={`您確定要刪除此則留言：「${targetComment?.content}」嗎？刪除後內容將無法檢視。`}
            confirmText={isDeleting ? "刪除中..." : "確認刪除"}
            isDanger={true}
            onConfirm={executeDelete}
            onClose={() => !isDeleting && setDeletingId(null)}
          />
        )}
      </div>
    </>
  )
}