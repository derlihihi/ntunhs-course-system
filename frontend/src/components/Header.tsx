'use client'

import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, User, ChevronDown, LogOut, ShieldCheck } from 'lucide-react'

// 定義 User 的介面，讓它符合後端回傳的格式
interface UserData {
  name: string;
  department: string;
  student_id?: string; // 資料庫欄位名稱
  id?: string;         // 相容舊有格式
  role: string | number; // 可能是 'admin' 字串或是 0/1 數字
}

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  cartCount: number
  onOpenCart: () => void
  user: UserData | null // 使用上面定義的介面
  onOpenLogin: () => void
  onLogout: () => void
}

const NAV_ITEMS = ['課程查詢', '預先選課', '討論紀錄']

export default function Header({ activeTab, setActiveTab, cartCount, onOpenCart, user, onOpenLogin, onLogout }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // 點擊外部關閉選單
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 判斷是否為管理員的輔助函式
  const isAdmin = user?.role === 'admin' || user?.role === 0;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 h-[70px] flex items-center justify-between px-6 md:px-10 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">N</div>
        <span className="text-lg font-bold text-gray-900 tracking-tight hidden md:block">國北護課程系統</span>
      </div>

      <nav className="hidden md:flex items-center gap-10 h-full">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`relative h-full flex items-center text-sm font-bold transition-colors duration-200
              ${activeTab === item ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {item}
            {activeTab === item && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {/* 購物車按鈕：只有登入才顯示，或是你想一直顯示也可以 */}
        <button onClick={onOpenCart} className="relative p-2.5 rounded-full hover:bg-gray-100 transition text-gray-600 group">
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
        </button>
        
        {user ? (
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-200 transition active:scale-95 border border-transparent hover:border-gray-300"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 shadow-sm border border-gray-200">
                {/* 根據角色顯示不同 Icon */}
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:block">{user.name}</span>
              <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-up z-50 origin-top-right">
                <div className="px-6 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wide">
                    {isAdmin ? '管理員' : '學生'}名稱
                  </p>
                  <p className="text-lg font-bold text-gray-900 truncate">{user.name}</p>
                </div>
                <div className="py-2">
                  <div className="px-6 py-2.5 hover:bg-gray-50 transition cursor-default">
                    <p className="text-xs text-gray-400 font-bold mb-0.5">學號 / 編號</p>
                    {/* 這裡改成顯示 student_id，如果沒有就找 id */}
                    <p className="text-sm font-bold text-gray-700 font-mono tracking-wide">
                      {user.student_id || user.id}
                    </p>
                  </div>
                  <div className="px-6 py-2.5 hover:bg-gray-50 transition cursor-default">
                    <p className="text-xs text-gray-400 font-bold mb-0.5">系所 / 單位</p>
                    <p className="text-sm font-bold text-gray-700">{user.department}</p>
                  </div>
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false); // 登出後關閉選單
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-white bg-transparent py-3 rounded-xl transition shadow-sm hover:shadow-md border border-transparent hover:border-gray-100"
                  >
                    <LogOut className="w-4 h-4" /> 登出系統
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onOpenLogin}
            className="hidden sm:flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-gray-200 active:scale-95"
          >
            <User className="w-4 h-4" /> 登入
          </button>
        )}
      </div>
    </header>
  )
}