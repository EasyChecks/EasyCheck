import React from 'react';
import { useNavigate } from 'react-router-dom';


const LeaveCard = ({ title, description, daysUsed, totalDays, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Card clicked:', title);
    onClick();
  };

  // Calculate percentage
  const percentage = totalDays > 0 ? (daysUsed / totalDays) * 100 : 0;

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div 
      onClick={handleClick}
      className="p-4 sm:p-5 lg:p-6 mb-3 sm:mb-4 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 relative z-10 active:scale-[0.98] border border-white/50"
    >
      <h3 className="font-bold text-gray-800 text-base sm:text-lg lg:text-xl mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4 line-clamp-2">{description}</p>
      
      {/* Days Used Info */}
      <p className="text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2">
        ใช้ไป {daysUsed} วัน จาก {totalDays} วัน
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
        <div 
          className={`${getProgressColor()} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
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