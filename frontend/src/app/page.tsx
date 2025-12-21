'use client'

import { useState, useEffect } from 'react'
import { Map as MapIcon, X } from 'lucide-react'

// 引入拆分後的元件，注意這裡引入了新定義的 THEMES 和 Theme 型別
import Header, { THEMES, Theme } from '../components/Header'
import CourseSearch from '../components/CourseSearch'
import CartDrawer from '../components/CartDrawer'
import PreSelection from '../components/PreSelection'
import DiscussionHistory from '../components/DiscussionHistory'
import DiscussionModal from '../components/DiscussionModal'
import AuthModal from '../components/AuthModal'
import ConfirmModal from '../components/ConfirmModal'

// 引入管理者介面
import AdminDashboard from '../components/admin/AdminDashboard'
import MapModal from '../components/MapModal'

const API_BASE = 'http://localhost:8000/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('課程查詢') 
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [mapLocation, setMapLocation] = useState<string | null>(null)
  const [selectedDiscussionCourse, setSelectedDiscussionCourse] = useState<any>(null)
  const [user, setUser] = useState<any>(null) 
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // 🔥 新增：主題顏色狀態 (預設第一個)
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0])

  // ============================================
  // 🔥 API 串接邏輯區
  // ============================================

  const fetchCart = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/cart?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('無法取得購物車:', error);
    }
  };

  useEffect(() => {
    if (user?.id && user.role !== 'admin') { 
      fetchCart(user.id);
    } else {
      setCartItems([]);
    }
  }, [user]);

  const toggleCartItem = async (course: any) => {
    if (!user) {
      alert('請先登入才能進行選課！');
      setIsAuthOpen(true);
      return;
    }

    const isExist = cartItems.find(item => item.id == course.id); 

    try {
      if (isExist) {
        const res = await fetch(`${API_BASE}/cart/${course.id}?userId=${user.id}`, { method: 'DELETE' });
        if (res.ok) fetchCart(user.id);
      } else {
        const res = await fetch(`${API_BASE}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, courseId: course.id })
        });
        if (res.ok) fetchCart(user.id);
        else alert('加入失敗，可能重複加入或系統錯誤');
      }
    } catch (error) {
      console.error('操作失敗:', error);
      alert('連線錯誤，請檢查後端 Server');
    }
  }

  const removeFromCart = async (courseId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/cart/${courseId}?userId=${user.id}`, { method: 'DELETE' });
      if (res.ok) fetchCart(user.id); 
    } catch (error) {
      console.error('移除失敗:', error);
    }
  }

  const handleLogoutConfirm = () => {
    setUser(null) 
    setIsLogoutModalOpen(false) 
    setActiveTab('課程查詢') 
    localStorage.removeItem('user');
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('User parse error', e);
      }
    }
  }, []);

  // 路由判斷：如果是管理員，直接渲染 AdminDashboard
  if (user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogoutConfirm} />
  }

  // --- 學生/訪客視圖 ---
  return (
    // 🔥 關鍵修改：將主題色定義為 CSS 變數，注入到最外層 div
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-500 bg-[var(--app-bg)] text-[var(--main-text)] selection:bg-[var(--accent-bg)] selection:text-[var(--accent-text)]"
      style={{
        // @ts-ignore - 忽略 TypeScript 對自定義 CSS 屬性的檢查
        '--app-bg': currentTheme.colors.appBg,
        '--header-bg': currentTheme.colors.headerBg,
        '--card-bg': currentTheme.colors.cardBg,
        '--main-text': currentTheme.colors.mainText,
        '--sub-text': currentTheme.colors.subText,
        '--border-color': currentTheme.colors.border,
        '--accent-bg': currentTheme.colors.accentBg,
        '--accent-text': currentTheme.colors.accentText,
        '--hover-bg': currentTheme.colors.hoverBg,
      } as React.CSSProperties}
    >
      
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenLogin={() => setIsAuthOpen(true)}
        onLogout={() => setIsLogoutModalOpen(true)}
        // 傳遞主題狀態給 Header
        currentTheme={currentTheme}
        setTheme={setCurrentTheme}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full pt-8 px-4 md:px-8 pb-20 animate-fade-in-up">
        
        {/* 注意：為了讓 CourseSearch 裡面的白色區塊也變色，你需要修改 CourseSearch.tsx */}
        {activeTab === '課程查詢' && (
          <CourseSearch 
            cartItems={cartItems}
            onToggleCartItem={toggleCartItem}
            onLocationClick={setMapLocation}
            onDiscussionClick={setSelectedDiscussionCourse}
          />
        )}

        {activeTab === '預先選課' && (
           <PreSelection 
             initialCourses={cartItems} 
             onRemoveFromGlobalCart={removeFromCart} 
             user={user} 
             onOpenLogin={() => setIsAuthOpen(true)} 
             onAddCourse={toggleCartItem} 
           />
        )}
        
        {activeTab === '討論紀錄' && (
           <DiscussionHistory 
             user={user} 
             onOpenDiscussion={setSelectedDiscussionCourse} 
             onOpenLogin={() => setIsAuthOpen(true)}
           />
        )}

      </main>

      {/* 右側購物車 (這裡也需要修改內部樣式才能完全適配主題) */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={() => setActiveTab('預先選課')}
      />
      
      {/* 地圖彈窗 */}
      {mapLocation && (
        <MapModal 
          location={mapLocation} 
          onClose={() => setMapLocation(null)} 
        />
      )}

      {selectedDiscussionCourse && (
        <DiscussionModal 
           course={selectedDiscussionCourse} 
           user={user} 
           onClose={() => setSelectedDiscussionCourse(null)} 
        />
      )}

      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />
      )}

      {/* 登出確認彈窗 */}
      {isLogoutModalOpen && (
        <ConfirmModal 
          title="確認登出"
          content="登出後，您的暫存狀態將會被清除，但已加入清單的課程會保留在資料庫中。"
          confirmText="登出"
          isDanger={true}
          onConfirm={handleLogoutConfirm}
          onClose={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  )
}