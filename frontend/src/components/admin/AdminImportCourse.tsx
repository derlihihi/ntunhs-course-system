'use client'

import { useState, useRef } from 'react'
import { Upload, FileJson, CheckCircle, XCircle, X, Loader2 } from 'lucide-react'

interface AdminImportCourseProps {
  currentCourses: any[]
  onImport: (updatedCourses: any[]) => void
}

export default function AdminImportCourse({ currentCourses, onImport }: AdminImportCourseProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: number; skipped: number; total: number } | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = async (event) => {
      setIsLoading(true)
      try {
        const jsonString = event.target?.result as string
        const importData = JSON.parse(jsonString)

        if (!Array.isArray(importData)) {
          alert('格式錯誤：JSON 必須是一個陣列 (Array)')
          return
        }

        // 🔥 關鍵修改：直接將整包資料 POST 給後端處理
        const res = await fetch('http://localhost:8000/api/courses/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(importData)
        });

        const data = await res.json();

        if (res.ok) {
            // 設定結果彈窗
            setResult({
                success: data.result.success,
                skipped: data.result.skipped,
                total: importData.length
            });

            // 為了保持前端資料一致，這裡建議重新 fetch 一次全部課程
            // 或是這裡簡單一點，把新資料合併進去 (如果後端有回傳新資料的話)
            // 這裡我們先用簡單的 alert 提示重新整理
            alert('匯入完成！請重新整理頁面以查看最新資料。');
            
            // 如果你的 Dashboard 有提供 refetch 的機制，這裡可以呼叫
            // onImport([]); // 這裡先傳空，因為邏輯在後端跑完了
        } else {
            alert(data.message || '匯入失敗');
        }

      } catch (error) {
        console.error(error)
        alert('匯入失敗：檔案格式不正確或連線錯誤')
      } finally {
        setIsLoading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    reader.readAsText(file)
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-10 animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center relative">
          
          {/* Loading 遮罩 */}
          {isLoading && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-3xl">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-2" />
                <p className="text-gray-500 font-bold">正在處理大量資料，請稍候...</p>
             </div>
          )}

          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500">
            <Upload className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">批次匯入課程 (JSON)</h2>
          <p className="text-gray-500 mb-8">
            請上傳標準格式的 .json 檔案。<br/>
            系統將自動比對：<span className="font-bold text-black">內容不同則更新，相同則跳過</span>。
          </p>
          
          <div className="relative group cursor-pointer">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              onChange={handleFileUpload} 
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed" 
            />
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 group-hover:border-black group-hover:bg-gray-50 transition">
              <div className="flex flex-col items-center gap-3">
                <FileJson className="w-8 h-8 text-gray-400 group-hover:text-black transition" />
                <div>
                  <p className="text-sm font-bold text-gray-900">點擊選擇 JSON 檔案 或 拖放至此</p>
                  <p className="text-xs text-gray-400 mt-1">支援格式：Array of Objects</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={() => alert('範例格式：\n[\n  {\n    "id": "0058",\n    "name": "程式設計",\n    "time": "週一 / 02,03",\n    ...\n  }\n]')}
              className="text-sm text-gray-500 underline hover:text-black transition"
            >
              查看 JSON 格式範例
            </button>
          </div>
        </div>
      </div>

      {/* 匯入結果彈窗 (保持原樣) */}
      {result && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in-up">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setResult(null)}></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">匯入完成</h3>
              <button onClick={() => setResult(null)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">成功匯入/更新</p>
                    <p className="text-xs text-green-600">資料已寫入系統</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-700">{result.success}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-full text-gray-500">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">略過不處理</p>
                    <p className="text-xs text-gray-500">內容完全重複</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-600">{result.skipped}</span>
              </div>

              <div className="pt-2 text-center text-xs text-gray-400">
                共處理 {result.total} 筆資料
              </div>

              <button 
                onClick={() => setResult(null)}
                className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition active:scale-95"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}