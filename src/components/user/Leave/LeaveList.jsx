import React from 'react';
import { useNavigate } from 'react-router-dom';


const LeaveCard = ({ title, description, daysUsed, totalDays, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Card clicked:', title);
    onClick();
  };

  return (
    <div 
      onClick={handleClick}
      className="p-4 mb-4 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 relative z-10 active:scale-95"
    >
      <h3 className="font-bold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <p className="mt-3 text-xs text-gray-500">
        ใช้ไป {daysUsed} วัน จาก {totalDays} วัน
      </p>
    </div>
  );
};


function LeaveList({ leaveItems }) {
  const navigate = useNavigate();

  const handleLeaveClick = (leave) => {
    // Navigate to list page with leave type
    navigate('/user/leave/list', { state: { leaveType: leave.title } });
  };

  return (
    <>
      {leaveItems.map((leave, index) => (
        <LeaveCard
          key={index}
          title={leave.title}
          description={leave.description}
          daysUsed={leave.daysUsed}
          totalDays={leave.totalDays}
          onClick={() => handleLeaveClick(leave)}
        />
      ))}
    </>
  );
}

export default LeaveList;