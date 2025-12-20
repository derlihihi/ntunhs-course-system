'use client'

import { useState } from 'react'
import { X, User, Lock, Building2, IdCard, CheckCircle, Loader2 } from 'lucide-react'

// --- 設定區：要切換「真實 API」或「模擬測試」請改這裡 ---
const USE_MOCK_API = true; // <--- 改成 false 就會真的打後端 API

// 定義後端 API 網址 (當 USE_MOCK_API = false 時才會用到)
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

    // 1. 前端基本檢查
    if (isRegister && formData.password !== formData.confirmPassword) {
      setErrorMsg('兩次密碼輸入不一致，請重新檢查！');
      setIsLoading(false);
      return;
    }

    try {
      let userData;

      if (USE_MOCK_API) {
        // ==========================================
        // [模式 A] 模擬測試模式 (無後端時使用)
        // ==========================================
        console.log('正在使用模擬登入...');
        await new Promise(resolve => setTimeout(resolve, 800)); // 假裝跑一下 Loading

        // 模擬驗證：帳號密碼都不能是空的
        if (!formData.studentId || !formData.password) {
          throw new Error('請輸入帳號密碼');
        }

        // 模擬管理者帳號
        const isAdmin = formData.studentId === 'admin' && formData.password === 'admin123';

        userData = {
          name: isAdmin ? '系統管理員' : (isRegister ? formData.name : '吳名式'),
          id: formData.studentId,
          department: isAdmin ? '教務處' : (isRegister ? formData.department : '資訊管理系'),
          role: isAdmin ? 'admin' : 'student',
          isLoggedIn: true
        };

      } else {
        // ==========================================
        // [模式 B] 真實 API 模式 (接上後端時使用)
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

        // 整理後端回傳的資料
        userData = {
          ...data.user,
          role: data.user.role === 0 ? 'admin' : 'student',
          isLoggedIn: true
        };
      }

      // 共通的成功處理
      localStorage.setItem('user', JSON.stringify(userData)); // 儲存登入狀態
      onLoginSuccess(userData);
      onClose();
      // alert(isRegister ? '註冊成功！已自動登入' : '登入成功！'); // 不需要一直彈窗干擾

    } catch (err: any) {
      console.error('Login Error:', err);
      setErrorMsg(err.message || '系統發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 animate-fade-in-up">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
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

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg flex items-center gap-2">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errorMsg}
              </div>
            )}

            {/* 註冊欄位：系所 */}
            {isRegister && (
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
                    {/* ... 其他系所選項保持原樣 ... */}
                  </select>
                </div>
              </div>
            )}

            {/* 註冊欄位：姓名 */}
            {isRegister && (
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
            )}

            {/* 學號 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">學號 / 員工編號</label>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <IdCard className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="例如：11124001" 
                  className="bg-transparent outline-none flex-1 text-sm font-medium"
                  required
                  value={formData.studentId}
                  onChange={e => setFormData({...formData, studentId: e.target.value})}
                />
              </div>
            </div>

            {/* 密碼 */}
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

            {/* 確認密碼 */}
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

            <button 
              disabled={isLoading}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-lg mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isRegister ? '註冊帳號' : '登入系統'}
            </button>

          </form>
        </div>

        <div className="bg-gray-50 p-4 text-center text-sm border-t border-gray-100">
          <p className="text-gray-500">
            {isRegister ? '已經有帳號了嗎？' : '還沒有帳號嗎？'}
            <button 
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setErrorMsg('')
                setFormData({ ...formData, password: '', confirmPassword: '' })
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