import React, { useState, useMemo, useCallback } from 'react';

// Component: UserTable - แสดงตารางรายชื่อพนักงานพร้อมระบบขยายดูข้อมูล GPS และรูปถ่าย
// Props:
//   - users: รายการข้อมูลพนักงาน
//   - onSelectUser: ฟังก์ชันเมื่อกดดูรายละเอียด
//   - getStatusBadge: ฟังก์ชันจัดการสีของสถานะ
const UserTable = React.memo(function UserTable({ users, onSelectUser, getStatusBadge }) {
  // สถานะการขยายแถว - เก็บ userId ของแถวที่กำลังขยาย
  const [expandedUserId, setExpandedUserId] = useState(null);
  
  // วันที่ที่เลือก - Default เป็นวันปัจจุบัน
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // ฟังก์ชันสร้างข้อมูลการเข้างาน GPS และรูปถ่าย (Mock Data)
  // ใน Production: ดึงข้อมูลจาก API แทน
  // Parameters:
  //   - userId: รหัสพนักงาน
  //   - date: วันที่ที่ต้องการดูข้อมูล
  // Returns: Object ที่มีข้อมูล checkIn และ checkOut
  const getAttendanceData = useMemo(() => {
    return (userId, date) => {
      // สร้าง seed จาก userId และ date เพื่อให้ข้อมูลแต่ละคนแต่ละวันไม่เหมือนกัน
      const seed = String(userId) + String(date);
      const numericSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // ใช้ userId แบบตรงๆ เพื่อกำหนดสถานะ GPS ให้แต่ละคน (ไม่เปลี่ยนแปลงทุก refresh)
      // แบ่งเป็น 2 กลุ่ม: อยู่ในระยะ และ อยู่นอกระยะ
      // - userId คี่ (1, 3, 5) = อยู่ในระยะ (50%)
      // - userId คู่ (2, 4, 6) = อยู่นอกระยะ (50%)
      const isInRange = userId % 2 === 1;
      
      // สุ่มเวลาแต่ละคนโดยใช้ userId เป็นหลัก
      const checkInBase = 7 + (userId % 3); // 7-9 โมง
      const checkInMinute = (numericSeed % 60);
      const checkOutBase = 17 + (userId % 2); // 17-18 โมง
      const checkOutMinute = ((numericSeed + 30) % 60);
      
      // คำนวณระยะห่าง
      let checkInDistance, checkOutDistance;
      if (isInRange) {
        // อยู่ในระยะ: 10-50 เมตร
        checkInDistance = `${10 + (userId * 7 % 40)} ม.`;
        checkOutDistance = `${15 + (userId * 5 % 35)} ม.`;
      } else {
        // อยู่นอกระยะ: 100-500 เมตร (หลากหลาย)
        checkInDistance = `${100 + (userId * 13 % 400)} ม.`;
        checkOutDistance = `${120 + (userId * 11 % 380)} ม.`;
      }
      
      // สร้าง URL รูปที่ไม่ซ้ำกันสำหรับแต่ละคน
      const photoSeed = `${userId}-${date}`;

      return {
        checkIn: {
          time: `${String(checkInBase).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}`,
          gpsStatus: isInRange ? 'อยู่ในระยะ' : 'อยู่นอกระยะ',
          distance: checkInDistance,
          location: `${(13.7563 + (userId * 7 % 100) * 0.0001).toFixed(4)}° N, ${(100.5018 + (userId * 5 % 100) * 0.0001).toFixed(4)}° E`,
          photo: `https://i.pravatar.cc/400?u=checkin-${photoSeed}`
        },
        checkOut: {
          time: `${String(checkOutBase).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}`,
          gpsStatus: isInRange ? 'อยู่ในระยะ' : 'อยู่นอกระยะ',
          distance: checkOutDistance,
          location: `${(13.7565 + (userId * 11 % 100) * 0.0001).toFixed(4)}° N, ${(100.5020 + (userId * 13 % 100) * 0.0001).toFixed(4)}° E`,
          photo: `https://i.pravatar.cc/400?u=checkout-${photoSeed}`
        }
      };
    };
  }, []); // Empty dependency - ฟังก์ชันนี้ไม่ขึ้นกับ state ใดๆ


  // จัดการการขยาย/ย่อแถว (ใช้ useCallback เพื่อป้องกัน re-render ที่ไม่จำเป็น)
  const toggleExpand = useCallback((userId, e) => {
    e.stopPropagation(); // ป้องกันไม่ให้เปิด detail modal
    setExpandedUserId(prevId => prevId === userId ? null : userId);
  }, []);

  // จัดการการเปลี่ยนวันที่ (ใช้ useCallback เพื่อป้องกัน re-render ที่ไม่จำเป็น)
  const handleDateChange = useCallback((date, e) => {
    e.stopPropagation(); // ป้องกัน event bubbling
    setSelectedDate(date);
  }, []);

  return (
    <div className="bg-white dark:bg-secondary/95 transition-colors duration-300 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-white/10">
      {/* 🔥 Scroll แนวนอนเมื่อตารางกว้างเกิน + Scroll แนวตั้งเมื่อข้อมูลเยอะ */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)]">
        {/* เพิ่ม min-width เพื่อให้ตารางกว้างพอ มี scroll แนวนอนได้ */}
        <table className="w-full min-w-[1200px]">
          <thead className="bg-brand-accent dark:bg-orange-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-12">
                
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                ชื่อ-นามสกุล
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                แผนก
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                บทบาท
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                รหัสพนักงาน
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => {
              const isExpanded = expandedUserId === user.id;
              const attendanceData = isExpanded ? getAttendanceData(user.id, selectedDate) : null;
              
              return (
                <React.Fragment key={user.id}>
                  <tr className="hover:bg-orange-50/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => toggleExpand(user.id, e)}
                        className="p-1 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary dark:bg-primary flex-shrink-0">
                          <img
                            src={user.profileImage || `https://i.pravatar.cc/100?u=${user.id}`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-black dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{user.department}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onSelectUser(user)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-primary dark:bg-primary-orange text-white rounded-lg hover:bg-primary/70 transition-colors transform hover:scale-105 text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row - GPS & Photos */}
                  {isExpanded && (
                    <tr className="bg-white dark:bg-secondary/95 transition-colors duration-300">
                      <td colSpan="7" className="px-6 py-6">
                        <div className="space-y-4">
                          {/* Date Selector */}
                          <div className="flex items-center gap-3 mb-4">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              เลือกวันที่:
                            </label>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => handleDateChange(e.target.value, e)}
                              className="px-4 py-2 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:outline-none transition-colors text-sm font-medium"
                              style={{ colorScheme: 'light' }}
                            />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Check-in Section */}
                            <div className="bg-white rounded-xl shadow-md border-2 border-green-200 overflow-hidden">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                  </svg>
                                  Check-in
                                </h4>
                              </div>
                              <div className="p-4 space-y-4">
                                {/* Photo */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-2">รูปถ่าย</p>
                                  <div className="relative w-full pb-[100%]">
                                    <img
                                      src={attendanceData.checkIn.photo}
                                      alt="Check-in"
                                      className="absolute inset-0 w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                    />
                                  </div>
                                </div>
                                
                                {/* Info */}
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">เวลา:</span>
                                    <span className="font-bold text-gray-950">{attendanceData.checkIn.time}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">GPS:</span>
                                    <span className={`font-bold ${attendanceData.checkIn.gpsStatus === 'อยู่ในระยะ' ? 'text-green-700' : 'text-red-700'}`}>
                                      {attendanceData.checkIn.gpsStatus}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">ระยะห่าง:</span>
                                    <span className="font-bold text-gray-950">{attendanceData.checkIn.distance}</span>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <div>
                                      <span className="text-gray-700 font-medium">พิกัด:</span>
                                      <p className="font-mono text-xs font-semibold text-gray-950 mt-1">{attendanceData.checkIn.location}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Check-out Section */}
                            <div className="bg-white rounded-xl shadow-md border-2 border-orange-200 overflow-hidden">
                              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                  </svg>
                                  Check-out
                                </h4>
                              </div>
                              <div className="p-4 space-y-4">
                                {/* Photo */}
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 mb-2">รูปถ่าย</p>
                                  <div className="relative w-full pb-[100%]">
                                    <img
                                      src={attendanceData.checkOut.photo}
                                      alt="Check-out"
                                      className="absolute inset-0 w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                    />
                                  </div>
                                </div>
                                
                                {/* Info */}
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">เวลา:</span>
                                    <span className="font-bold text-gray-950">{attendanceData.checkOut.time}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">GPS:</span>
                                    <span className={`font-bold ${attendanceData.checkOut.gpsStatus === 'อยู่ในระยะ' ? 'text-green-700' : 'text-red-700'}`}>
                                      {attendanceData.checkOut.gpsStatus}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span className="text-gray-700 font-medium">ระยะห่าง:</span>
                                    <span className="font-bold text-gray-950">{attendanceData.checkOut.distance}</span>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    <div>
                                      <span className="text-gray-700 font-medium">พิกัด:</span>
                                      <p className="font-mono text-xs font-semibold text-gray-950 mt-1">{attendanceData.checkOut.location}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-gray-500 text-lg font-medium">ไม่พบข้อมูลผู้ใช้</p>
          <p className="text-gray-400 text-sm mt-1">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง</p>
        </div>
      )}
    </div>
  );
});

export default UserTable;
