'use client'

import { useState } from 'react'
import { X, User, Lock, Building2, IdCard, CheckCircle } from 'lucide-react'

interface AuthModalProps {
  onClose: () => void
  onLoginSuccess: (userData: any) => void
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false) // 控制是登入還是註冊模式
  
  // 表單資料
  const [formData, setFormData] = useState({
    department: '資訊管理系',
    name: '',
    studentId: '',
    password: '',
    confirmPassword: '' // 新增確認密碼
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 1. 註冊時的額外檢查
    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        alert('兩次密碼輸入不一致，請重新檢查！')
        return
      }
      // 這裡未來會發送 API 到後端註冊
      console.log('註冊資料:', formData)
    }

    // 2. 模擬管理者登入邏輯 (開發階段用，正式環境請交給後端判斷)
    // 假設管理者帳號是 "admin"，密碼是 "admin123"
    const isAdmin = formData.studentId === 'admin' && formData.password === 'admin123'

    // 3. 建構使用者資料 (模擬後端回傳)
    const mockUser = {
      name: isAdmin ? '系統管理員' : (isRegister ? formData.name : '吳名式'),
      id: formData.studentId,
      department: isAdmin ? '教務處' : (isRegister ? formData.department : '資訊管理系'),
      role: isAdmin ? 'admin' : 'student', // 區分角色
      isLoggedIn: true
    }

    onLoginSuccess(mockUser)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in-up">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose}></div>
      
      {/* 卡片本體 */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{isRegister ? '建立帳號' : '歡迎回來'}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isRegister ? '註冊以開始選課與討論' : '登入以存取您的課表'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* --- 註冊專用欄位開始 --- */}
            {isRegister && (
              <>
                {/* 1. 系所 (下拉選單) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">系所</label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <select 
                      className="bg-transparent outline-none flex-1 text-sm font-medium text-gray-700"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                      <option value="資訊管理系">資訊管理系</option>
                      <option value="護理系">護理系</option>
                      <option value="幼保系">幼保系</option>
                      <option value="運動保健系">運動保健系</option>
                    </select>
                  </div>
                </div>

                {/* 2. 姓名 */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">姓名</label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                    <User className="w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="請輸入真實姓名" 
                      className="bg-transparent outline-none flex-1 text-sm font-medium"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}
            {/* --- 註冊專用欄位結束 --- */}

            {/* 3. 學號 (登入/註冊共用) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">學號 / 員工編號</label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <IdCard className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="例如：122214250" 
                  className="bg-transparent outline-none flex-1 text-sm font-medium"
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                />
              </div>
            </div>

            {/* 4. 密碼 (登入/註冊共用) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">密碼</label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <Lock className="w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-transparent outline-none flex-1 text-sm font-medium"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* 5. 確認密碼 (註冊專用) */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">確認密碼</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    placeholder="請再次輸入密碼" 
                    className="bg-transparent outline-none flex-1 text-sm font-medium"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-lg mt-4">
              {isRegister ? '註冊帳號' : '登入系統'}
            </button>

          </form>
        </div>

        {/* Footer Toggle */}
        <div className="bg-gray-50 p-4 text-center text-sm border-t border-gray-100">
          <p className="text-gray-500">
            {isRegister ? '已經有帳號了嗎？' : '還沒有帳號嗎？'}
            <button 
              onClick={() => {
                setIsRegister(!isRegister)
                setFormData({ ...formData, password: '', confirmPassword: '' }) // 切換時清空密碼
              }}
              className="font-bold text-black ml-2 hover:underline"
            >
              {isRegister ? '立即登入' : '註冊新生帳號'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}