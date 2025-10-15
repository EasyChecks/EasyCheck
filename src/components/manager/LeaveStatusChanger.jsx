import React, { useState } from 'react'
import { useLeave } from '../../contexts/LeaveContext'

/**
 * LeaveStatusChanger Component
 * ปุ่มเปลี่ยนสถานะการลาพร้อม dropdown menu
 * 
 * @param {Object} props
 * @param {Object} props.leaveData - ข้อมูลการลา (ต้องมี id)
 * @param {Function} props.onStatusChanged - Callback function เมื่อเปลี่ยนสถานะสำเร็จ (optional)
 * @param {string} props.className - CSS class เพิ่มเติม (optional)
 * @param {boolean} props.showCancelButton - แสดงปุ่มยกเลิกการลาหรือไม่ (default: false)
 */
function LeaveStatusChanger({ leaveData, onStatusChanged, className = '', showCancelButton = false }) {
    const { updateLeaveStatus, cancelLeave } = useLeave()
    const [showStatusMenu, setShowStatusMenu] = useState(false)

    const handleChangeStatus = (newStatus) => {
        if (!leaveData?.id) {
            alert('ไม่พบ ID ของการลา กรุณาลองใหม่')
            console.error('Leave Data:', leaveData)
            return
        }

        if (window.confirm(`ต้องการเปลี่ยนสถานะเป็น "${newStatus}" หรือไม่?`)) {
            // Update in context
            updateLeaveStatus(leaveData.id, newStatus)
            setShowStatusMenu(false)

            // Show success message
            alert(`เปลี่ยนสถานะเป็น "${newStatus}" เรียบร้อยแล้ว\nProgress bar จะอัปเดตทันที!`)

            // Call callback function if provided
            if (onStatusChanged && typeof onStatusChanged === 'function') {
                const statusColors = {
                    'รออนุมัติ': 'yellow',
                    'อนุมัติ': 'green',
                    'ไม่อนุมัติ': 'red'
                }
                onStatusChanged(newStatus, statusColors[newStatus] || 'yellow')
            }
        }
    }

    const handleCancelLeave = () => {
        if (window.confirm('คุณต้องการยกเลิกการลานี้หรือไม่?')) {
            const success = cancelLeave(leaveData.id)
            if (success) {
                alert('ยกเลิกการลาเรียบร้อยแล้ว')
                if (onStatusChanged) {
                    onStatusChanged('cancelled', 'gray')
                }
            } else {
                alert('ไม่สามารถยกเลิกการลานี้ได้ (เฉพาะสถานะ "รออนุมัติ" เท่านั้น)')
            }
        }
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Status Change Button */}
            <div className="relative">
                <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                    </svg>
                    <span>เปลี่ยนสถานะ</span>
                </button>

                {/* Status Menu Dropdown */}
                {showStatusMenu && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                        <button
                            onClick={() => handleChangeStatus('รออนุมัติ')}
                            className="w-full px-4 py-3 sm:py-4 text-left hover:bg-yellow-50 transition-colors border-b border-gray-100 flex items-center gap-3"
                        >
                            <span className="text-2xl">🟡</span>
                            <div>
                                <div className="font-bold text-yellow-700 text-sm sm:text-base">
                                    รออนุมัติ
                                </div>
                                <div className="text-xs text-gray-500">
                                    เปลี่ยนเป็นสถานะรออนุมัติ
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => handleChangeStatus('อนุมัติ')}
                            className="w-full px-4 py-3 sm:py-4 text-left hover:bg-green-50 transition-colors border-b border-gray-100 flex items-center gap-3"
                        >
                            <span className="text-2xl">✅</span>
                            <div>
                                <div className="font-bold text-green-700 text-sm sm:text-base">
                                    อนุมัติ
                                </div>
                                <div className="text-xs text-gray-500">
                                    เปลี่ยนเป็นสถานะอนุมัติ
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => handleChangeStatus('ไม่อนุมัติ')}
                            className="w-full px-4 py-3 sm:py-4 text-left hover:bg-red-50 transition-colors flex items-center gap-3"
                        >
                            <span className="text-2xl">❌</span>
                            <div>
                                <div className="font-bold text-red-700 text-sm sm:text-base">
                                    ไม่อนุมัติ
                                </div>
                                <div className="text-xs text-gray-500">
                                    เปลี่ยนเป็นสถานะไม่อนุมัติ
                                </div>
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel Button - Show only when showCancelButton is true and status is "รออนุมัติ" */}
            {showCancelButton && leaveData?.status === 'รออนุมัติ' && (
                <button
                    onClick={handleCancelLeave}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    <span>ยกเลิกการลา</span>
                </button>
            )}
        </div>
    )
}

export default LeaveStatusChanger
