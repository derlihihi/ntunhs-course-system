'use client'

import { useState, useEffect } from 'react'
import { Map as MapIcon, X } from 'lucide-react'
// import Cookies from 'js-cookie' // 如果你還沒用到 Cookie 可以先註解

// 引入拆分後的元件
import Header from '../components/Header'
import CourseSearch from '../components/CourseSearch'
import CartDrawer from '../components/CartDrawer'
import PreSelection from '../components/PreSelection'
import DiscussionHistory from '../components/DiscussionHistory'
import DiscussionModal from '../components/DiscussionModal'
import AuthModal from '../components/AuthModal'
import ConfirmModal from '../components/ConfirmModal'

// 定義後端 API 基礎路徑
const API_BASE = 'http://localhost:8000/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState('課程查詢') 
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // 這裡的 cartItems 現在會跟資料庫同步
  const [cartItems, setCartItems] = useState<any[]>([])
  
  const [mapLocation, setMapLocation] = useState<string | null>(null)
  const [selectedDiscussionCourse, setSelectedDiscussionCourse] = useState<any>(null)
  
  // user 狀態包含 id (後端資料庫的 PK)
  const [user, setUser] = useState<any>(null) 
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // ============================================
  // 🔥 API 串接邏輯區
  // ============================================

  // 1. 讀取購物車 (Fetch Cart)
  const fetchCart = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE}/cart?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data); // 更新前端狀態
      }
    } catch (error) {
      console.error('無法取得購物車:', error);
    }
  };

  // 2. 當 User 登入狀態改變時，自動抓取購物車
  useEffect(() => {
    if (user?.id) {
      // 如果有登入，去後端抓資料
      fetchCart(user.id);
    } else {
      // 沒登入或登出，清空前端清單
      setCartItems([]);
    }
  }, [user]);


  // 3. 加入/移除購物車邏輯 (Toggle)
  const toggleCartItem = async (course: any) => {
    // 檢查是否登入
    if (!user) {
      alert('請先登入才能進行選課！');
      setIsAuthOpen(true);
      return;
    }

    const isExist = cartItems.find(item => item.id == course.id); // 注意: 寬鬆比對 == 避免 string/number 問題

    try {
      if (isExist) {
        // --- 移除 (DELETE) ---
        const res = await fetch(`${API_BASE}/cart/${course.id}?userId=${user.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          // 重新抓取最新清單 (確保跟後端一致)
          fetchCart(user.id);
        }
      } else {
        // --- 加入 (POST) ---
        const res = await fetch(`${API_BASE}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, courseId: course.id })
        });
        
        if (res.ok) {
          fetchCart(user.id);
        } else {
          alert('加入失敗，可能重複加入或系統錯誤');
        }
      }
    } catch (error) {
      console.error('操作失敗:', error);
      alert('連線錯誤，請檢查後端 Server');
    }
  }

  // 4. 單純移除 (Remove) - 給 CartDrawer 和 PreSelection 用
  const removeFromCart = async (courseId: string) => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE}/cart/${courseId}?userId=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchCart(user.id); // 更新畫面
      }
    } catch (error) {
      console.error('移除失敗:', error);
    }
  }

  // ============================================

  const handleLogoutConfirm = () => {
    setUser(null) // 清除 User 狀態，useEffect 會自動把 cartItems 清空
    setIsLogoutModalOpen(false) 
    setActiveTab('課程查詢') 
    // 這裡也可以順便清除 localStorage
    localStorage.removeItem('user');
  }

  // 嘗試從 localStorage 恢復登入狀態 (選擇性功能)
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-gray-900 font-sans selection:bg-black selection:text-white">
      
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenLogin={() => setIsAuthOpen(true)}
        onLogout={() => setIsLogoutModalOpen(true)}        
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full pt-8 px-4 md:px-8 pb-20 animate-fade-in-up">
        
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

      {/* 右側購物車 */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onCheckout={() => setActiveTab('預先選課')}
      />
      
      {/* 彈窗區域 */}
      {mapLocation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setMapLocation(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up p-0">
             <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2"><div className="p-2 bg-blue-50 rounded-full text-blue-500"><MapIcon className="w-5 h-5" /></div><div><h3 className="font-bold text-gray-900">教室位置</h3><p className="text-xs text-gray-500">{mapLocation}</p></div></div>
                <button onClick={() => setMapLocation(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
             </div>
             <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center relative">
                {/* 這裡之後可以串接 Google Maps API 或顯示靜態圖片 */}
                <p className="text-gray-400 font-bold">Google Maps 整合位置 ({mapLocation})</p>
             </div>
          </div>
        </div>
      )}

      {selectedDiscussionCourse && (
        <DiscussionModal 
           course={selectedDiscussionCourse} 
           user={user} // 🔥 加上這行！把登入的使用者資訊傳進去
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