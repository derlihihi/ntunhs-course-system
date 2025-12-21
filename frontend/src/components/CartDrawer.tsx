'use client'

import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cartItems: any[]
  onRemoveItem: (id: string) => void
  onCheckout: () => void
}

export default function CartDrawer({ isOpen, onClose, cartItems, onRemoveItem, onCheckout }: CartDrawerProps) {
  const totalCredits = cartItems.reduce((acc, item) => acc + item.credits, 0)

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-[var(--card-bg)] z-50 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="h-[70px] flex-shrink-0 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-bold text-[var(--main-text)] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            已選清單
          </h2>
          <button onClick={onClose} className="p-2 bg-[var(--hover-bg)] rounded-full hover:opacity-80 transition text-[var(--sub-text)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 bg-[var(--hover-bg)] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--sub-text)] space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-10" />
              <p className="text-sm font-medium">還沒選課喔</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-[var(--card-bg)] p-4 rounded-2xl shadow-sm border border-[var(--border-color)] flex justify-between items-center group hover:border-[var(--accent-color)]/50 transition">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-[var(--hover-bg)] px-1.5 rounded text-[var(--sub-text)]">{item.id}</span>
                      <h4 className="font-bold text-[var(--main-text)] text-sm">{item.name}</h4>
                    </div>
                    <p className="text-xs text-[var(--sub-text)] font-mono">{item.time} ({item.credits}學分)</p>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)} 
                    className="text-[var(--sub-text)] hover:text-red-500 p-2 transition hover:bg-red-100/50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-6 bg-[var(--card-bg)] border-t border-[var(--border-color)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-bold text-[var(--sub-text)]">總學分數</span>
            <div className="text-3xl font-bold text-[var(--main-text)] leading-none">
              {totalCredits} <span className="text-sm font-medium text-[var(--sub-text)]">學分</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              onClose()
              onCheckout()
            }}
            className="w-full bg-[var(--accent-bg)] text-white font-bold py-4 rounded-xl hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg"
          >
            前往預先選課
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}