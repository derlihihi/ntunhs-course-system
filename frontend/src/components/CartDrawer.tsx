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
      <div className={`fixed top-0 right-0 h-full w-full md:w-[420px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="h-[70px] flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            已選清單
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 bg-[#F5F5F7] overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <ShoppingCart className="w-12 h-12 opacity-10" />
              <p className="text-sm font-medium">還沒選課喔</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-gray-300 transition">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-gray-100 px-1.5 rounded">{item.id}</span>
                      <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{item.time} ({item.credits}學分)</p>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)} 
                    className="text-gray-300 hover:text-red-500 p-2 transition hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-bold text-gray-500">總學分數</span>
            <div className="text-3xl font-bold text-gray-900 leading-none">
              {totalCredits} <span className="text-sm font-medium text-gray-400">學分</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              onClose()
              onCheckout()
            }}
            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            前往預先選課
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )
}