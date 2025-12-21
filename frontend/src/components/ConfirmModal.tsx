'use client'

import { X, AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean // 如果是刪除/登出，按鈕變紅色
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({ 
  title, 
  content, 
  confirmText = '確認', 
  cancelText = '取消', 
  isDanger = false,
  onConfirm, 
  onClose 
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in-up">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose}></div>
      
      {/* 彈窗本體 */}
      <div className="relative bg-[var(--card-bg)] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 text-center transform transition-all scale-100">
        
        <div className="w-12 h-12 bg-[var(--hover-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className={`w-6 h-6 ${isDanger ? 'text-red-500' : 'text-[var(--main-text)]'}`} />
        </div>

        <h3 className="text-xl font-bold text-[var(--main-text)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--sub-text)] mb-8 leading-relaxed">
          {content}
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-[var(--hover-bg)] hover:opacity-80 text-[var(--main-text)] font-bold py-3 rounded-xl transition"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 font-bold py-3 rounded-xl text-white transition shadow-lg active:scale-95
              ${isDanger 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200/50' 
                : 'bg-[var(--accent-bg)] hover:opacity-90 shadow-[var(--accent-bg)]/30'
              }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  )
}