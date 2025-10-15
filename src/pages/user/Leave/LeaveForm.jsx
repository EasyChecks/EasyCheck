import React, { useState } from 'react';
import { useLeave } from '../../../contexts/LeaveContext';

function LeaveForm({ closeModal }) {
  const { addLeave, calculateDays } = useLeave();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    documents: []
  });

  // Convert date format from yyyy-mm-dd to dd/mm/yyyy
  const convertDateFormat = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Calculate total days
  const getTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      const startFormatted = convertDateFormat(formData.startDate);
      const endFormatted = convertDateFormat(formData.endDate);
      return calculateDays(startFormatted, endFormatted);
    }
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate dates
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น');
      return;
    }

    // Convert dates and add leave
    const leaveData = {
      ...formData,
      startDate: convertDateFormat(formData.startDate),
      endDate: convertDateFormat(formData.endDate)
    };

    addLeave(leaveData);
    alert('ส่งคำขอลาเรียบร้อยแล้ว');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 font-prompt overflow-y-auto">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
        input[type="date"] {
          position: relative;
        }
      `}</style>
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-4 sm:p-5 lg:p-6 rounded-t-2xl sm:rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-md">ขอลางาน</h2>
            <button 
              onClick={closeModal}
              className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Leave Type */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
              ประเภทการลา <span className="text-red-500">*</span>
            </label>
            <select 
              value={formData.leaveType}
              onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
              required
            >
              <option value="">เลือกประเภทการลา</option>
              <option value="ลาป่วย">ลาป่วย</option>
              <option value="ลากิจ">ลากิจ</option>
              <option value="ลาพักร้อน">ลาพักร้อน</option>
              <option value="ลาคลอด">ลาคลอด</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                วันที่เริ่มต้น <span className="text-red-500">*</span>
              </label>
              <input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="วว/ดด/ปปปป"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                วันที่สิ้นสุด <span className="text-red-500">*</span>
              </label>
              <input 
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="วว/ดด/ปปปป"
                required
              />
            </div>
          </div>

          {/* Total Days Display */}
          {formData.startDate && formData.endDate && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold text-sm sm:text-base">จำนวนวันที่ลา:</span>
                <span className="text-cyan-600 font-bold text-lg sm:text-xl">{getTotalDays()} วัน</span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
              เหตุผลในการลา <span className="text-red-500">*</span>
            </label>
            <textarea 
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              rows={3}
              placeholder="กรุณาระบุเหตุผลในการลา..."
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
              เอกสารแนบ (ถ้ามี)
            </label>
            <input 
              type="file"
              multiple
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 file:cursor-pointer file:font-medium"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              ส่งคำขอ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveForm;