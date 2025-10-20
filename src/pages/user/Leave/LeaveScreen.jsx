import React, { useState } from 'react';
import LeaveForm from './LeaveForm';
import Nav from '../../../components/user/nav/Nav';
import LeaveList from '../../../components/user/Leave/LeaveList';
import { useLeave } from '../../../contexts/LeaveContext';

function LeaveScreen() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getLeaveSummary } = useLeave();
  
  // Get dynamic leave data from context
  const userLeaveData = getLeaveSummary();

  return (
    <div className="space-y-6 pb-6">
      {/* Floating Header Card */}
      <div class="bg-white rounded-2xl shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800">การลา</h1>
        <p class="text-gray-600 mt-1">ดูสิทธิ์การลา</p>
      </div>

      <main className="sm:pt-5 lg:pt-6 pb-28 sm:pb-32 relative z-0 sm:px-4 lg:px-6">
        <LeaveList leaveItems={userLeaveData} />
      </main>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 bg-white rounded-full shadow-2xl bottom-24 sm:bottom-28 lg:bottom-32 right-4 sm:right-6 z-50 hover:scale-105 sm:hover:scale-110 hover:shadow-cyan-200 transition-all duration-300 group"
      >
        <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full group-hover:rotate-90 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm lg:text-base font-semibold text-cyan-600">ขอลา</span>
      </button>

      <Nav />
      
      {isModalOpen && <LeaveForm closeModal={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default LeaveScreen;