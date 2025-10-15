import React from 'react';


const LeaveCard = ({ title, description, daysUsed, totalDays }) => (
  <div className="p-4 mb-4 bg-white rounded-lg shadow-md">
    <h3 className="font-bold text-gray-800">{title}</h3>
    <p className="mt-1 text-sm text-gray-600">{description}</p>
    <p className="mt-3 text-xs text-gray-500">
      ใช้ไป {daysUsed} วัน จาก {totalDays} วัน
    </p>
  </div>
);


function LeaveList({ leaveItems }) {
  return (
    <>
      {leaveItems.map((leave, index) => (
        <LeaveCard
          key={index}
          title={leave.title}
          description={leave.description}
          daysUsed={leave.daysUsed}
          totalDays={leave.totalDays}
        />
      ))}
    </>
  );
}

export default LeaveList;