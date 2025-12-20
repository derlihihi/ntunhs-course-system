'use client'

import { useState } from 'react'
import { Map as MapIcon, X } from 'lucide-react'
import Cookies from 'js-cookie' // 引入 Cookie

// 引入拆分後的元件
import Header from '../components/Header'
import CourseSearch from '../components/CourseSearch'
import CartDrawer from '../components/CartDrawer'
import PreSelection from '../components/PreSelection'
import DiscussionHistory from '../components/DiscussionHistory'
import DiscussionModal from '../components/DiscussionModal'
import AuthModal from '../components/AuthModal'
import ConfirmModal from '../components/ConfirmModal'

export default function Home() {
  const [activeTab, setActiveTab] = useState('課程查詢') 
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [mapLocation, setMapLocation] = useState<string | null>(null)
  
  const [selectedDiscussionCourse, setSelectedDiscussionCourse] = useState<any>(null)
  const [user, setUser] = useState<any>(null) 
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  // 購物車邏輯
  const toggleCartItem = (course: any) => {
    const isExist = cartItems.find(item => item.id === course.id)
    if (isExist) {
      setCartItems(cartItems.filter(item => item.id !== course.id))
    } else {
      setCartItems([...cartItems, course])
    }
  }

  const removeFromCart = (courseId: string) => {
    setCartItems(cartItems.filter(item => item.id !== courseId))
  }

  const handleLogoutConfirm = () => {
    setUser(null) // 登出
    setCartItems([]) // 清空購物車 (模擬帳號綁定)
    setIsLogoutModalOpen(false) // 關閉彈窗
    setActiveTab('課程查詢') // 回到首頁
  }

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
             user={user} // 傳入 user
             onOpenLogin={() => setIsAuthOpen(true)} // 傳入開啟登入函數
             onAddCourse={toggleCartItem} // 傳入加課函數給推薦列表用
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
                <p className="text-gray-400 font-bold">Google Maps 整合位置</p>
             </div>
          </div>
        </div>
      )}

      {selectedDiscussionCourse && (
        <DiscussionModal course={selectedDiscussionCourse} onClose={() => setSelectedDiscussionCourse(null)} />
      )}

      {isAuthOpen && (
        <AuthModal onClose={() => setIsAuthOpen(false)} onLoginSuccess={setUser} />
      )}

      {/* 登出確認彈窗 (新增) */}
      {isLogoutModalOpen && (
        <ConfirmModal 
          title="確認登出"
          content="登出後，您的預選課程清單將會被清空 (模擬)。確定要登出嗎？"
          confirmText="登出"
          isDanger={true}
          onConfirm={handleLogoutConfirm}
          onClose={() => setIsLogoutModalOpen(false)}
        />
      )}
    </div>
  )
}