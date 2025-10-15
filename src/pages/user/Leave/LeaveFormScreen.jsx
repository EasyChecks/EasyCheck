import React from 'react';
import LeaveForm from '../../../components/common/Leave/LeaveForm';


function LeaveFormScreen({ closeModal }) {
  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      
      
      <LeaveForm closeModal={closeModal} />

    </div>
  );
}

export default LeaveFormScreen;