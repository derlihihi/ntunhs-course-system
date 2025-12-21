'use client'

import { useState } from 'react'
import { Plus, Save } from 'lucide-react'

interface AdminAddCourseProps {
  onAddCourse: (course: any) => void
  onCancel: () => void
}

// 初始值設定
const INITIAL_COURSE_DATA = { 
  id: '', 
  semester: '1132', 
  name: '', 
  teacher: '', 
  credits: 3, 
  time: '', 
  location: '', 
  department: '資訊管理系', 
  classGroup: 'A0', 
  grade: '1', 
  type: '必修',
  capacity: '0/50' // 格式: 已選/上限
}

export default function AdminAddCourse({ onAddCourse, onCancel }: AdminAddCourseProps) {
  // 拆分已選人數和上限，方便表單處理
  const [newCourseData, setNewCourseData] = useState(INITIAL_COURSE_DATA)
  const [currentStudents, setCurrentStudents] = useState(15) // 預設已選 15 人
  const MAX_STUDENTS = 50 // 固定上限

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 組合最終資料
    const finalData = {
      ...newCourseData,
      capacity: `${currentStudents}/${MAX_STUDENTS}`
    }

    onAddCourse(finalData)
    
    // 重置表單
    setNewCourseData(INITIAL_COURSE_DATA)
    setCurrentStudents(15)
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
              <input required type="text" value={newCourseData.semester} onChange={e => setNewCourseData({...newCourseData, semester: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">課程代碼</label>
              <input required type="text" value={newCourseData.id} onChange={e => setNewCourseData({...newCourseData, id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" placeholder="例如：0058" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">班組代碼</label>
              <input required type="text" value={newCourseData.classGroup} onChange={e => setNewCourseData({...newCourseData, classGroup: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" placeholder="例如：A0" />
            </div>
          </div>

          {/* 第二排：課程名稱 */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">課程名稱</label>
            <input required type="text" value={newCourseData.name} onChange={e => setNewCourseData({...newCourseData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
          </div>

          {/* 第三排：細節資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">開課系所</label>
              <select value={newCourseData.department} onChange={e => setNewCourseData({...newCourseData, department: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black">
                <option>請選擇系所...</option>
                <option>護理系</option>
                <option>高齡健康照護系</option>
                <option>護理助產及婦女健康系</option>
                <option>醫護教育暨數位學習系</option>
                <option>中西醫結合護理研究所</option>
                <option>健康科技學院(不分系)</option>
                <option>健康事業管理系</option>
                <option>資訊管理系</option>
                <option>休閒產業與健康促進系</option>
                <option>長期照護系</option>
                <option>語言治療與聽力學系</option>
                <option>國際健康科技碩士學位學程</option>
                <option>人類發展與健康學院(不分系)</option>
                <option>嬰幼兒保育系</option>
                <option>運動保健系</option>
                <option>生死與健康心理諮商系</option>
                {/* 這裡可以補上所有系所 */}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">年級</label>
              <select value={newCourseData.grade} onChange={e => setNewCourseData({...newCourseData, grade: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black">
                {[1, 2, 3, 4].map(g => <option key={g} value={g}>{g}年級</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">必選修</label>
              <select value={newCourseData.type} onChange={e => setNewCourseData({...newCourseData, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black">
                <option>通識必修(通識)</option>
                <option>專業必修(系所)</option>
                <option>通識選修(通識)</option>
                <option>專業選修(系所)</option>
              </select>
            </div>
          </div>

          {/* 第四排：教學資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">教師姓名</label>
              <input required type="text" value={newCourseData.teacher} onChange={e => setNewCourseData({...newCourseData, teacher: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">學分數</label>
              <input required type="number" min="0" max="10" value={newCourseData.credits} onChange={e => setNewCourseData({...newCourseData, credits: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">已選人數 (上限 {MAX_STUDENTS})</label>
              <input required type="number" min="0" max={MAX_STUDENTS} value={currentStudents} onChange={e => setCurrentStudents(parseInt(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>

          {/* 第五排：時地 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">時間 (格式: 一 / 02,03)</label>
              <input required type="text" value={newCourseData.time} onChange={e => setNewCourseData({...newCourseData, time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" placeholder="例如：三 / 05,06,07" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">地點</label>
              <input required type="text" value={newCourseData.location} onChange={e => setNewCourseData({...newCourseData, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" placeholder="例如：B210" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">取消</button>
            <button type="submit" className="flex-1 bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg active:scale-95 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> 確認新增</button>
          </div>
        </form>
      </div>
    </div>
  )
}