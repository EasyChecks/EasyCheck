import React, { createContext, useState } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  // Mock ข้อมูลลูกน้องในทีม
  const [teamMembers] = useState([
    {
      id: 1,
      name: 'สมชาย ใจดี',
      position: 'Junior Developer',
      status: 'checked_in',
      checkInTime: '08:45',
      checkOutTime: null,
      isLate: false,
      profilePic: null
    },
    {
      id: 2,
      name: 'สมหญิง รักงาน',
      position: 'UI/UX Designer',
      status: 'checked_in',
      checkInTime: '09:15',
      checkOutTime: null,
      isLate: true, // สาย 15 นาที
      profilePic: null
    },
    {
      id: 3,
      name: 'วิชัย เก่งมาก',
      position: 'Frontend Developer',
      status: 'checked_in',
      checkInTime: '08:30',
      checkOutTime: null,
      isLate: false,
      profilePic: null
    },
    {
      id: 4,
      name: 'อรทัย สวยงาม',
      position: 'Backend Developer',
      status: 'absent',
      checkInTime: null,
      checkOutTime: null,
      isLate: false,
      profilePic: null
    },
    {
      id: 5,
      name: 'ประยุทธ์ ทำงานหนัก',
      position: 'QA Tester',
      status: 'not_checked_in',
      checkInTime: null,
      checkOutTime: null,
      isLate: false,
      profilePic: null
    }
  ]);

  // Mock ใบลาที่รออนุมัติ
  const [pendingLeaves, setPendingLeaves] = useState([
    {
      id: 1,
      employeeId: 2,
      employeeName: 'สมหญิง รักงาน',
      leaveType: 'ลาป่วย',
      startDate: '15/10/2568',
      endDate: '16/10/2568',
      totalDays: 2,
      reason: 'ไข้หวัด ปวดศีรษะ',
      status: 'pending',
      submittedDate: '14/10/2568',
      documents: []
    },
    {
      id: 2,
      employeeId: 4,
      employeeName: 'อรทัย สวยงาม',
      leaveType: 'ลากิจ',
      startDate: '18/10/2568',
      endDate: '18/10/2568',
      totalDays: 1,
      reason: 'ติดธุระส่วนตัว',
      status: 'pending',
      submittedDate: '15/10/2568',
      documents: []
    },
    {
      id: 3,
      employeeId: 1,
      employeeName: 'สมชาย ใจดี',
      leaveType: 'ลาพักร้อน',
      startDate: '20/10/2568',
      endDate: '22/10/2568',
      totalDays: 3,
      reason: 'เที่ยวกับครอบครัว',
      status: 'pending',
      submittedDate: '13/10/2568',
      documents: []
    },
    {
      id: 4,
      employeeId: 3,
      employeeName: 'วิชัย เก่งมาก',
      leaveType: 'ลากิจ',
      startDate: '13/10/2568',
      endDate: '13/10/2568',
      totalDays: 1,
      reason: 'ไปทำบัตรประชาชน',
      status: 'pending',
      submittedDate: '12/10/2568',
      documents: []
    },
    {
      id: 5,
      employeeId: 5,
      employeeName: 'ประยุทธ์ ทำงานหนัก',
      leaveType: 'ลาป่วย',
      startDate: '14/10/2568',
      endDate: '14/10/2568',
      totalDays: 1,
      reason: 'ปวดท้อง',
      status: 'pending',
      submittedDate: '13/10/2568',
      documents: []
    }
  ]);

  // สถิติทีม
  const getTeamStats = () => {
    const total = teamMembers.length;
    const checkedIn = teamMembers.filter(m => m.status === 'checked_in').length;
    const late = teamMembers.filter(m => m.isLate).length;
    const absent = teamMembers.filter(m => m.status === 'absent').length;
    const notCheckedIn = teamMembers.filter(m => m.status === 'not_checked_in').length;

    return {
      total,
      checkedIn,
      late,
      absent,
      notCheckedIn,
      onTime: checkedIn - late
    };
  };

  // อนุมัติใบลา
  const approveLeave = (leaveId) => {
    setPendingLeaves(prev => 
      prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'approved', approvedDate: new Date().toLocaleDateString('th-TH') }
          : leave
      )
    );
    return true;
  };

  // ไม่อนุมัติใบลา
  const rejectLeave = (leaveId, rejectReason) => {
    setPendingLeaves(prev => 
      prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'rejected', rejectReason, rejectedDate: new Date().toLocaleDateString('th-TH') }
          : leave
      )
    );
    return true;
  };

  // แจ้งเตือนที่ยังไม่อ่าน
  const getUnreadNotifications = () => {
    const lateMembers = teamMembers.filter(m => m.isLate);
    const pendingCount = pendingLeaves.filter(l => l.status === 'pending').length;
    
    return {
      lateCount: lateMembers.length,
      lateMembers,
      pendingLeaveCount: pendingCount,
      totalNotifications: lateMembers.length + pendingCount
    };
  };

  const value = {
    teamMembers,
    pendingLeaves,
    getTeamStats,
    approveLeave,
    rejectLeave,
    getUnreadNotifications
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContext;
