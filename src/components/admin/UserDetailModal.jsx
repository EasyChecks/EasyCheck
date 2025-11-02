import React, { useEffect, useState } from 'react';

// ✅ ฟังก์ชันแปลงวันที่ ISO (YYYY-MM-DD) เป็นรูปแบบไทย (DD/MM/YYYY พ.ศ.)
const formatThaiDate = (isoDate) => {
  if (!isoDate) return 'ไม่ระบุ';
  
  try {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearBE = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
    
    return `${day}/${month}/${yearBE}`;
  } catch {
    return isoDate; // ถ้าแปลงไม่ได้ ให้แสดงค่าเดิม
  }
};

const UserDetailModal = React.memo(function UserDetailModal({ 
  user, 
  showDetail,
  showAttendance,
  selectedDate,
  currentUser,
  onClose, 
  onEdit, 
  onDownloadPDF,
  onDelete,
  onToggleAttendance,
  getStatusBadge,
  // Attendance verification props
  getFilteredAttendanceRecords,
  editingAttendance,
  attendanceForm,
  onSetSelectedDate,
  onAttendanceEdit,
  onSaveAttendanceEdit,
  onAttendanceFormChange
}) {
  // 🔥 State สำหรับ sync timeSummary แบบ real-time
  const [currentTimeSummary, setCurrentTimeSummary] = useState(user?.timeSummary);

  // ฟัง event จาก AuthProvider เมื่อ timeSummary อัพเดต
  useEffect(() => {
    const handleTimeSummaryUpdate = (event) => {
      if (event.detail.userId === user?.id) {
        setCurrentTimeSummary(event.detail.timeSummary);
      }
    };

    window.addEventListener('timeSummaryUpdated', handleTimeSummaryUpdate);
    
    return () => {
      window.removeEventListener('timeSummaryUpdated', handleTimeSummaryUpdate);
    };
  }, [user?.id]);

  // อัพเดต timeSummary จาก localStorage เมื่อ user เปลี่ยน
  useEffect(() => {
    if (user) {
      try {
        const storedUsers = localStorage.getItem('usersData');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const currentUser = users.find(u => u.id === user.id);
          if (currentUser?.timeSummary) {
            setCurrentTimeSummary(currentUser.timeSummary);
          }
        }
      } catch (error) {
        console.warn('Failed to load timeSummary:', error);
      }
    }
  }, [user]);
  
  // ป้องกันการ scroll พื้นหลังเมื่อ modal เปิด
  useEffect(() => {
    if (showDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetail]);

  if (!showDetail || !user) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-sm w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-primary px-6 py-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-md">ข้อมูลผู้ใช้</h2>
                <p className="text-white/80 text-sm">ข้อมูลส่วนตัวและประวัติการทำงาน</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEdit(user)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors transform hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                แก้ไขข้อมูล
              </button>
              {onDelete && (
                <button 
                  onClick={() => onDelete(user)}
                  disabled={currentUser?.role === 'admin' && user?.role === 'superadmin'}
                  className={`px-4 py-2 rounded-xl transition-colors transform flex items-center gap-2 font-medium shadow-sm ${
                    currentUser?.role === 'admin' && user?.role === 'superadmin'
                      ? 'bg-brand-accent text-secondary cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white hover:scale-105'
                  }`}
                  title={currentUser?.role === 'admin' && user?.role === 'superadmin' ? 'ไม่สามารถลบ Super Admin ได้' : 'ลบผู้ใช้'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  ลบ
                </button>
              )}
              <button 
                onClick={onDownloadPDF} 
                className="px-4 py-2 bg-white/20 hover:bg-brand-accent/30 backdrop-blur-md text-white rounded-xl transition-colors transform hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              {user.attendanceRecords && (
                <button 
                  onClick={onToggleAttendance} 
                  className="px-4 py-2 bg-white/20 hover:bg-brand-accent/30 backdrop-blur-md text-white rounded-xl transition-colors transform hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {showAttendance ? 'ซ่อน' : 'เช็คอิน/เอาต์'}
                </button>
              )}
              <button 
                onClick={onClose} 
                className="px-4 py-2 bg-white/20 hover:bg-brand-accent/30 backdrop-blur-md text-white rounded-xl transition-colors transform hover:scale-105 font-medium shadow-lg"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Attendance Verification Section - Collapsible */}
          {showAttendance && user.attendanceRecords && getFilteredAttendanceRecords && (
            <div className="mb-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ตรวจสอบการเข้า-ออกงาน
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => onSetSelectedDate(e.target.value)}
                      className="px-3 py-2 pr-8 border-2 border-orange-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
                      placeholder="กรองตามวันที่"
                    />
                    {selectedDate && (
                      <button
                        onClick={() => onSetSelectedDate('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="ยกเลิกการเลือก (แสดง 3 วันล่าสุด)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                    {selectedDate ? '1 วัน' : '3 วันล่าสุด'}
                  </div>
                </div>
              </div>

              {getFilteredAttendanceRecords().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  ไม่พบข้อมูลการเข้า-ออกงานในวันที่เลือก
                </div>
              ) : (
                getFilteredAttendanceRecords().map((record, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 mb-3 shadow-md border border-orange-100">
                    <div className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {record.date}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Check In */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-green-700 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            เข้างาน
                          </h4>
                          {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                            <button onClick={onSaveAttendanceEdit} className="text-xs px-2 py-1 bg-green-500 text-white rounded">บันทึก</button>
                          ) : (
                            <button onClick={() => onAttendanceEdit(record, 'checkIn')} className="text-xs px-2 py-1 bg-white border border-green-300 rounded hover:bg-green-100">แก้ไข</button>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <img src={record.checkIn.photo} alt="check-in" className="w-16 h-16 rounded-lg object-cover border-2 border-green-300" />
                            <div className="flex-1">
                              <div className="text-xs text-gray-500">เวลา</div>
                              {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                                <input type="time" value={attendanceForm.time} onChange={(e) => onAttendanceFormChange({...attendanceForm, time: e.target.value})} className="text-base font-bold border rounded px-2 py-1 w-full" />
                              ) : (
                                <div className="text-base font-bold text-gray-800">{record.checkIn.time}</div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">สถานะ</div>
                            {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                              <select value={attendanceForm.status} onChange={(e) => onAttendanceFormChange({...attendanceForm, status: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                <option value="ตรงเวลา">ตรงเวลา</option>
                                <option value="มาสาย">มาสาย</option>
                                <option value="ขาด">ขาด</option>
                                <option value="ลา">ลา</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkIn.status === 'ตรงเวลา' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {record.checkIn.status}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">ตำแหน่ง</div>
                            {editingAttendance?.record === record && editingAttendance?.type === 'checkIn' ? (
                              <select value={attendanceForm.location} onChange={(e) => onAttendanceFormChange({...attendanceForm, location: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                <option value="อยู่ในพื้นที่">อยู่ในพื้นที่</option>
                                <option value="อยู่นอกพื้นที่">อยู่นอกพื้นที่</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkIn.location === 'อยู่ในพื้นที่' ? 'bg-brand-accent text-primary' : 'bg-orange-100 text-orange-700'}`}>
                                {record.checkIn.location}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">GPS</div>
                            <a href={`https://maps.google.com/?q=${record.checkIn.gps}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{record.checkIn.gps}</a>
                          </div>
                        </div>
                      </div>

                      {/* Check Out */}
                      {record.checkOut && (
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-red-700 flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              ออกงาน
                            </h4>
                            {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                              <button onClick={onSaveAttendanceEdit} className="text-xs px-2 py-1 bg-red-500 text-white rounded">บันทึก</button>
                            ) : (
                              <button onClick={() => onAttendanceEdit(record, 'checkOut')} className="text-xs px-2 py-1 bg-white border border-orange-300 rounded hover:bg-red-100">แก้ไข</button>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <img src={record.checkOut.photo} alt="check-out" className="w-16 h-16 rounded-lg object-cover border-2 border-orange-300" />
                              <div className="flex-1">
                                <div className="text-xs text-gray-500">เวลา</div>
                                {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                                  <input type="time" value={attendanceForm.time} onChange={(e) => onAttendanceFormChange({...attendanceForm, time: e.target.value})} className="text-base font-bold border rounded px-2 py-1 w-full" />
                                ) : (
                                  <div className="text-base font-bold text-gray-800">{record.checkOut.time}</div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-xs text-gray-500">สถานะ</div>
                              {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                                <select value={attendanceForm.status} onChange={(e) => onAttendanceFormChange({...attendanceForm, status: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                  <option value="ตรงเวลา">ตรงเวลา</option>
                                  <option value="มาสาย">มาสาย</option>
                                  <option value="ขาด">ขาด</option>
                                  <option value="ลา">ลา</option>
                                </select>
                              ) : (
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkOut.status === 'ตรงเวลา' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {record.checkOut.status}
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-xs text-gray-500">ตำแหน่ง</div>
                              {editingAttendance?.record === record && editingAttendance?.type === 'checkOut' ? (
                                <select value={attendanceForm.location} onChange={(e) => onAttendanceFormChange({...attendanceForm, location: e.target.value})} className="text-sm border rounded px-2 py-1 w-full">
                                  <option value="อยู่ในพื้นที่">อยู่ในพื้นที่</option>
                                  <option value="อยู่นอกพื้นที่">อยู่นอกพื้นที่</option>
                                </select>
                              ) : (
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.checkOut.location === 'อยู่ในพื้นที่' ? 'bg-brand-accent text-primary' : 'bg-orange-100 text-orange-700'}`}>
                                  {record.checkOut.location}
                                </span>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-xs text-gray-500">GPS</div>
                              <a href={`https://maps.google.com/?q=${record.checkOut.gps}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{record.checkOut.gps}</a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Profile */}
            <div className="lg:col-span-1 space-y-5">
              {/* Profile Card */}
              <div className="bg-brand-accent rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-sm ">
                    <img src={user.profileImage || `https://i.pravatar.cc/300?u=${user.id}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="mt-4 text-center w-full">
                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{user.position || 'ไม่ระบุตำแหน่ง'}</p>
                    <div className="mt-3 space-y-2">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(user.status)}`}>
                        {user.status}
                      </span>
                      <div className="text-xs text-gray-600">รหัสพนักงาน: {user.employeeId}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ข้อมูลส่วนตัว */}
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ข้อมูลส่วนตัว
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">วันเกิด</span>
                    <span className="font-medium text-gray-800">{formatThaiDate(user.birthDate)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">อายุ</span>
                    <span className="font-medium text-gray-800">{user.age} ปี</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">เลขบัตรประชาชน</span>
                    <span className="font-medium text-gray-800">{user.nationalId || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">หมู่เลือด</span>
                    <span className="font-medium text-gray-800">{user.bloodType || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">อีเมล</span>
                    <span className="font-medium text-gray-800 text-xs">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">เบอร์โทร</span>
                    <span className="font-medium text-gray-800">{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* ข้อมูลบัญชี */}
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  ข้อมูลบัญชี
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Username (User)</span>
                    <span className="font-medium text-gray-800">{user.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Password</span>
                    <span className="font-medium text-gray-800">{user.password || '••••••••'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">บทบาท</span>
                    <span className="font-medium text-gray-800 capitalize">{user.role}</span>
                  </div>
                  
                  {/* Show Admin Account if user is admin or superadmin */}
                  {(user.role === 'admin' || user.role === 'superadmin') && user.adminAccount && (
                    <>
                      <div className="pt-3 border-t-2 border-gray-200">
                        <div className="bg-brand-accent rounded-lg p-3 mb-3">
                          <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            บัญชี {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Username (Admin)</span>
                        <span className="font-medium text-primary">{user.adminAccount}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Password (Admin)</span>
                        <span className="font-medium text-primary">{user.adminPassword || '••••••••'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-5">
              {/* ข้อมูลการทำงาน */}
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  ข้อมูลการทำงาน
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="py-2">
                    <div className="text-gray-500 text-xs mb-1">ตำแหน่ง</div>
                    <div className="font-medium text-gray-800">{user.position || 'ไม่ระบุ'}</div>
                  </div>
                  <div className="py-2">
                    <div className="text-gray-500 text-xs mb-1">แผนก</div>
                    <div className="font-medium text-gray-800">{user.department}</div>
                  </div>
                  <div className="py-2">
                    <div className="text-gray-500 text-xs mb-1">รหัสพนักงาน</div>
                    <div className="font-medium text-gray-800">{user.employeeId}</div>
                  </div>
                  <div className="py-2">
                    <div className="text-gray-500 text-xs mb-1">วันที่เริ่มงาน</div>
                    <div className="font-medium text-gray-800">{user.startDate || 'ไม่ระบุ'}</div>
                  </div>
                  <div className="py-2">
                    <div className="text-gray-500 text-xs mb-1">ระยะเวลางาน</div>
                    <div className="font-medium text-gray-800">{user.workPeriod || 'ไม่ระบุ'}</div>
                  </div>
                  <div className="py-2">
                    <div className="text-gray-500 text-xs mb-1">เงินเดือน</div>
                    <div className="font-medium text-gray-800">{user.salary ? `${Number(user.salary).toLocaleString()} บาท` : 'ไม่ระบุ'}</div>
                  </div>
                </div>
              </div>

              {/* ข้อมูลผู้ติดต่อฉุกเฉิน */}
              {user.emergencyContact && (
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    ผู้ติดต่อฉุกเฉิน
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="py-2">
                      <div className="text-gray-500 text-xs mb-1">ชื่อ</div>
                      <div className="font-medium text-gray-800">{user.emergencyContact.name}</div>
                    </div>
                    <div className="py-2">
                      <div className="text-gray-500 text-xs mb-1">เบอร์โทร</div>
                      <div className="font-medium text-gray-800">{user.emergencyContact.phone}</div>
                    </div>
                    <div className="py-2">
                      <div className="text-gray-500 text-xs mb-1">ความสัมพันธ์</div>
                      <div className="font-medium text-gray-800">{user.emergencyContact.relation}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ที่อยู่ */}
              {user.address && (
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ที่อยู่
                  </h4>
                  <p className="text-sm text-gray-700">{user.address}</p>
                </div>
              )}

              {/* สรุปเวลาทำงาน */}
              {currentTimeSummary && (
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    สรุปเวลาทำงาน
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Real-time</span>
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">{currentTimeSummary.totalWorkDays || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">วันทำงาน</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{currentTimeSummary.onTime || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">ตรงเวลา</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{currentTimeSummary.late || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">มาสาย</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{currentTimeSummary.absent || 0}</div>
                      <div className="text-xs text-gray-500 mt-1">ขาดงาน</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">เวลาเข้างานเฉลี่ย:</span>
                      <span className="font-bold text-primary">{currentTimeSummary.avgCheckIn || '08:00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ชั่วโมงทำงานรวม:</span>
                      <span className="font-bold text-primary">{currentTimeSummary.totalHours || '0 ชม.'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ประวัติการทำงาน */}
              {user.workHistory && user.workHistory.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    ประวัติการทำงาน
                  </h4>
                  <div className="space-y-3">
                    {user.workHistory.map((work, index) => (
                      <div key={index} className="flex gap-3 text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-800">{work.position}</div>
                          <div className="text-gray-600">{work.company}</div>
                          <div className="text-xs text-gray-500">{work.period}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* การศึกษา */}
              {user.education && user.education.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                    การศึกษา
                  </h4>
                  <div className="space-y-2">
                    {user.education.map((edu, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-700">{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {user.skills && user.skills.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    ทักษะ
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-brand-accent text-primary rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ข้อมูลสวัสดิการ */}
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ข้อมูลสวัสดิการ
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">เลขประกันสังคม</span>
                    <span className="font-medium text-gray-800">{user.socialSecurityNumber || 'ไม่ระบุ'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">สิทธิประกันสังคม</span>
                    <span className="font-medium text-gray-800">{user.socialSecurityNumber ? 'มี' : 'ไม่มี'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">กองทุนสำรองเลี้ยงชีพ</span>
                    <span className="font-medium text-gray-800">{user.salary && Number(user.salary) >= 30000 ? 'มี' : 'ไม่มี'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">ประกันสุขภาพกลุ่ม</span>
                    <span className="font-medium text-gray-800">{user.salary && Number(user.salary) >= 40000 ? 'มี' : 'ไม่มี'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UserDetailModal;
