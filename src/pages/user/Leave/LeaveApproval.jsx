import React, { useState, useMemo, useEffect } from 'react';
import { useTeam } from '../../../contexts/useTeam';
import { useLoading } from '../../../contexts/useLoading';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import SuccessDialog from '../../../components/common/SuccessDialog';

function LeaveApproval() {
  const { pendingLeaves, approveLeave, rejectLeave } = useTeam();
  const { hideLoading } = useLoading();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Dialog states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [leaveToApprove, setLeaveToApprove] = useState(null);
  
  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectingRange, setSelectingRange] = useState(false);

  // Hide loading เมื่อ component พร้อม render
  useEffect(() => {
    hideLoading()
  }, [hideLoading])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showRejectModal || showCalendar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRejectModal, showCalendar]);

  // กรองเฉพาะใบลาที่รออนุมัติ
  const activePendingLeaves = useMemo(() => {
    let filtered = pendingLeaves.filter(leave => leave.status === 'pending');
    
    // กรองตามช่วงวันที่ส่งใบลา ถ้ามีการเลือก
    if (selectedStartDate && selectedEndDate) {
      filtered = filtered.filter(leave => {
        // แปลง submittedDate จากรูปแบบ DD/MM/YYYY (พ.ศ.) เป็น Date object
        const [submitDay, submitMonth, submitYear] = leave.submittedDate.split('/');
        
        // แปลง พ.ศ. เป็น ค.ศ. โดยลบ 543
        const submittedDate = new Date(parseInt(submitYear) - 543, parseInt(submitMonth) - 1, parseInt(submitDay));
        
        // ตั้งเวลาเป็น 00:00:00 เพื่อให้เปรียบเทียบแค่วันที่
        submittedDate.setHours(0, 0, 0, 0);
        
        const rangeStart = new Date(selectedStartDate);
        const rangeEnd = new Date(selectedEndDate);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(0, 0, 0, 0);
        
        // ตรวจสอบว่าวันที่ส่งอยู่ในช่วงวันที่เลือกหรือไม่
        return (submittedDate >= rangeStart && submittedDate <= rangeEnd);
      });
    }
    
    return filtered;
  }, [pendingLeaves, selectedStartDate, selectedEndDate]);

  // ฟังก์ชันอนุมัติ
  const handleApprove = (leave) => {
    setLeaveToApprove(leave);
    setShowApproveConfirm(true);
  };

  const confirmApprove = () => {
    approveLeave(leaveToApprove.id);
    setShowApproveSuccess(true);
  };

  // ฟังก์ชันไม่อนุมัติ
  const handleReject = (leave) => {
    setSelectedLeave(leave);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลที่ไม่อนุมัติ');
      return;
    }
    rejectLeave(selectedLeave.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedLeave(null);
    setShowRejectSuccess(true);
  };

  // สีของแท็กประเภทการลา
  const getLeaveTypeBadge = (type) => {
    const colors = {
      'ลาป่วย': 'bg-red-100 text-red-600',
      'ลากิจ': 'bg-blue-100 text-blue-600',
      'ลาพักร้อน': 'bg-green-100 text-green-600',
      'ลาคลอด': 'bg-purple-100 text-purple-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  // จัดรูปแบบวันที่
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // รีเซ็ตการกรองวันที่
  const clearDateFilter = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (!selectingRange || !selectedStartDate) {
      // เริ่มเลือกวันที่แรก
      setSelectedStartDate(clickedDate);
      setSelectedEndDate(null);
      setSelectingRange(true);
    } else {
      // เลือกวันที่สิ้นสุด
      if (clickedDate < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(clickedDate);
      } else {
        setSelectedEndDate(clickedDate);
      }
      setSelectingRange(false);
    }
  };

  const isDateInRange = (day) => {
    if (!selectedStartDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate;
    } else {
      return date.toDateString() === selectedStartDate.toDateString();
    }
  };

  const isStartDate = (day) => {
    if (!selectedStartDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === selectedStartDate.toDateString();
  };

  const isEndDate = (day) => {
    if (!selectedEndDate) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toDateString() === selectedEndDate.toDateString();
  };

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">อนุมัติใบลา</h1>
        <p className="text-gray-600 mt-1">จัดการคำขอลาของลูกน้อง</p>
      </div>

      {/* Stats with Calendar Button */}
      <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm">ใบลารออนุมัติทั้งหมด</p>
            <p className="text-4xl font-bold mt-1">{activePendingLeaves.length}</p>
          </div>
          <button
            onClick={() => setShowCalendar(true)}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="white">
              <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Z"/>
            </svg>
          </button>
        </div>
        
        {/* Date Range Display */}
        {selectedStartDate && selectedEndDate && (
          <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="white">
                <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
              </svg>
              <span className="text-sm font-medium">
                {formatDate(selectedStartDate)} - {formatDate(selectedEndDate)}
              </span>
            </div>
            <button
              onClick={clearDateFilter}
              className="text-white hover:text-red-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Leave Requests List */}
      {activePendingLeaves.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#9CA3AF">
              <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่มีใบลารออนุมัติ</h3>
          <p className="text-gray-600">ยินดีด้วย! ได้จัดการใบลาทั้งหมดแล้ว</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activePendingLeaves.map((leave) => (
            <div key={leave.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white border-[#48CBFF] border rounded-full flex items-center justify-center text-gray-800 font-bold shadow-md">
                      {leave.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{leave.employeeName}</h3>
                      <p className="text-sm text-gray-500">ส่งเมื่อ {leave.submittedDate}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLeaveTypeBadge(leave.leaveType)}`}>
                    {leave.leaveType}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">วันที่เริ่มต้น</p>
                    <p className="font-semibold text-gray-800">{leave.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">วันที่สิ้นสุด</p>
                    <p className="font-semibold text-gray-800">{leave.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">จำนวนวัน</p>
                    <p className="font-semibold text-gray-800">{leave.totalDays} วัน</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">เหตุผล</p>
                  <p className="text-gray-700">{leave.reason}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(leave)}
                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
                  >
                    ✓ อนุมัติ
                  </button>
                  <button
                    onClick={() => handleReject(leave)}
                    className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
                  >
                    ✕ ไม่อนุมัติ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRejectModal(false);
              setRejectReason('');
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold">ไม่อนุมัติใบลา</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                กรุณาระบุเหตุผลที่ไม่อนุมัติใบลาของ <strong>{selectedLeave?.employeeName}</strong>
              </p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุเหตุผล..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-semibold"
              >
                ยืนยันไม่อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCalendar(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">เลือกช่วงวันที่</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                  </svg>
                </button>
              </div>
              <p className="text-white/80 text-sm">
                {selectedStartDate && selectedEndDate
                  ? `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`
                  : selectingRange && selectedStartDate
                  ? `เริ่มต้น: ${formatDate(selectedStartDate)} - เลือกวันสิ้นสุด`
                  : 'คลิกเลือกวันที่เริ่มต้น แล้วคลิกวันที่สิ้นสุด'}
              </p>
            </div>
            
            <div className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF">
                    <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
                  </svg>
                </button>
                <h3 className="text-lg font-bold text-gray-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
                </h3>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#48CBFF">
                    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                  </svg>
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getDaysInMonth(currentDate).startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {Array.from({ length: getDaysInMonth(currentDate).daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const inRange = isDateInRange(day);
                  const isStart = isStartDate(day);
                  const isEnd = isEndDate(day);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                        ${inRange ? 'bg-[#48CBFF] text-white font-bold' : 'hover:bg-gray-100 text-gray-700'}
                        ${isStart || isEnd ? 'ring-2 ring-[#3AB4E8] ring-offset-2' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setSelectedStartDate(null);
                  setSelectedEndDate(null);
                  setSelectingRange(false);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                ล้าง
              </button>
              <button
                onClick={() => {
                  if (selectedStartDate && selectedEndDate) {
                    setShowCalendar(false);
                  }
                }}
                disabled={!selectedStartDate || !selectedEndDate}
                className={`flex-1 px-4 py-2 rounded-xl transition-colors font-semibold
                  ${selectedStartDate && selectedEndDate 
                    ? 'bg-[#48CBFF] hover:bg-[#3AB4E8] text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => {
          setShowApproveConfirm(false);
          setLeaveToApprove(null);
        }}
        onConfirm={confirmApprove}
        title="อนุมัติใบลา"
        message={`ต้องการอนุมัติใบลาของ ${leaveToApprove?.employeeName} หรือไม่?`}
        confirmText="ตกลง"
        cancelText="ยกเลิก"
        type="success"
      />

      {/* Approve Success Dialog */}
      <SuccessDialog
        isOpen={showApproveSuccess}
        onClose={() => setShowApproveSuccess(false)}
        title="สำเร็จ!"
        message="อนุมัติใบลาเรียบร้อยแล้ว"
        autoClose={true}
        autoCloseDelay={2000}
      />

      {/* Reject Success Dialog */}
      <SuccessDialog
        isOpen={showRejectSuccess}
        onClose={() => setShowRejectSuccess(false)}
        title="สำเร็จ!"
        message="ไม่อนุมัติใบลาเรียบร้อยแล้ว"
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  );
}

export default LeaveApproval;
