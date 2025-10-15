import React, { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import LeaveFormScreen from './LeaveFormScreen';
import Nav from '../../../components/user/nav/Nav';
import LeaveList from '../../../components/common/Leave/LeaveList';


const userLeaveData = [
  { title: 'ลาป่วย', description: 'ต้องยื่นใบลาในจากวันที่ลา...', daysUsed: 0, totalDays: 100 },
  { title: 'ลากิจ', description: 'ต้องลาล่วงหน้าไม่น้อยกว่า 3 วัน...', daysUsed: 0, totalDays: 5 },
    { title: 'ลาพักร้อน', description: 'สามารถลาพักร้อนได้ปีละ 6 วัน...', daysUsed: 0, totalDays: 6 },
    { title: 'ลาคลอด', description: 'สำหรับพนักงานหญิงที่มีบุตร...', daysUsed: 0, totalDays: 90 },
];

function LeaveScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans bg-sky-500">
      <header className="p-4 text-center">
        <h1 className="text-xl font-bold text-white">การลา</h1>
      </header>

      <main className="px-4 pb-24">
        <LeaveList leaveItems={userLeaveData} />
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed flex items-center px-4 py-2 bg-white rounded-full shadow-lg bottom-24 right-6"
      >
        <IoAdd className="mr-1 text-blue-600" />
        <span className="text-sm font-semibold text-blue-600">ขอลางาน</span>
      </button>

      <Nav />
      
      {isModalOpen && <LeaveFormScreen closeModal={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default LeaveScreen;