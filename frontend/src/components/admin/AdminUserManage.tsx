'use client'

import { useState } from 'react'
import { Search, Ban, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface AdminUserManageProps {
  users: any[]
  setUsers: (users: any[]) => void
}

export default function AdminUserManage({ users, setUsers }: AdminUserManageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null) // 控制個別按鈕的 loading

  // 🔥 關鍵修改：停權/解鎖邏輯 (打 API)
  const toggleUserBan = async (user: any) => {
    // 防止重複點擊
    if (loadingId) return;
    
    setLoadingId(user.id);
    
    // 計算新狀態
    const newStatus = user.status === 'banned' ? 'normal' : 'banned';

    try {
        const res = await fetch(`http://localhost:8000/api/users/${user.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            // 更新本地列表
            setUsers(users.map(u => 
                u.id === user.id ? { ...u, status: newStatus } : u
            ));
        } else {
            alert('更新失敗');
        }
    } catch (error) {
        console.error('Update status error:', error);
        alert('連線錯誤');
    } finally {
        setLoadingId(null);
    }
  }

  // 過濾邏輯 (支援學號、姓名、系所)
  // 注意：這裡假設後端回傳的欄位有 student_id
  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
        (u.student_id && u.student_id.toString().includes(searchLower)) || // 搜尋學號
        (u.name && u.name.toLowerCase().includes(searchLower)) ||          // 搜尋姓名
        (u.department && u.department.toLowerCase().includes(searchLower)) // 搜尋系所
    );
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      
      {/* 搜尋區塊 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 w-full">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋學號、姓名或系所..." 
              className="bg-transparent outline-none text-sm font-medium w-full placeholder:text-gray-300" 
            />
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap px-2"
            >
              清除
            </button>
          )}
      </div>

      {/* 表格區塊 */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
              <th className="p-5 pl-8">學號</th>
              <th className="p-5">姓名</th>
              <th className="p-5">系所</th>
              <th className="p-5 text-center">狀態</th>
              <th className="p-5 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition group">
                  {/* 注意：這裡顯示 student_id 而不是 database id */}
                  <td className="p-5 pl-8 font-mono text-gray-600">{u.student_id}</td>
                  <td className="p-5 font-bold text-gray-900">{u.name}</td>
                  <td className="p-5 text-gray-500">{u.department}</td>
                  <td className="p-5 text-center">
                    {u.status === 'banned' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                        <Ban className="w-3 h-3" /> 停權中
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                        <CheckCircle className="w-3 h-3" /> 正常
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => toggleUserBan(u)} 
                      disabled={loadingId === u.id}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition border shadow-sm active:scale-95 flex items-center justify-center gap-1 mx-auto min-w-[80px]
                        ${u.status === 'banned' 
                          ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' 
                          : 'bg-white border-red-200 text-red-500 hover:bg-red-50'
                        }
                        ${loadingId === u.id ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {loadingId === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                          u.status === 'banned' ? '解除封鎖' : '禁止發言'
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p>找不到符合「{searchTerm}」的使用者</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}