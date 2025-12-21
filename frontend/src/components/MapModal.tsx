'use client'

import { X, MapPin } from 'lucide-react'
import Image from 'next/image'

interface MapModalProps {
  location: string
  onClose: () => void
}

export default function MapModal({ location, onClose }: MapModalProps) {
  // 1. 擷取大樓代碼 (取第一個字，轉大寫)
  const buildingCode = location.charAt(0).toUpperCase()
  
  // 2. 定義大樓名稱對照表 (可選)
  const buildingNames: { [key: string]: string } = {
    'F': 'F 棟大樓',
    'G': 'G 棟大樓',
    'B': 'B 棟大樓',
    'S': 'S 棟大樓'
  }

  const buildingName = buildingNames[buildingCode] || `${buildingCode} 棟`

  // 3. 判斷是否為有效的大樓代碼
  const isValidBuilding = ['F', 'G', 'B', 'S'].includes(buildingCode)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in-up">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* 彈窗本體 */}
      <div className="relative bg-[var(--card-bg)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] bg-[var(--hover-bg)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100/30 text-blue-600 rounded-full">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--main-text)] text-lg">教室位置導覽</h3>
              <p className="text-sm text-[var(--sub-text)]">
                教室：<span className="font-mono font-bold text-[var(--main-text)]">{location}</span> 
                {isValidBuilding && <span className="ml-2">({buildingName})</span>}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[var(--hover-bg)]/80 rounded-full transition text-[var(--sub-text)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 圖片區域 */}
        <div className="p-6 flex flex-col items-center justify-center bg-[var(--card-bg)] min-h-[300px]">
          {isValidBuilding ? (
            <div className="relative w-full aspect-square bg-[var(--hover-bg)] rounded-2xl overflow-hidden border border-[var(--border-color)]">
              {/* 這裡使用 next/image，請確保 public/maps/ 資料夾下有對應圖片 */}
              <div className="absolute inset-0 flex items-center justify-center text-[var(--sub-text)] font-bold text-2xl">
                 <div className="text-center">
                    <p className="text-6xl mb-4 font-black text-[var(--sub-text)]/30">{buildingCode}</p>
                    <p>圖片路徑: /maps/{buildingCode}.png</p>
                 </div>
                 
                 {/* 真實圖片寫法範例 (請解開註解並準備圖片): */}
                 {/* <Image 
                   src={`/maps/${buildingCode}.png`} 
                   alt={`${buildingName}位置圖`}
                   fill
                   className="object-contain p-4"
                 /> 
                 */}
              </div>
            </div>
          ) : (
            <div className="text-center text-[var(--sub-text)] py-10">
              <div className="w-16 h-16 bg-[var(--hover-bg)] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[var(--sub-text)]" />
              </div>
              <p>找不到「{buildingCode}」大樓的相關地圖資訊</p>
              <p className="text-xs mt-2">目前僅支援 F, G, B, S 棟</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--hover-bg)] flex justify-center">
          <button 
            onClick={onClose}
            className="w-full bg-[var(--accent-bg)] text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-lg active:scale-95"
          >
            關閉地圖
          </button>
        </div>
      </div>
    </div>
  )
}