'use client'

import { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import ConfirmModal from '../ConfirmModal' // 引入確認彈窗

interface AdminEditCourseModalProps {
  course: any
  onClose: () => void
  onSave: (updatedCourse: any) => void
}

export default function AdminEditCourseModal({ course, onClose, onSave }: AdminEditCourseModalProps) {
  // 表單資料狀態
  const [formData, setFormData] = useState<any>({
    id: '', semester: '', name: '', teacher: '', credits: 0, time: '', location: '',
    department: '', classGroup: '', grade: '', type: '', 
    currentStudents: 0, maxStudents: 0
  })

  // 控制確認彈窗顯示
  const [showConfirm, setShowConfirm] = useState(false)

  // 初始化資料 (解析 course)
  useEffect(() => {
    if (course) {
      let current = 0, max = 50;
      if (course.capacity && course.capacity.includes('/')) {
          const parts = course.capacity.split('/');
          current = parseInt(parts[0]) || 0;
          max = parseInt(parts[1]) || 50;
      }
      setFormData({
        ...course,
        currentStudents: current,
        maxStudents: max
      })
    }
  }, [course])

  // 第一步：點擊表單的儲存按鈕 -> 開啟確認彈窗
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  // 第二步：在確認彈窗點擊「確認修改」 -> 執行真正的儲存邏輯
  const executeSave = () => {
    // 組合回原本的資料結構
    const updatedCourse = {
      ...formData,
      capacity: `${formData.currentStudents}/${formData.maxStudents}`
    }
    
    // 移除暫存欄位
    delete updatedCourse.currentStudents;
    delete updatedCourse.maxStudents;

    onSave(updatedCourse) // 呼叫父層儲存
    setShowConfirm(false) // 關閉確認彈窗
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-in-up">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">修改課程資料</h3>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          
          <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="p-4 bg-yellow-50 text-yellow-700 text-sm rounded-xl flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>注意：修改課程代碼或時間可能會影響已選課學生的權益。</span>
            </div>

            {/* 第一排：基本識別 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">學期</label>
                <input required type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">課程代碼</label>
                <input required type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">班組代碼</label>
                <input required type="text" value={formData.classGroup} onChange={e => setFormData({...formData, classGroup: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            {/* 第二排：課程名稱 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">課程名稱</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
            </div>

            {/* 第三排：細節資訊 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">開課系所</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black">
                  <option>資訊管理系</option><option>護理系</option><option>通識中心</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">年級</label>
                <select value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black">
                  {[1, 2, 3, 4, 5, 6, 7].map(g => <option key={g} value={g}>{g}年級</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">必選修</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black">
                  <option>通識必修(通識)</option>
                  <option>專業必修(系所)</option>
                  <option>通識選修(通識)</option>
                  <option>專業選修(系所)</option>
                </select>
              </div>
            </div>

            {/* 第四排：教學資訊 & 人數 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">教師姓名</label>
                <input required type="text" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">學分數</label>
                <input required type="number" min="0" max="10" value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              {/* 人數管理區塊 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">人數 (已選 / 上限)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={formData.currentStudents} onChange={e => setFormData({...formData, currentStudents: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black text-center" />
                  <span className="text-gray-400">/</span>
                  <input type="number" min="0" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black text-center" />
                </div>
              </div>
            </div>

            {/* 第五排：時地 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">時間 (格式: 一 / 02,03)</label>
                <input required type="text" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">地點</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">取消</button>
              <button type="submit" className="flex-1 bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg active:scale-95 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> 儲存變更</button>
            </div>
          </form>
        </div>
      </div>

      {/* 確認儲存彈窗 (Z-Index 設為 70，確保蓋過編輯視窗) */}
      <div className="z-[70] relative">
        {showConfirm && (
          <ConfirmModal
            title="確認儲存變更"
            content="您即將修改此課程的詳細資料，這可能會影響到選課學生的權益。確定要儲存嗎？"
            confirmText="確認修改"
            isDanger={false} // 修改通常用藍色/黑色，不用紅色
            onConfirm={executeSave}
            onClose={() => setShowConfirm(false)}
          />
        )}
      </div>
    </>
  )
}