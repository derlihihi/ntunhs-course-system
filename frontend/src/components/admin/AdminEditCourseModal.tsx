'use client'

import { useState, useEffect } from 'react'
import { X, Save, AlertCircle, Loader2 } from 'lucide-react'
import ConfirmModal from '../ConfirmModal'

interface AdminEditCourseModalProps {
  course: any
  onClose: () => void
  onSave: (updatedCourse: any) => void
}

export default function AdminEditCourseModal({ course, onClose, onSave }: AdminEditCourseModalProps) {
  // 表單資料狀態
  const [formData, setFormData] = useState<any>({
    pk: '', // 資料庫主鍵 ID
    courseCode: '', // 顯示用的代碼
    semester: '', 
    name: '', 
    teacher: '', 
    credits: 0, 
    day: '週一',     // 🔥 拆分出來：星期
    periods: '',     // 🔥 拆分出來：節次
    location: '',
    department: '', 
    classGroup: '', 
    grade: '', 
    type: '', 
    currentStudents: 0, 
    maxStudents: 0
  })

  const [showConfirm, setShowConfirm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 初始化資料 (解析 course)
  useEffect(() => {
    if (course) {
      // 1. 解析人數 "15/50"
      let current = 0, max = 50;
      if (typeof course.capacity === 'string' && course.capacity.includes('/')) {
          const parts = course.capacity.split('/');
          current = parseInt(parts[0]) || 0;
          max = parseInt(parts[1]) || 50;
      } else {
          current = course.current_students || 0;
          max = course.max_students || 50;
      }

      // 2. 🔥 解析時間 "週一 / 02,03" -> 拆成 day 和 periods
      // 如果原本資料庫格式亂掉 (例如只有 "一")，這裡會自動修復
      let initDay = '週一';
      let initPeriods = '';

      if (course.time && course.time.includes('/')) {
          const parts = course.time.split('/');
          let rawDay = parts[0].trim();
          initPeriods = parts[1].trim();

          // 自動補字邏輯：如果只有 "一"、"二"，自動補上 "週"
          if (!rawDay.includes('週') && ['一','二','三','四','五','六','日'].includes(rawDay)) {
             initDay = `週${rawDay}`;
          } else {
             initDay = rawDay;
          }
      } else {
          // 如果格式完全錯誤，給個預設值
          initDay = '週一';
          initPeriods = course.time || '';
      }

      setFormData({
        pk: course.id,
        courseCode: course.code || course.id,
        semester: course.semester,
        name: course.name,
        teacher: course.teacher,
        credits: course.credits,
        day: initDay,          // 設定拆分後的星期
        periods: initPeriods,  // 設定拆分後的節次
        location: course.location,
        department: course.department,
        classGroup: course.class_group || '',
        grade: course.grade,
        type: course.type,
        currentStudents: current,
        maxStudents: max
      })
    }
  }, [course])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  // 執行儲存邏輯
  const executeSave = async () => {
    setIsSaving(true);
    setShowConfirm(false);

    try {
      // 組合 Payload
      const payload = {
          ...formData,
          // 這裡直接用 formData.day，因為它是下拉選單選出來的，絕對會有 "週"
          day: formData.day, 
          periods: formData.periods,
          credits: parseInt(formData.credits),
          currentStudents: parseInt(formData.currentStudents),
          maxStudents: parseInt(formData.maxStudents)
      };

      // 發送 PUT 請求
      const res = await fetch(`http://localhost:8000/api/courses/${formData.pk}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
          alert('修改成功！');
          
          // 更新前端畫面
          const frontendFormat = {
              ...data.course,
              id: data.course.id,
              // 組合回前端顯示格式 "週一 / 02,03"
              time: `${data.course.day_of_week} / ${data.course.period_raw}`, 
              capacity: `${data.course.current_students}/${data.course.max_students}`
          };
          onSave(frontendFormat); 
          onClose();
      } else {
          alert(data.message || '修改失敗');
      }

    } catch (error) {
        console.error('Update error:', error);
        alert('連線錯誤');
    } finally {
        setIsSaving(false);
    }
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

            {/* 第一排 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">學期</label>
                <input required type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">課程代碼</label>
                <input required type="text" value={formData.courseCode} onChange={e => setFormData({...formData, courseCode: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">班組代碼</label>
                <input type="text" value={formData.classGroup} onChange={e => setFormData({...formData, classGroup: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            {/* 第二排 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">課程名稱</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
            </div>

            {/* 第三排 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">開課系所</label>
                <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black">
                    <option value="">請選擇系所...</option> 
                    <option value="護理系">護理系</option>
                    <option value="高齡健康照護系">高齡健康照護系</option>
                    <option value="健康事業管理系">健康事業管理系</option>
                    <option value="資訊管理系">資訊管理系</option>
                    <option value="休閒產業與健康促進系">休閒產業與健康促進系</option>
                    <option value="語言治療與聽力學系">語言治療與聽力學系</option>
                    <option value="嬰幼兒保育系">嬰幼兒保育系</option>
                    <option value="運動保健系">運動保健系</option>
                    <option value="生死與健康心理諮商系">生死與健康心理諮商系</option>
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

            {/* 第四排 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">教師姓名</label>
                <input required type="text" value={formData.teacher} onChange={e => setFormData({...formData, teacher: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">學分數</label>
                <input required type="number" min="0" max="10" value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">人數 (已選 / 上限)</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" value={formData.currentStudents} onChange={e => setFormData({...formData, currentStudents: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black text-center" />
                  <span className="text-gray-400">/</span>
                  <input type="number" min="0" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black text-center" />
                </div>
              </div>
            </div>

            {/* 🔥 第五排：拆分成星期和節次 🔥 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">星期 (強制格式)</label>
                <select 
                  value={formData.day} 
                  onChange={e => setFormData({...formData, day: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black"
                >
                  {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">節次 (逗號分隔)</label>
                <input required type="text" value={formData.periods} onChange={e => setFormData({...formData, periods: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" placeholder="例如：02,03" />
              </div>
            </div>
            
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">地點</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">取消</button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                儲存變更
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 確認儲存彈窗 */}
      <div className="z-[70] relative">
        {showConfirm && (
          <ConfirmModal
            title="確認儲存變更"
            content="您即將修改此課程的詳細資料。系統會自動將「星期」欄位格式化為「週X」以符合搜尋規則。確定要儲存嗎？"
            confirmText="確認修改"
            isDanger={false} 
            onConfirm={executeSave}
            onClose={() => setShowConfirm(false)}
          />
        )}
      </div>
    </>
  )
}