import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function ListLeave() {
    const navigate = useNavigate()
    const location = useLocation()
    
    // Get selected leave type from navigation state
    const selectedLeaveType = location.state?.leaveType || null
    
    // Mock data - ข้อมูลการลาทั้งหมด
    const [allLeaveList] = useState([
        {
            id: 1,
            leaveType: 'ลาป่วย',
            days: '4 วัน',
            category: 'ลาป่วย',
            period: '23/09/2025 → 26/09/2025',
            startDate: '23/09/2025',
            endDate: '26/09/2025',
            reason: 'test',
            status: 'รออนุมัติ',
            statusColor: 'yellow',
            documents: []
        },
        {
            id: 2,
            leaveType: 'ลากิจ',
            days: '2 วัน',
            category: 'ลากิจ',
            period: '15/10/2025 → 16/10/2025',
            startDate: '15/10/2025',
            endDate: '16/10/2025',
            reason: 'ธุระส่วนตัว',
            status: 'อนุมัติ',
            statusColor: 'green',
            documents: []
        },
        {
            id: 3,
            leaveType: 'ลาพักร้อน',
            days: '5 วัน',
            category: 'ลาพักร้อน',
            period: '01/11/2025 → 05/11/2025',
            startDate: '01/11/2025',
            endDate: '05/11/2025',
            reason: 'เที่ยวกับครอบครัว',
            status: 'อนุมัติ',
            statusColor: 'green',
            documents: []
        },
        {
            id: 4,
            leaveType: 'ลาป่วย',
            days: '1 วัน',
            category: 'ลาป่วย',
            period: '10/09/2025',
            startDate: '10/09/2025',
            endDate: '10/09/2025',
            reason: 'ไข้หวัด',
            status: 'ไม่อนุมัติ',
            statusColor: 'red',
            documents: []
        },
        {
            id: 5,
            leaveType: 'ลาป่วย',
            days: '2 วัน',
            category: 'ลาป่วย',
            period: '05/08/2025 → 06/08/2025',
            startDate: '05/08/2025',
            endDate: '06/08/2025',
            reason: 'ป่วยไข้หวัด',
            status: 'อนุมัติ',
            statusColor: 'green',
            documents: []
        },
        {
            id: 6,
            leaveType: 'ลากิจ',
            days: '1 วัน',
            category: 'ลากิจ',
            period: '20/09/2025',
            startDate: '20/09/2025',
            endDate: '20/09/2025',
            reason: 'ติดธุระส่วนตัว',
            status: 'รออนุมัติ',
            statusColor: 'yellow',
            documents: []
        }
    ])

    // Filter leave list by selected type
    const leaveList = useMemo(() => {
        if (!selectedLeaveType) {
            return allLeaveList
        }
        return allLeaveList.filter(leave => leave.leaveType === selectedLeaveType)
    }, [allLeaveList, selectedLeaveType])

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

    const handleLeaveClick = (leave) => {
        // Navigate to detail page with leave data
        navigate(`/user/leave/detail/${leave.id}`, { state: { leaveData: leave } })
    }

    return (
        <div className="min-h-screen bg-gray-50 font-prompt pb-20">
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
                    <h1 className="text-blue-600 text-xl font-semibold">
                        {selectedLeaveType ? `รายการ${selectedLeaveType}` : 'รายการการลา'}
                    </h1>
                    <div className="w-6"></div>
                </div>
            </div>

            {/* Leave List */}
            <div className="px-4 py-4 space-y-3">
                {leaveList.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">ไม่มีรายการการลา</p>
                    </div>
                ) : (
                    leaveList.map((leave) => (
                        <div 
                            key={leave.id}
                            onClick={() => handleLeaveClick(leave)}
                            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        >
                            {/* Header with type and status */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-blue-700 font-semibold text-base">
                                        {leave.leaveType}
                                    </h3>
                                    <p className="text-blue-600 text-sm mt-1">
                                        {leave.days}
                                    </p>
                                </div>
                                <span className={`${getStatusColor(leave.statusColor)} px-3 py-1 rounded-full text-xs font-medium`}>
                                    {leave.status}
                                </span>
                            </div>

                            {/* Date range */}
                            <div className="flex items-center text-gray-500 text-sm mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{leave.period}</span>
                            </div>

                            {/* Reason preview */}
                            <p className="text-gray-600 text-sm line-clamp-1">
                                {leave.reason}
                            </p>

                            {/* Arrow indicator */}
                            <div className="flex justify-end mt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button - Add new leave */}
            {/* <button 
                onClick={() => navigate('/user/leave/request')}
                className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 shadow-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button> */}
        </div>
    )
}

export default ListLeave;