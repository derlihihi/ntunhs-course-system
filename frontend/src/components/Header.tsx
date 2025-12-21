'use client'

import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, User, ChevronDown, LogOut, ShieldCheck, Palette, Check, LogIn } from 'lucide-react'

// --- 1. 重新定義主題介面與色票 ---
export interface Theme {
  id: string;
  name: string;
  colors: {
    appBg: string;      // 最外層應用程式背景
    headerBg: string;   // Header 背景 (通常帶透明度)
    cardBg: string;     // 卡片/區塊背景 (如搜尋框)
    mainText: string;   // 主要文字顏色
    subText: string;    // 次要文字顏色 (麵包屑、說明)
    border: string;     // 邊框顏色
    accentBg: string;   // 強調色背景 (按鈕、Active Tab)
    accentText: string; // 強調色背景上的文字顏色
    hoverBg: string;    // 通用 Hover 背景色
    colorPreview: string; // 用於色票選擇器的預覽色
  }
}

// 根據提供的圖片定義色票
export const THEMES: Theme[] = [
  {
    id: 'default', name: '預設 (極簡灰)',
    colors: {
      appBg: '#F5F5F7', headerBg: 'rgba(255,255,255,0.8)', cardBg: '#ffffff',
      mainText: '#111827', subText: '#6B7280', border: '#E5E7EB',
      accentBg: '#000000', accentText: '#ffffff', hoverBg: '#F3F4F6',
      colorPreview: '#F5F5F7'
    }
  },
  // Image 5: Gray Blue + Dark Blue
  {
    id: 'grayblue', name: '莫蘭迪藍灰',
    colors: {
      appBg: '#cecbcc', headerBg: 'rgba(220,218,219,0.8)', cardBg: '#e4e6df',
      mainText: '#1f3555', subText: '#515561', border: '#9ca3af',
      accentBg: '#1f3555', accentText: '#cecbcc', hoverBg: '#b0b3b8',
      colorPreview: '#1f3555'
    }
  },
   // Image 3: Beige + Brown
  {
    id: 'beigebrown', name: '溫暖褐米',
    colors: {
      appBg: '#ede8e3', headerBg: 'rgba(245,242,239,0.8)', cardBg: '#dad0c7',
      mainText: '#514935', subText: '#907e6e', border: '#c5bba4',
      accentBg: '#514935', accentText: '#ede8e3', hoverBg: '#d0c5bc',
      colorPreview: '#514935'
    }
  },
  // Image 2: Beige + Dark Blue
  {
    id: 'beigedarkblue', name: '復古深藍米',
    colors: {
      appBg: '#eee7d3', headerBg: 'rgba(248,244,232,0.8)', cardBg: '#dfd7bb',
      mainText: '#103946', subText: '#7a6f55', border: '#b8af93',
      accentBg: '#103946', accentText: '#eee7d3', hoverBg: '#dcd3b7',
      colorPreview: '#103946'
    }
  },
   // Image 4: White + Gold (Adjusted for readability)
  {
    id: 'whitegold', name: '輕奢白金',
    colors: {
      appBg: '#e4e6df', headerBg: 'rgba(240,242,235,0.8)', cardBg: '#f0f2ec',
      mainText: '#5c533a', subText: '#a89f86', border: '#d4c390',
      accentBg: '#d4c390', accentText: '#ffffff', hoverBg: '#dcded7',
      colorPreview: '#d4c390'
    }
  },
]

// 定義 User 的介面
interface UserData {
  name: string;
  department: string;
  student_id?: string;
  id?: string;        
  role: string | number;
}

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  cartCount: number
  onOpenCart: () => void
  user: UserData | null
  onOpenLogin: () => void
  onLogout: () => void
  // --- 2. 新增主題相關 Props ---
  currentTheme: Theme
  setTheme: (theme: Theme) => void
}

const NAV_ITEMS = ['課程查詢', '預先選課', '討論紀錄']

