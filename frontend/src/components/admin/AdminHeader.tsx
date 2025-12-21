'use client'

import { LogOut, ShieldCheck } from 'lucide-react'

interface AdminHeaderProps {
  user: any
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
}

const TABS = ['課程管理', '匯入課程', '新增課程', '使用者管理', '討論區管理']

export default function AdminHeader({ user, activeTab, setActiveTab, onLogout }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 h-[70px] flex items-center justify-between px-6 md:px-10 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">N</div>
        <span className="text-lg font-bold text-gray-900 tracking-tight hidden md:block">後台管理系統</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 h-full">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative h-full flex items-center text-sm font-bold transition-colors duration-200
              ${activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-600">{user.name}</span>
        </div>
        <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}