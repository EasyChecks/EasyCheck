import React, { useMemo, useEffect } from 'react';
import { useTeam } from '../../../contexts/useTeam';
import { useLoading } from '../../../contexts/useLoading';

function TeamAttendance() {
  const { teamMembers } = useTeam();
  const { hideLoading } = useLoading();

  // Hide loading เมื่อ component พร้อม render
  useEffect(() => {
    hideLoading()
  }, [hideLoading])

  // นับจำนวนแต่ละสถานะ
  const stats = useMemo(() => {
    const total = teamMembers.length;
    const checkedIn = teamMembers.filter(m => m.status === 'checked_in').length;
    const late = teamMembers.filter(m => m.isLate).length;
    const absent = teamMembers.filter(m => m.status === 'absent').length;

    return { total, checkedIn, late, absent };
  }, [teamMembers]);

  // ฟังก์ชันแสดงสถานะ
  const getStatusBadge = (member) => {
    if (member.status === 'absent') {
      return <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">ขาดงาน</span>;
    }
    if (member.isLate) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-semibold">สาย</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">ตรงเวลา</span>;
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">การเข้างานของทีม</h1>
        <p className="text-gray-600 mt-1">ติดตามการเข้า-ออกงานของลูกน้อง</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-1">ทั้งหมด</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
          <p className="text-sm text-gray-600 mt-1">เข้างาน</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats.late}</p>
          <p className="text-sm text-gray-600 mt-1">สาย</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-sm text-gray-600 mt-1">ขาด</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">รายชื่อพนักงาน</h2>
        </div>
        <div className="divide-y">
          {teamMembers.map((member) => (
            <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 bg-white border-[#48CBFF] border rounded-full flex items-center justify-center text-gray-800 font-bold shadow-md">
                    {member.profilePic ? (
                      <img src={member.profilePic} alt={member.name} className="w-full h-full rounded-full object-cover " />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.position}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Time */}
                  <div className="text-right hidden sm:block">
                    {member.checkInTime && (
                      <div className="flex items-center space-x-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#48CBFF">
                          <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm112 168 56-56-128-128v-184h-80v216l152 152Z"/>
                        </svg>
                        <span className="text-gray-600">{member.checkInTime}</span>
                      </div>
                    )}
                    {member.checkOutTime && (
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#FF6666">
                          <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm112 168 56-56-128-128v-184h-80v216l152 152Z"/>
                        </svg>
                        <span className="text-gray-600">{member.checkOutTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {getStatusBadge(member)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamAttendance;
