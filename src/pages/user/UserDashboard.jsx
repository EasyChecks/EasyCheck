import React from 'react'

function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Dashboard</h1>
        {/* link to leavedetail */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">การลา</h2>
            <p className="text-gray-600">ส่งคำขอการลาและดูสถานะ</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">ปฏิทิน</h2>
            <p className="text-gray-600">ดูปฏิทินและงานสำคัญ</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">โปรไฟล์</h2>
            <p className="text-gray-600">จัดการข้อมูลส่วนตัว</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard