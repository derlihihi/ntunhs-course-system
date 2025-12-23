'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  content: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* 彈窗本體 - 使用主題變數 */}
      <div className="relative bg-[var(--card-bg)] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[var(--border-color)]">
        
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-red-50 text-red-500' : 'bg-[var(--hover-bg)] text-[var(--accent-bg)]'}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          
          <h3 className="text-xl font-bold text-[var(--main-text)] mb-2">{title}</h3>
          
          <p className="text-sm text-[var(--sub-text)] leading-relaxed">
            {content}
          </p>
        </div>

        {/* 按鈕區 - 背景改為 hover-bg，邊框改為 border-color */}
        <div className="flex border-t border-[var(--border-color)] bg-[var(--hover-bg)]/50">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-[var(--sub-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--main-text)] transition border-r border-[var(--border-color)]"
          >
            {cancelText}
          </button>
          
          <button 
            onClick={onConfirm}
            className={`flex-1 py-4 text-sm font-bold transition hover:opacity-90 
              ${isDanger ? 'text-red-600 hover:bg-red-50' : 'text-[var(--accent-bg)] hover:bg-[var(--hover-bg)]'}`}
          >
            {confirmText}
          </button>
        </div>

        {/* 右上角關閉按鈕 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--sub-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--main-text)] transition"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
    </div>
  )
}