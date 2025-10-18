import React, { useState } from 'react';
import { useLeave } from '../../../contexts/LeaveContext';
import AlertDialog from '../../../components/common/AlertDialog';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

function LeaveForm({ closeModal }) {
  const { addLeave, calculateDays } = useLeave();

  // Get today's date in yyyy-mm-dd format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    leaveType: '',
    leaveMode: 'fullday', // 'fullday' or 'hourly'
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    documents: []
  });

  // Dialog states (prefixed with _ to satisfy ESLint)
  const [_showAlert, setShowAlert] = useState(false);
  const [_alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    message: ''
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

  // Calculate total hours
  const getTotalHours = () => {
    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const diffMinutes = endMinutes - startMinutes;

      if (diffMinutes <= 0) return 0;

      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      return minutes > 0 ? `${hours} ชม. ${minutes} นาที` : `${hours} ชั่วโมง`;
    }
    return 0;
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map(file => file.name);
    setFormData({ ...formData, documents: fileNames });
  };

  // Show alert dialog
  const showAlertDialog = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setShowAlert(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate based on leave mode
    if (formData.leaveMode === 'fullday') {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        showAlertDialog('error', 'ข้อผิดพลาด', 'วันที่สิ้นสุดต้องมากกว่าหรือเท่ากับวันที่เริ่มต้น');
        return;
      }
    } else {
      // Hourly validation
      if (!formData.startDate) {
        showAlertDialog('error', 'ข้อผิดพลาด', 'กรุณาเลือกวันที่ลา');
        return;
      }
      if (!formData.startTime || !formData.endTime) {
        showAlertDialog('error', 'ข้อผิดพลาด', 'กรุณาเลือกเวลาเริ่มต้นและสิ้นสุด');
        return;
      }
      if (formData.endTime <= formData.startTime) {
        showAlertDialog('error', 'ข้อผิดพลาด', 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
        return;
      }
    }

    // Prepare leave data
    let leaveData;

    if (formData.leaveMode === 'fullday') {
      leaveData = {
        leaveType: formData.leaveType,
        startDate: convertDateFormat(formData.startDate),
        endDate: convertDateFormat(formData.endDate),
        reason: formData.reason,
        documents: formData.documents,
        leaveMode: 'fullday'
      };
    } else {
      // Hourly leave
      leaveData = {
        leaveType: formData.leaveType,
        startDate: convertDateFormat(formData.startDate),
        endDate: convertDateFormat(formData.startDate), // Same day for hourly
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        documents: formData.documents,
        leaveMode: 'hourly'
      };
    }

    addLeave(leaveData);
    showAlertDialog('success', 'สำเร็จ!', 'ส่งคำขอลาเรียบร้อยแล้ว');

    // Close modal after showing success
    setTimeout(() => {
      closeModal();
    }, 2000);
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
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
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

          {/* Leave Mode Selection */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
              ประเภทการลา <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, leaveMode: 'fullday', startTime: '', endTime: '' })}
                className={`px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-2 transition-all duration-200 ${formData.leaveMode === 'fullday'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-500 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-400'
                  }`}
              >
                🗓️ ลาเต็มวัน
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, leaveMode: 'hourly', endDate: formData.startDate })}
                className={`px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-2 transition-all duration-200 ${formData.leaveMode === 'hourly'
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-cyan-500 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-400'
                  }`}
              >
                ⏰ ลารายชั่วโมง
              </button>
            </div>
          </div>

          {/* Date Range - Full Day Mode */}
          {formData.leaveMode === 'fullday' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                  วันที่เริ่มต้น <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
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
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          ) : (
            /* Hourly Mode - Date and Time */
            <div className="space-y-3 sm:space-y-4">
              {/* Date - Locked to Today */}
              <div>
                <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                  วันที่ลา <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={getTodayDate()}
                    readOnly
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  การลารายชั่วโมงจะถูกล็อคเป็นวันปัจจุบัน
                </p>
              </div>

              {/* Time Range - 24 Hour Format */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                    เวลาเริ่มต้น <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => {
                        const todayDate = getTodayDate();
                        setFormData({
                          ...formData,
                          startTime: e.target.value,
                          startDate: todayDate,
                          endDate: todayDate
                        });
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                      step="900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                    เวลาสิ้นสุด <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => {
                        const todayDate = getTodayDate();
                        setFormData({
                          ...formData,
                          endTime: e.target.value,
                          startDate: todayDate,
                          endDate: todayDate
                        });
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors"
                      step="900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total Days/Hours Display */}
          {formData.leaveMode === 'fullday' && formData.startDate && formData.endDate && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold text-sm sm:text-base">จำนวนวันที่ลา:</span>
                <span className="text-cyan-600 font-bold text-lg sm:text-xl">{getTotalDays()} วัน</span>
              </div>
            </div>
          )}

          {formData.leaveMode === 'hourly' && formData.startTime && formData.endTime && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-semibold text-sm sm:text-base">จำนวนชั่วโมงที่ลา:</span>
                <span className="text-purple-600 font-bold text-lg sm:text-xl">{getTotalHours()}</span>
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
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
              onChange={handleFileChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition-colors file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 file:cursor-pointer file:font-medium"
            />
            {formData.documents.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            )}
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