export default function Header({ 
  activeTab, setActiveTab, cartCount, onOpenCart, 
  user, onOpenLogin, onLogout,
  currentTheme, setTheme // 解構新 Props
}: HeaderProps) {
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // 新增：主題選單開關
  const [isThemeOpen, setIsThemeOpen] = useState(false)

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

  const isAdmin = user?.role === 'admin' || user?.role === 0;

  return (
    // 🔥 Header 本身使用 CSS 變數來設定背景和邊框顏色
    <header className="sticky top-0 z-40 h-[70px] flex items-center justify-between px-6 md:px-10 transition-all backdrop-blur-md bg-[var(--header-bg)] border-b border-[var(--border-color)]">
      
      {/* Logo 區域 - 使用強調色變數 */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('課程查詢')}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-md transition-colors bg-[var(--accent-bg)] text-[var(--accent-text)]">N</div>
        <span className="text-lg font-bold tracking-tight hidden md:block transition-colors text-[var(--main-text)]">國北護課程系統</span>
      </div>

      {/* Nav Tabs - 使用強調色與文字變數 */}
      <nav className="hidden md:flex items-center gap-10 h-full">
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`relative h-full flex items-center text-sm font-bold transition-colors duration-200
              ${activeTab === item ? 'text-[var(--main-text)]' : 'text-[var(--sub-text)] hover:text-[var(--main-text)]'}`}
          >
            {item}
            {activeTab === item && (
              // Active Tab 底線使用強調色
              <span className="absolute bottom-0 left-0 w-full h-[3px] rounded-t-full bg-[var(--accent-bg)]"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        
        {/* === 3. 自定義顏色按鈕 (新增) === */}
        <div className="relative">
          <button 
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            // 使用 hover 背景變數和次要文字變數
            className="p-2.5 rounded-full transition relative hover:bg-[var(--hover-bg)] text-[var(--sub-text)]"
            title="更換主題顏色"
          >
            <Palette className="w-5 h-5" />
          </button>

          {isThemeOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsThemeOpen(false)}></div>
              
              {/* 下拉選單 - 使用卡片背景、邊框和文字變數 */}
              <div className="absolute right-0 top-12 w-48 rounded-2xl shadow-xl p-2 z-20 flex flex-col gap-1 animate-scale-up origin-top-right bg-[var(--card-bg)] border border-[var(--border-color)]">
                <p className="text-xs font-bold px-3 py-2 text-[var(--sub-text)]">選擇主題風格</p>
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme)
                      setIsThemeOpen(false)
                    }}
                    // 選單項目 Hover 和 Active 狀態
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-bold transition
                      ${currentTheme.id === theme.id ? 'bg-[var(--hover-bg)] text-[var(--main-text)]' : 'text-[var(--sub-text)] hover:bg-[var(--hover-bg)] hover:text-[var(--main-text)]'}
                    `}
                  >
                    <div 
                      className="w-5 h-5 rounded-full border shadow-sm border-[var(--border-color)]" 
                      style={{ backgroundColor: theme.colors.colorPreview }}
                    ></div>
                    <span className="flex-1 text-left">{theme.name}</span>
                    {currentTheme.id === theme.id && <Check className="w-4 h-4 text-[var(--accent-bg)]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 購物車按鈕 */}
        <button onClick={onOpenCart} className="relative p-2.5 rounded-full transition group hover:bg-[var(--hover-bg)] text-[var(--sub-text)]">
          <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[var(--card-bg)]">
              {cartCount}
            </span>
          )}
        </button>
        
        {/* User Menu / Login Button */}
        {user ? (
          <div className="relative pl-2" ref={userMenuRef}>
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition active:scale-95 border border-transparent hover:bg-[var(--hover-bg)] hover:border-[var(--border-color)]"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm bg-[var(--hover-bg)] text-[var(--main-text)] border border-[var(--border-color)]">
                {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <span className="text-sm font-bold hidden sm:block text-[var(--main-text)]">{user.name}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 text-[var(--sub-text)] ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              // User Dropdown - 使用卡片背景變數
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-xl overflow-hidden animate-scale-up z-50 origin-top-right bg-[var(--card-bg)] border border-[var(--border-color)]">
                <div className="px-6 py-4 border-b border-[var(--border-color)]">
                  <p className="text-xs font-bold mb-1 uppercase tracking-wide text-[var(--sub-text)]">
                    {isAdmin ? '管理員' : '學生'}名稱
                  </p>
                  <p className="text-lg font-bold truncate text-[var(--main-text)]">{user.name}</p>
                </div>
                <div className="py-2">
                  <div className="px-6 py-2.5 transition cursor-default hover:bg-[var(--hover-bg)]">
                    <p className="text-xs font-bold mb-0.5 text-[var(--sub-text)]">學號 / 編號</p>
                    <p className="text-sm font-bold font-mono tracking-wide text-[var(--main-text)]">
                      {user.student_id || user.id}
                    </p>
                  </div>
                  <div className="px-6 py-2.5 transition cursor-default hover:bg-[var(--hover-bg)]">
                    <p className="text-xs font-bold mb-0.5 text-[var(--sub-text)]">系所 / 單位</p>
                    <p className="text-sm font-bold text-gray-700 text-[var(--main-text)]">{user.department}</p>
                  </div>
                </div>
                <div className="p-2 border-t border-[var(--border-color)] bg-[var(--hover-bg)]/50">
                  <button 
                    onClick={() => {
                      onLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition shadow-sm hover:shadow-md border border-transparent bg-transparent text-[var(--sub-text)] hover:text-red-600 hover:bg-[var(--card-bg)] hover:border-[var(--border-color)]"
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
            // 登入按鈕使用強調色
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-lg active:scale-95 bg-[var(--accent-bg)] text-[var(--accent-text)] hover:opacity-90 shadow-[var(--border-color)]"
          >
            <LogIn className="w-4 h-4" /> 登入
          </button>
        )}
      </div>
    </header>
  )
}