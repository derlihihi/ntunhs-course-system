'use client'

import { useState } from 'react'
import { X, User, Lock, Building2, IdCard, CheckCircle, Loader2 } from 'lucide-react'

// 🔥 設定為 false，使用真實後端 API
const USE_MOCK_API = false; 
const API_PORT = 8000;
const API_BASE_URL = `http://localhost:${API_PORT}/api/auth`;

interface AuthModalProps {
  onClose: () => void
  onLoginSuccess: (userData: any) => void
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    department: '資訊管理系',
    name: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    if (isRegister && formData.password !== formData.confirmPassword) {
      setErrorMsg('兩次密碼輸入不一致，請重新檢查！');
      setIsLoading(false);
      return;
    }

    try {
      let userData;
      
      if (USE_MOCK_API) {
        // ... (模擬登入邏輯保持不動，略過) ...
        console.log('Mock login...');
        userData = { /* ... */ }; 
      } else {
        // ==========================================
        // 🔥 真實 API 串接區塊
        // ==========================================
        const endpoint = isRegister ? '/register' : '/login';
        const url = `${API_BASE_URL}${endpoint}`;
        
        const payload = isRegister
          ? {
              studentId: formData.studentId,
              password: formData.password,
              name: formData.name,
              department: formData.department
            }
          : {
              studentId: formData.studentId,
              password: formData.password
            };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '操作失敗，請稍後再試');
        }

        // 🔥 關鍵轉換邏輯
        userData = {
          ...data.user, // 這會包含後端回傳的正確 id (數字)，例如: 4
          
          // 轉換 Role：後端 0 -> 前端 'admin'，其他 -> 'student'
          role: (data.user.role === 0 || data.user.role === '0' || data.user.role === 'admin') ? 'admin' : 'student',
          
          isLoggedIn: true
        };
        
        console.log('登入成功，使用者資料:', userData);
      }

      // 儲存到 LocalStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // 更新 App 狀態
      onLoginSuccess(userData);
      onClose();

    } catch (err: any) {
      console.error('Login Error:', err);
      setErrorMsg(err.message || '系統發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in-up">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose}></div>
      
      {/* 卡片本體：使用 CSS 變數適配主題 */}
      <div className="relative bg-[var(--card-bg)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
        
        {/* Header */}
        <div className="p-6 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-[var(--main-text)]">{isRegister ? '建立帳號' : '歡迎回來'}</h2>
            <p className="text-sm text-[var(--sub-text)] mt-1">
              {isRegister ? '註冊以開始選課與討論' : '登入以存取您的課表'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-[var(--hover-bg)] rounded-full hover:opacity-80 transition text-[var(--sub-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 錯誤訊息 */}
            {errorMsg && (
              <div className="p-3 bg-red-100/30 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-300/50">
                <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                {errorMsg}
              </div>
            )}

            {/* --- 註冊專用欄位 --- */}
            {isRegister && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--sub-text)] ml-1">系所</label>
                  <div className="flex items-center gap-3 bg-[var(--hover-bg)] border border-[var(--border-color)] px-4 py-3 rounded-xl focus-within:border-[var(--accent-bg)] focus-within:ring-1 focus-within:ring-[var(--accent-bg)] transition-all">
                    <Building2 className="w-5 h-5 text-[var(--sub-text)]" />
                    <select 
                      className="bg-transparent outline-none flex-1 text-sm font-medium text-[var(--main-text)]"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                    <option value="">請選擇系所...</option>
                    <option value="護理系">護理系</option>
                    <option value="高齡健康照護系">高齡健康照護系</option>
                    <option value="健康事業管理系">健康事業管理系</option>
                    <option value="資訊管理系">資訊管理系</option>
                    <option value="休閒產業與健康促進系">休閒產業與健康促進系</option>
                    <option value="語言治療與聽力學系">語言治療與聽力學系</option>
                    <option value="嬰幼兒保育系">嬰幼兒保育系</option>
                    <option value="運動保健系">運動保健系</option>
                    <option value="生死與健康心理諮商系">生死與健康心理諮商系</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--sub-text)] ml-1">姓名</label>
                  <div className="flex items-center gap-3 bg-[var(--hover-bg)] border border-[var(--border-color)] px-4 py-3 rounded-xl focus-within:border-[var(--accent-bg)] focus-within:ring-1 focus-within:ring-[var(--accent-bg)] transition-all">
                    <User className="w-5 h-5 text-[var(--sub-text)]" />
                    <input 
                      type="text" 
                      placeholder="請輸入真實姓名" 
                      className="bg-transparent outline-none flex-1 text-sm font-medium text-[var(--main-text)] placeholder-[var(--sub-text)]/50"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            {/* 學號 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--sub-text)] ml-1">學號 / 員工編號</label>
              <div className="flex items-center gap-3 bg-[var(--hover-bg)] border border-[var(--border-color)] px-4 py-3 rounded-xl focus-within:border-[var(--accent-bg)] focus-within:ring-1 focus-within:ring-[var(--accent-bg)] transition-all">
                <IdCard className="w-5 h-5 text-[var(--sub-text)]" />
                <input 
                  type="text" 
                  placeholder="例如：122214250" 
                  className="bg-transparent outline-none flex-1 text-sm font-medium text-[var(--main-text)] placeholder-[var(--sub-text)]/50"
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                />
              </div>
            </div>

            {/* 密碼 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--sub-text)] ml-1">密碼</label>
              <div className="flex items-center gap-3 bg-[var(--hover-bg)] border border-[var(--border-color)] px-4 py-3 rounded-xl focus-within:border-[var(--accent-bg)] focus-within:ring-1 focus-within:ring-[var(--accent-bg)] transition-all">
                <Lock className="w-5 h-5 text-[var(--sub-text)]" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-transparent outline-none flex-1 text-sm font-medium text-[var(--main-text)] placeholder-[var(--sub-text)]/50"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* 確認密碼 */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--sub-text)] ml-1">確認密碼</label>
                <div className="flex items-center gap-3 bg-[var(--hover-bg)] border border-[var(--border-color)] px-4 py-3 rounded-xl focus-within:border-[var(--accent-bg)] focus-within:ring-1 focus-within:ring-[var(--accent-bg)] transition-all">
                  <CheckCircle className="w-5 h-5 text-[var(--sub-text)]" />
                  <input 
                    type="password" 
                    placeholder="請再次輸入密碼" 
                    className="bg-transparent outline-none flex-1 text-sm font-medium text-[var(--main-text)] placeholder-[var(--sub-text)]/50"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button 
              disabled={isLoading}
              className="w-full bg-[var(--accent-bg)] text-[var(--accent-text)] font-bold py-4 rounded-xl hover:opacity-90 transition active:scale-95 shadow-lg mt-4 disabled:bg-[var(--hover-bg)] disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isRegister ? '註冊帳號' : '登入系統'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <div className="bg-[var(--hover-bg)] p-4 text-center text-sm border-t border-[var(--border-color)]">
          <p className="text-[var(--sub-text)]">
            {isRegister ? '已經有帳號了嗎？' : '還沒有帳號嗎？'}
            <button 
              type="button" 
              onClick={() => {
                setIsRegister(!isRegister)
                setErrorMsg('')
                setFormData({ ...formData, password: '', confirmPassword: '' })
              }}
              className="font-bold text-[var(--main-text)] ml-2 hover:underline"
            >
              {isRegister ? '立即登入' : '註冊新生帳號'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}