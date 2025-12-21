'use client'

import { useState } from 'react'
import { Plus, Save, Loader2, BookOpen, Clock, MapPin, User, Users } from 'lucide-react'

interface AdminAddCourseProps {
  onAddCourseSuccess: (course: any) => void
  onCancel: () => void
}

// 初始值設定
const INITIAL_COURSE_DATA = { 
  id: '',           // 對應後端的 course_code
  semester: '1132', 
  name: '', 
  teacher: '', 
  credits: 3, 
  day: '週一',      // 預設值
  periods: '',      // 例如 "02,03"
  location: '', 
  department: '資訊管理系', 
  classGroup: 'A0', 
  grade: '1', 
  type: '專業必修(系所)',
  capacity: 60,     // 上限
  note: ''
}

export default function AdminAddCourse({ onAddCourseSuccess, onCancel }: AdminAddCourseProps) {
  const [newCourseData, setNewCourseData] = useState(INITIAL_COURSE_DATA)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 組合最終資料 (確保數字型別正確)
    const payload = {
      ...newCourseData,
      credits: parseInt(newCourseData.credits.toString()) || 0,
      capacity: parseInt(newCourseData.capacity.toString()) || 0,
      // day 和 periods 已經在 state 裡了，直接送出即可
    }

    try {
      const res = await fetch('http://localhost:8000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        alert('課程新增成功！')
        
        // 回傳後端建立的完整物件 (包含 DB ID) 給父層更新列表
        onAddCourseSuccess(data.course) 
        
        // 重置表單
        setNewCourseData(INITIAL_COURSE_DATA)
      } else {
        alert(data.message || '新增失敗，可能是課程代碼重複')
      }
    } catch (error) {
      console.error('API Error:', error)
      alert('連線錯誤，請確認後端伺服器')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus className="w-6 h-6" /> 新增單筆課程
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 第一排：基本識別 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">學期</label>
              <input 
                required 
                type="text" 
                value={newCourseData.semester} 
                onChange={e => setNewCourseData({...newCourseData, semester: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">課程代碼</label>
              <input 
                required 
                type="text" 
                value={newCourseData.id} 
                onChange={e => setNewCourseData({...newCourseData, id: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black font-mono" 
                placeholder="例如：0058" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">班組代碼</label>
              <input 
                type="text" 
                value={newCourseData.classGroup} 
                onChange={e => setNewCourseData({...newCourseData, classGroup: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
                placeholder="例如：A0" 
              />
            </div>
          </div>

          {/* 第二排：課程名稱 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">課程名稱</label>
            <div className="relative">
                <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                    required 
                    type="text" 
                    value={newCourseData.name} 
                    onChange={e => setNewCourseData({...newCourseData, name: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
                    placeholder="例如：系統分析與設計"
                />
            </div>
          </div>

          {/* 第三排：細節資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">開課系所</label>
              <select 
                value={newCourseData.department} 
                onChange={e => setNewCourseData({...newCourseData, department: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
              >
                <option value="資訊管理系">資訊管理系</option>
                <option value="護理系">護理系</option>
                <option value="幼保系">幼保系</option>
                <option value="通識中心">通識中心</option>
                {/* 更多系所請自行補充 */}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">年級</label>
              <select 
                value={newCourseData.grade} 
                onChange={e => setNewCourseData({...newCourseData, grade: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
              >
                {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}年級</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">必選修</label>
              <select 
                value={newCourseData.type} 
                onChange={e => setNewCourseData({...newCourseData, type: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
              >
                <option>專業必修(系所)</option>
                <option>專業選修(系所)</option>
                <option>通識必修(通識)</option>
                <option>通識選修(通識)</option>
              </select>
            </div>
          </div>

          {/* 第四排：教學資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">教師姓名</label>
              <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    required 
                    type="text" 
                    value={newCourseData.teacher} 
                    onChange={e => setNewCourseData({...newCourseData, teacher: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
                  />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">學分數</label>
              <input 
                required 
                type="number" 
                min="0" 
                max="10" 
                value={newCourseData.credits} 
                onChange={e => setNewCourseData({...newCourseData, credits: parseInt(e.target.value)})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">人數上限</label>
              <div className="relative">
                  <Users className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    value={newCourseData.capacity} 
                    onChange={e => setNewCourseData({...newCourseData, capacity: parseInt(e.target.value)})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
                  />
              </div>
            </div>
          </div>

          {/* 第五排：時地 (使用拆分欄位，確保資料格式正確) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">星期</label>
              <div className="relative">
                  <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <select 
                    value={newCourseData.day} 
                    onChange={e => setNewCourseData({...newCourseData, day: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black appearance-none"
                  >
                    {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">節次 (逗號分隔)</label>
              <input 
                required 
                type="text" 
                value={newCourseData.periods} 
                onChange={e => setNewCourseData({...newCourseData, periods: e.target.value})} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
                placeholder="例如：2,3" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">地點</label>
              <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    required 
                    type="text" 
                    value={newCourseData.location} 
                    onChange={e => setNewCourseData({...newCourseData, location: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" 
                    placeholder="例如：B210" 
                  />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-3">
            <button 
                type="button" 
                onClick={onCancel} 
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition"
            >
                取消
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
              {isLoading ? '儲存中...' : '確認新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}