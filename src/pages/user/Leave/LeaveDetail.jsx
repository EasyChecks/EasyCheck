
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function LeaveDetail() {
    const navigate = useNavigate()
    const location = useLocation()
    
    // Get leave data from navigation state or use default
    const leaveData = location.state?.leaveData || {
        leaveType: 'ลาป่วย',
        days: '4 วัน',
        category: 'ลาป่วย',
        period: '23/09/2025 → 26/09/2025',
        reason: 'test',
        status: 'รออนุมัติ',
        statusColor: 'yellow',
        documents: []
    }

    const getStatusColor = (color) => {
        switch(color) {
            case 'yellow':
                return 'bg-yellow-100 text-yellow-600'
            case 'green':
                return 'bg-green-100 text-green-600'
            case 'red':
                return 'bg-red-100 text-red-600'
            default:
                return 'bg-gray-100 text-gray-600'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-prompt">
            {/* Header */}
            <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-blue-600 text-xl font-semibold">รายละเอียด</h1>
                    <div className="w-6"></div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
                {/* ลาป่วย + วัน */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-blue-700 font-semibold text-lg">
                            {leaveData.leaveType}
                        </h2>
                        <p className="text-blue-700 text-base mt-1">
                            {leaveData.days}
                        </p>
                    </div>
                    <span className={`${getStatusColor(leaveData.statusColor)} px-3 py-1 rounded-full text-sm font-medium`}>
                        {leaveData.status}
                    </span>
                </div>

                {/* ประเภทการลา */}
                <div>
                    <h3 className="text-blue-700 font-semibold text-base mb-2">
                        ประเภทการลา
                    </h3>
                    <p className="text-gray-500 text-base">
                        {leaveData.category}
                    </p>
                </div>

                {/* ช่วงเวลา */}
                <div>
                    <h3 className="text-blue-700 font-semibold text-base mb-2">
                        ช่วงเวลา
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {leaveData.period}
                    </p>
                </div>

                {/* เหตุผลในการลา */}
                <div>
                    <h3 className="text-blue-700 font-semibold text-base mb-2">
                        เหตุผลในการลา
                    </h3>
                    <p className="text-gray-500 text-base">
                        {leaveData.reason}
                    </p>
                </div>

                {/* เอกสารเพิ่มเติม */}
                <div>
                    <h3 className="text-blue-700 font-semibold text-base mb-2">
                        เอกสารเพิ่มเติม
                    </h3>
                    {leaveData.documents.length === 0 && (
                        <p className="text-gray-400 text-sm">ไม่มีเอกสาร</p>
                    )}
                </div>
            </div>

            {/* Bottom Button - Show only when status is "รออนุมัติ" */}
            {leaveData.status === 'รออนุมัติ' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white">
                    <button 
                        onClick={() => {
                            // Handle cancel leave logic here
                            if (window.confirm('คุณต้องการยกเลิกการลานี้หรือไม่?')) {
                                // TODO: Call API to cancel leave
                                navigate(-1)
                            }
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl shadow-lg transition-colors duration-300"
                    >
                        ยกเลิกการลา
                    </button>
                </div>
            )}
        </div>
    )
}

export default LeaveDetail;
