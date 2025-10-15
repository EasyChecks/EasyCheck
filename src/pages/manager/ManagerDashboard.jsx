import React from 'react'
import { Link } from 'react-router-dom'

function ManagerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">หัวหน้า Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ทีมงาน</h2>
            <p className="text-gray-600">จัดการทีมงานและการลา</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">อนุมัติคำขอ</h2>
            <p className="text-gray-600">อนุมัติคำขอการลาและงาน</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">รายงานทีม</h2>
            <p className="text-gray-600">ดูรายงานและสถิติของทีม</p>
          </div>
        </div>
      </div>
      <div>
              <Link to="/auth" className="bg-red-500 text-white px-4 py-2 rounded">Logout</Link>
            </div>
    </div>
  )
}

export default ManagerDashboard