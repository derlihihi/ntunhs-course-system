'use client'

import { useState, useRef } from 'react'
import { Upload, FileJson, FileSpreadsheet, CheckCircle, XCircle, X, Loader2, AlertTriangle } from 'lucide-react'

interface AdminImportCourseProps {
  currentCourses: any[]
  onImport: (updatedCourses: any[]) => void
}

export default function AdminImportCourse({ currentCourses, onImport }: AdminImportCourseProps) {
  // 建立兩個 Ref 分別控制不同的 input
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ 
    success: number; 
    skipped: number; 
    total: number;
    message?: string 
  } | null>(null)

  // ==========================================
  // 1. JSON 匯入邏輯 (系統備份檔)
  // ==========================================
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = async (event) => {
      setIsLoading(true)
      try {
        const jsonString = event.target?.result as string
        let importData
        
        try {
            importData = JSON.parse(jsonString)
        } catch (err) {
            alert('JSON 格式錯誤，請確認檔案內容')
            setIsLoading(false)
            return
        }

        if (!Array.isArray(importData)) {
          alert('格式錯誤：JSON 必須是一個陣列 (Array)')
          setIsLoading(false)
          return
        }

        // 發送 POST 請求
        const res = await fetch('http://localhost:8000/api/courses/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(importData)
        });

        const data = await res.json();

        if (res.ok) {
            setResult({
                success: data.result.success,
                skipped: data.result.skipped,
                total: importData.length,
                message: 'JSON 資料匯入完成'
            });
            // 這裡可以呼叫 onImport 重新整理父層列表
            // onImport([]) 
        } else {
            alert(data.message || '匯入失敗');
        }

      } catch (error) {
        console.error(error)
        alert('匯入失敗：檔案格式不正確或連線錯誤')
      } finally {
        setIsLoading(false)
        if (jsonInputRef.current) jsonInputRef.current.value = ''
      }
    }

    reader.readAsText(file)
  }

  // ==========================================
  // 2. CSV 匯入邏輯 (學校課表)
  // ==========================================
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file) // 這裡的 key 'file' 要跟後端 multer 設定的一樣

    try {
        const res = await fetch('http://localhost:8000/api/quick-import', {
            method: 'POST',
            body: formData, // 直接傳送 FormData，瀏覽器會自動設定 Content-Type
        })
        
        const data = await res.json()

        if (res.ok) {
            setResult({
                success: data.processed,
                skipped: data.total - data.processed,
                total: data.total,
                message: 'CSV 課表匯入完成'
            })
        } else {
            alert(data.message || '匯入失敗')
        }

    } catch (error) {
        console.error(error)
        alert('上傳失敗，請檢查後端連線 (Port 8000)')
    } finally {
        setIsLoading(false)
        if (csvInputRef.current) csvInputRef.current.value = ''
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-10 animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center relative overflow-hidden">
          
          {/* Loading 遮罩 */}
          {isLoading && (
             <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <div className="bg-blue-50 p-4 rounded-full mb-4 animate-pulse">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">正在處理大量資料...</h3>
                <p className="text-gray-500 mt-2">請勿關閉視窗，這可能需要幾秒鐘</p>
             </div>
          )}

          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
            <Upload className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">批次匯入課程</h2>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">
            系統支援兩種匯入方式。請選擇對應的檔案格式，系統將自動比對資料庫內容：<span className="font-bold text-gray-700">內容不同則更新，相同則跳過</span>。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 左邊：JSON 上傳區塊 */}
            <div className="relative group cursor-pointer">
                <input 
                  ref={jsonInputRef}
                  type="file" 
                  accept=".json" 
                  onChange={handleJsonUpload} 
                  disabled={isLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                />
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 group-hover:border-blue-500 group-hover:bg-blue-50/50 transition h-full flex flex-col items-center justify-center gap-4 bg-gray-50/30">
                  <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition duration-300">
                    <FileJson className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 mb-1">匯入 JSON 檔案</p>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">系統備份格式</span>
                    <p className="text-xs text-gray-400 mt-3">適用於系統資料轉移或還原</p>
                  </div>
                </div>
            </div>

            {/* 右邊：CSV 上傳區塊 */}
            <div className="relative group cursor-pointer">
                <input 
                  ref={csvInputRef}
                  type="file" 
                  accept=".csv" 
                  onChange={handleCsvUpload} 
                  disabled={isLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
                />
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 group-hover:border-green-500 group-hover:bg-green-50/50 transition h-full flex flex-col items-center justify-center gap-4 bg-gray-50/30">
                  <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition duration-300">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 mb-1">匯入 CSV 檔案</p>
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">學校 Excel 轉檔</span>
                    <p className="text-xs text-gray-400 mt-3">適用於新學期課表批次建立</p>
                  </div>
                </div>
            </div>

          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center gap-6 text-sm text-gray-400">
             <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>請確保檔案編碼為 UTF-8</span>
             </div>
             <button 
                onClick={() => alert('JSON 範例：\n[{"id":"001", "name":"課程A"...}]\n\nCSV 範例：\n學期,科目代碼,科目名稱...')}
                className="text-gray-500 underline hover:text-black transition"
             >
               查看欄位說明
             </button>
          </div>
        </div>
      </div>

      {/* 匯入結果彈窗 */}
      {result && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in-up">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setResult(null)}></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{result.message || '匯入完成'}</h3>
              <button onClick={() => setResult(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 成功區塊 */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600 shadow-sm">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">成功寫入</p>
                    <p className="text-xs text-green-600">新增或更新</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-green-700">{result.success}</span>
              </div>

              {/* 跳過區塊 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-full text-gray-500 shadow-sm">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">略過不處理</p>
                    <p className="text-xs text-gray-500">資料完全重複</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-gray-600">{result.skipped}</span>
              </div>

              <div className="pt-4 text-center text-xs text-gray-400 font-mono border-t border-gray-50 mt-4">
                TOTAL PROCESSED: {result.total}
              </div>

              <button 
                onClick={() => setResult(null)}
                className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-lg"
              >
                關閉視窗
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}