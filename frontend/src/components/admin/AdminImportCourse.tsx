'use client'

import { useState, useRef } from 'react'
import { Upload, FileJson, CheckCircle, XCircle, X } from 'lucide-react'

interface AdminImportCourseProps {
  currentCourses: any[]
  onImport: (updatedCourses: any[]) => void
}

export default function AdminImportCourse({ currentCourses, onImport }: AdminImportCourseProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 結果彈窗的狀態
  const [result, setResult] = useState<{ success: number; skipped: number; total: number } | null>(null)

  // 比較兩個課程物件是否「內容完全一樣」
  const isContentIdentical = (courseA: any, courseB: any) => {
    // 這裡列出你想要比對的欄位，如果全部欄位都要比，可以直接用 JSON.stringify
    // 為了精準，我們比對關鍵欄位即可
    return (
      courseA.name === courseB.name &&
      courseA.teacher === courseB.teacher &&
      courseA.credits === courseB.credits &&
      courseA.time === courseB.time &&
      courseA.location === courseB.location &&
      courseA.department === courseB.department &&
      courseA.type === courseB.type
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string
        const importData = JSON.parse(jsonString)

        if (!Array.isArray(importData)) {
          alert('格式錯誤：JSON 必須是一個陣列 (Array)')
          return
        }

        let successCount = 0
        let skippedCount = 0
        
        // 複製一份目前的課程，用來進行修改
        let nextCourses = [...currentCourses]

        importData.forEach((newCourse: any) => {
          // 1. 檢查必填欄位 (簡單防呆)
          if (!newCourse.id || !newCourse.name) {
            skippedCount++
            return
          }

          // 2. 尋找是否已存在相同 ID 的課程
          const existingIndex = nextCourses.findIndex(c => c.id === newCourse.id)

          if (existingIndex === -1) {
            // A. 不存在 -> 直接新增
            nextCourses.push(newCourse)
            successCount++
          } else {
            // B. 已存在 -> 比對內容
            const existingCourse = nextCourses[existingIndex]
            
            if (isContentIdentical(existingCourse, newCourse)) {
              // 內容完全一樣 -> 跳過
              skippedCount++
            } else {
              // 內容不一樣 -> 更新 (覆蓋)
              nextCourses[existingIndex] = newCourse
              successCount++
            }
          }
        })

        // 更新父層資料
        onImport(nextCourses)
        
        // 設定彈窗結果
        setResult({
          success: successCount,
          skipped: skippedCount,
          total: importData.length
        })

      } catch (error) {
        console.error(error)
        alert('匯入失敗：檔案格式不正確或損毀')
      } finally {
        // 清空 input，這樣下次選同一個檔案才會觸發 onChange
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
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
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
              accept=".json" // 改成 json
              onChange={handleFileUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
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
              onClick={() => alert('範例格式：\n[\n  {\n    "id": "001",\n    "name": "程式設計",\n    "teacher": "王大明",\n    ...\n  }\n]')}
              className="text-sm text-gray-500 underline hover:text-black transition"
            >
              查看 JSON 格式範例
            </button>
          </div>
        </div>
      </div>

      {/* 匯入結果彈窗 */}
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