
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLeave } from '../../../contexts/LeaveContext'

function LeaveDetail() {
    const navigate = useNavigate()
    const location = useLocation()
    const { cancelLeave } = useLeave()
    
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
    
    const handleCancelLeave = () => {
        if (window.confirm('คุณต้องการยกเลิกการลานี้หรือไม่?')) {
            const success = cancelLeave(leaveData.id)
            if (success) {
                alert('ยกเลิกการลาเรียบร้อยแล้ว')
                navigate(-1)
            } else {
                alert('ไม่สามารถยกเลิกการลานี้ได้')
            }
        }
    }

    const getStatusColor = (color) => {
        switch(color) {
            case 'yellow':
                return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200'
            case 'green':
                return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
            case 'red':
                return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
            default:
                return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 font-prompt">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] px-4 sm:px-5 lg:px-6 py-4 sm:py-5 shadow-lg sticky top-0 z-10">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition-all duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-white text-base sm:text-lg lg:text-xl font-bold drop-shadow-md">รายละเอียด</h1>
                    <div className="w-5 sm:w-6"></div>
                </div>
            </div>

            {/* Content */}
            <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 pb-28 sm:pb-32 max-w-4xl mx-auto">
                {/* Main Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/50">
                    {/* Header Section with gradient */}
                    <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-4 sm:p-5 lg:p-6">
                        <div className="flex justify-between items-start gap-2 sm:gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                    <div className="w-1.5 sm:w-2 h-8 sm:h-10 lg:h-12 bg-white rounded-full flex-shrink-0"></div>
                                    <h2 className="text-white font-bold text-lg sm:text-xl lg:text-2xl truncate">
                                        {leaveData.leaveType}
                                    </h2>
                                </div>
                                <p className="text-white/90 font-semibold text-sm sm:text-base lg:text-lg ml-3.5 sm:ml-5">
                                    {leaveData.days}
                                </p>
                            </div>
                            <span className={`${getStatusColor(leaveData.statusColor)} px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg flex-shrink-0`}>
                                {leaveData.status}
                            </span>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
                        {/* ประเภทการลา */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-100">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-800 font-bold text-sm sm:text-base">
                                    ประเภทการลา
                                </h3>
                            </div>
                            <p className="text-gray-700 text-sm sm:text-base ml-8 sm:ml-10 lg:ml-12 font-medium">
                                {leaveData.category}
                            </p>
                        </div>

                        {/* ช่วงเวลา */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-100">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-800 font-bold text-sm sm:text-base">
                                    ช่วงเวลา
                                </h3>
                            </div>
                            <p className="text-gray-700 text-sm sm:text-base ml-8 sm:ml-10 lg:ml-12 font-medium">
                                {leaveData.period}
                            </p>
                        </div>

                        {/* เหตุผลในการลา */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-100">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-800 font-bold text-sm sm:text-base">
                                    เหตุผลในการลา
                                </h3>
                            </div>
                            <p className="text-gray-700 text-sm sm:text-base ml-8 sm:ml-10 lg:ml-12 font-medium leading-relaxed">
                                {leaveData.reason}
                            </p>
                        </div>

                        {/* เอกสารเพิ่มเติม */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-100">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-800 font-bold text-sm sm:text-base">
                                    เอกสารเพิ่มเติม
                                </h3>
                            </div>
                            {leaveData.documents.length === 0 ? (
                                <p className="text-gray-500 text-xs sm:text-sm ml-8 sm:ml-10 lg:ml-12 italic">ไม่มีเอกสารแนบ</p>
                            ) : (
                                <div className="ml-8 sm:ml-10 lg:ml-12 space-y-2">
                                    {leaveData.documents.map((doc, index) => (
                                        <div key={index} className="text-gray-700 text-sm sm:text-base font-medium">
                                            {doc}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Button - Show only when status is "รออนุมัติ" */}
            {leaveData.status === 'รออนุมัติ' && (
                <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6 bg-gradient-to-t from-white via-white to-transparent backdrop-blur-sm">
                    <button 
                        onClick={handleCancelLeave}
                        className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>ยกเลิกการลา</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default LeaveDetail;
