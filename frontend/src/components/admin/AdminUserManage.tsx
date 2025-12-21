'use client'

import { useState } from 'react'
import { Search, Ban, CheckCircle, AlertCircle } from 'lucide-react'

interface AdminUserManageProps {
  users: any[]
  setUsers: (users: any[]) => void
}

export default function AdminUserManage({ users, setUsers }: AdminUserManageProps) {
  // 1. 搜尋關鍵字狀態
  const [searchTerm, setSearchTerm] = useState('')

  // 2. 停權/解鎖邏輯
  const toggleUserBan = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'normal' ? 'banned' : 'normal' } : u))
  }

  // 3. 過濾邏輯 (支援學號、姓名、系所)
  const filteredUsers = users.filter(u => 
    u.id.includes(searchTerm) || 
    u.name.includes(searchTerm) || 
    u.department.includes(searchTerm)
  )

  return (
    // 修改：限制最大寬度為 4xl (約 896px)，並置中
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
                  <td className="p-5 pl-8 font-mono text-gray-600">{u.id}</td>
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
                      onClick={() => toggleUserBan(u.id)} 
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition border shadow-sm active:scale-95
                        ${u.status === 'banned' 
                          ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' 
                          : 'bg-white border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                    >
                      {u.status === 'banned' ? '解除封鎖' : '禁止發言'}
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