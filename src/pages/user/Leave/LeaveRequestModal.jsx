import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLeave } from '../../../contexts/LeaveContext';
import AlertDialog from '../../../components/common/AlertDialog';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

function LeaveRequestModal({ closeModal }) {
  const { addLeave, addLateArrival, calculateDays, validateLeaveRequest, getLeaveRules } = useLeave();

  // Get today's date in yyyy-mm-dd format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    requestType: 'leave', // 'leave' or 'lateArrival'
    leaveType: '',
    leaveMode: 'fullday', // 'fullday' or 'hourly'
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    documents: []
  });

  // Display dates in dd/mm/yyyy format
  const [displayDates, setDisplayDates] = useState({
    startDate: '',
    endDate: ''
  });

  // Time picker states
  const [showTimeStartPicker, setShowTimeStartPicker] = useState(false);
  const [showTimeEndPicker, setShowTimeEndPicker] = useState(false);
  const timeStartPickerRef = useRef(null);
  const timeEndPickerRef = useRef(null);

  // Dialog states (prefixed with _ to satisfy ESLint)
  const [_showAlert, setShowAlert] = useState(false);
  const [_alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  // Close time pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeStartPickerRef.current && !timeStartPickerRef.current.contains(event.target)) {
        setShowTimeStartPicker(false);
      }
      if (timeEndPickerRef.current && !timeEndPickerRef.current.contains(event.target)) {
        setShowTimeEndPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Convert date format from yyyy-mm-dd to dd/mm/yyyy
  const convertDateFormat = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Convert dd/mm/yyyy to yyyy-mm-dd
  const convertToISOFormat = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return '';
    return convertDateFormat(isoDate);
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

  // Generate hours for 24-hour format (00-23)
  const hours24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Normalize time input (auto-complete)
  const normalizeTime = (input) => {
    if (!input) return '';
    
    // ถ้าพิมเฉพาะตัวเลข 1-2 ตัว (เช่น "9" หรือ "14") ให้เติม :00
    if (/^\d{1,2}$/.test(input)) {
      const hour = parseInt(input);
      if (hour >= 0 && hour <= 23) {
        return `${input.padStart(2, '0')}:00`;
      }
    }
    
    // แปลง am/pm format
    const amPmMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
    if (amPmMatch) {
      let hour = parseInt(amPmMatch[1]);
      const minute = amPmMatch[2] || '00';
      const period = amPmMatch[3].toLowerCase();
      
      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:${minute}`;
    }
    
    // แปลง HH:MM format
    const timeMatch = input.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
    
    return input;
  };

  // Handle time selection from picker
  const handleTimeSelect = (hour, minute, isStart) => {
    const timeValue = `${hour}:${minute}`;
    const todayDate = getTodayDate();
    if (isStart) {
      setFormData({ 
        ...formData, 
        startTime: timeValue,
        startDate: todayDate,
        endDate: todayDate
      });
      setShowTimeStartPicker(false);
    } else {
      setFormData({ 
        ...formData, 
        endTime: timeValue,
        startDate: todayDate,
        endDate: todayDate
      });
      setShowTimeEndPicker(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    
    const invalidFiles = files.filter(file => {
      const isValidType = allowedTypes.includes(file.type);
      const hasValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      return !isValidType && !hasValidExtension;
    });

    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map(f => f.name).join(', ');
      showAlertDialog(
        'error', 
        'ไฟล์ไม่ถูกต้อง', 
        `ไฟล์ต่อไปนี้ไม่รองรับ: ${invalidNames}\n\nรองรับเฉพาะไฟล์ .jpg, .jpeg, .png, .pdf เท่านั้น`
      );
      // Clear the input
      e.target.value = '';
      return;
    }

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

    // Handle late arrival request
    if (formData.requestType === 'lateArrival') {
      // Validate time
      if (!formData.startTime || !formData.endTime) {
        showAlertDialog('error', 'ข้อผิดพลาด', 'กรุณาเลือกเวลาเริ่มต้นและสิ้นสุด');
        return;
      }
      if (formData.endTime <= formData.startTime) {
        showAlertDialog('error', 'ข้อผิดพลาด', 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
        return;
      }
      
      // Validate reason
      if (!formData.reason || !formData.reason.trim()) {
        showAlertDialog('error', 'ข้อผิดพลาด', 'กรุณาระบุเหตุผล');
        return;
      }

      const lateArrivalData = {
        date: convertDateFormat(getTodayDate()),
        startTime: formData.startTime,
        endTime: formData.endTime,
        reason: formData.reason,
        documents: formData.documents
      };

      addLateArrival(lateArrivalData);
      showAlertDialog('success', 'สำเร็จ!', 'ส่งคำขอเข้างานสายเรียบร้อยแล้ว');

      setTimeout(() => {
        closeModal();
      }, 3000);
      return;
    }

    // Handle regular leave request
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

    // Validate against leave rules
    const validation = validateLeaveRequest(leaveData);
    if (!validation.isValid) {
      // Show validation errors
      const errorMessage = validation.errors.join('\n');
      showAlertDialog('error', 'ไม่สามารถส่งคำขอลาได้', errorMessage);
      return;
    }

    addLeave(leaveData);
    showAlertDialog('success', 'สำเร็จ!', 'ส่งคำขอลาเรียบร้อยแล้ว');

    // Close modal after showing success
    setTimeout(() => {
      closeModal();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 overflow-y-auto bg-black/60 backdrop-blur-sm sm:p-4 font-prompt">
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          position: absolute;
          right: 12px;
          z-index: 1;
        }
        input[type="date"] {
          position: relative;
          color: transparent;
        }
        input[type="date"]:focus {
          color: transparent;
        }
        input[type="date"]::-webkit-datetime-edit {
          color: transparent;
        }
        input[type="date"]::-webkit-datetime-edit-fields-wrapper {
          color: transparent;
        }
      `}</style>
      <div className="w-full max-w-xs mt-4 bg-white shadow-2xl rounded-2xl sm:rounded-3xl sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-orange-600 p-4 sm:p-5 lg:p-6 rounded-t-2xl sm:rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white sm:text-xl lg:text-2xl drop-shadow-md">ขอลางาน</h2>
            <button
              onClick={closeModal}
              className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-full transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} id="leave-request-form" className="p-4 sm:p-5 lg:p-6 leave-form-space space-y-3 sm:space-y-4 lg:space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Request Type Selection */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
              ประเภทคำขอ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormData({ 
                  requestType: 'leave', 
                  leaveType: '', 
                  leaveMode: 'fullday',
                  startDate: '',
                  endDate: '',
                  startTime: '', 
                  endTime: '',
                  reason: '',
                  documents: []
                })}
                className={`px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-2 transition-all duration-200 ${formData.requestType === 'leave'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                  }`}
              >
                <svg className="w-4 h-4 inline mr-1 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 16H9v-2h4v2zm3-4H9v-2h7v2z"/>
                </svg>
                ขอลางาน
              </button>
              <button
                type="button"
                onClick={() => setFormData({ 
                  requestType: 'lateArrival',
                  leaveType: 'ขอเข้างานสาย',
                  leaveMode: 'hourly',
                  startDate: getTodayDate(),
                  endDate: getTodayDate(),
                  startTime: '', 
                  endTime: '',
                  reason: '',
                  documents: []
                })}
                className={`px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${formData.requestType === 'lateArrival'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                ขอเข้างานสาย
              </button>
            </div>
          </div>

          {/* Leave Type - Only show for regular leave */}
          {formData.requestType === 'leave' && (
            <div>
              <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                ประเภทการลา <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                required
              >
                <option value="">เลือกประเภทการลา</option>
                <option value="ลาป่วย">ลาป่วย</option>
                <option value="ลากิจ">ลากิจ</option>
                <option value="ลาพักร้อน">ลาพักร้อน</option>
                <option value="ลาคลอด">ลาคลอด</option>
              </select>

              {/* Show leave rules when type is selected */}
              {formData.leaveType && (
                <div className="p-3 mt-3 border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-xl sm:p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="mb-2 text-sm font-semibold text-amber-800 sm:text-base">เงื่อนไขการลา{formData.leaveType}</h4>
                      <ul className="space-y-1.5">
                        {getLeaveRules(formData.leaveType).map((rule, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-amber-900">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show late arrival rules */}
          {formData.requestType === 'lateArrival' && (
            <div className="p-3 border-2 bg-gradient-to-br from-orange-50 to-orange-50 border-orange-200 rounded-xl sm:p-4">
              <div className="flex items-start gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h4 className="mb-2 text-sm font-semibold text-orange-800 sm:text-base">เงื่อนไขการขอเข้างานสาย</h4>
                  <ul className="space-y-1.5">
                    {getLeaveRules('ขอเข้างานสาย').map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-orange-900">
                        <span className="text-brand-primary mt-0.5">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Leave Mode Selection - Only show for regular leave */}
          {formData.requestType === 'leave' && (
            <div>
              <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                รูปแบบการลา <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, leaveMode: 'fullday', startTime: '', endTime: '' })}
                  className={`px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${formData.leaveMode === 'fullday'
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                  ลาเต็มวัน
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, leaveMode: 'hourly', endDate: formData.startDate })}
                  className={`px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${formData.leaveMode === 'hourly'
                      ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500 shadow-lg'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                  ลารายชั่วโมง
                </button>
              </div>
            </div>
          )}

          {/* Date/Time Fields */}
          {/* For Late Arrival - Only show time selection */}
          {formData.requestType === 'lateArrival' ? (
            <div className="space-y-3 sm:space-y-4">
              {/* Date - Display Today in dd/mm/yyyy (Locked) */}
              <div>
                <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                  วันที่ขอเข้างานสาย <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatDateForDisplay(getTodayDate())}
                    readOnly
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                    required
                  />
                  <div className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  การขอเข้างานสายจะถูกล็อคเป็นวันปัจจุบัน
                </p>
              </div>

              {/* Time Range - 24 Hour Format */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                    เวลาที่ต้องมาถึง <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full" ref={timeStartPickerRef}>
                    <input
                      type="text"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      onFocus={() => setShowTimeStartPicker(true)}
                      onBlur={(e) => {
                        const normalized = normalizeTime(e.target.value);
                        if (normalized !== e.target.value) {
                          setFormData({ ...formData, startTime: normalized });
                        }
                        setTimeout(() => setShowTimeStartPicker(false), 200);
                      }}
                      placeholder="เช่น 09:00"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors"
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowTimeStartPicker(!showTimeStartPicker);
                        setShowTimeEndPicker(false);
                      }}
                      className="absolute text-gray-500 transition-colors -translate-y-1/2 right-2 sm:right-3 top-1/2 hover:text-brand-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                        <path d="M12 7v6l4 2" strokeWidth="1.5" />
                      </svg>
                    </button>

                    {/* Custom Time Picker Dropdown */}
                    {showTimeStartPicker && (
                      <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border-2 rounded-lg shadow-2xl border-orange-400 max-h-64">
                        <div className="flex">
                          {/* Hours Column */}
                          <div className="flex-1 border-r border-gray-200">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              ชั่วโมง
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {hours24.map((hour) => (
                                <button
                                  key={hour}
                                  type="button"
                                  onClick={() => {
                                    const currentMinute = formData.startTime?.split(':')[1] || '00';
                                    handleTimeSelect(hour, currentMinute, true);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.startTime?.startsWith(hour) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {hour}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Minutes Column */}
                          <div className="flex-1">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              นาที
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {minutes.map((minute) => (
                                <button
                                  key={minute}
                                  type="button"
                                  onClick={() => {
                                    const currentHour = formData.startTime?.split(':')[0] || '00';
                                    handleTimeSelect(currentHour, minute, true);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.startTime?.endsWith(minute) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {minute}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                    เวลาที่คาดว่าจะมาถึง <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full" ref={timeEndPickerRef}>
                    <input
                      type="text"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      onFocus={() => setShowTimeEndPicker(true)}
                      onBlur={(e) => {
                        const normalized = normalizeTime(e.target.value);
                        if (normalized !== e.target.value) {
                          setFormData({ ...formData, endTime: normalized });
                        }
                        setTimeout(() => setShowTimeEndPicker(false), 200);
                      }}
                      placeholder="เช่น 10:00"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors"
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowTimeEndPicker(!showTimeEndPicker);
                        setShowTimeStartPicker(false);
                      }}
                      className="absolute text-gray-500 transition-colors -translate-y-1/2 right-2 sm:right-3 top-1/2 hover:text-brand-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                        <path d="M12 7v6l4 2" strokeWidth="1.5" />
                      </svg>
                    </button>

                    {/* Custom Time Picker Dropdown */}
                    {showTimeEndPicker && (
                      <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border-2 rounded-lg shadow-2xl border-orange-400 max-h-64">
                        <div className="flex">
                          {/* Hours Column */}
                          <div className="flex-1 border-r border-gray-200">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              ชั่วโมง
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {hours24.map((hour) => (
                                <button
                                  key={hour}
                                  type="button"
                                  onClick={() => {
                                    const currentMinute = formData.endTime?.split(':')[1] || '00';
                                    handleTimeSelect(hour, currentMinute, false);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.endTime?.startsWith(hour) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {hour}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Minutes Column */}
                          <div className="flex-1">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              นาที
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {minutes.map((minute) => (
                                <button
                                  key={minute}
                                  type="button"
                                  onClick={() => {
                                    const currentHour = formData.endTime?.split(':')[0] || '00';
                                    handleTimeSelect(currentHour, minute, false);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.endTime?.endsWith(minute) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {minute}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Regular Leave - Date Range - Full Day Mode */
            formData.leaveMode === 'fullday' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                  วันที่เริ่มต้น <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      setDisplayDates({ ...displayDates, startDate: formatDateForDisplay(e.target.value) });
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    required
                    style={{ colorScheme: 'light' }}
                  />
                  {displayDates.startDate && (
                    <div className="absolute pr-2 text-sm text-gray-700 -translate-y-1/2 bg-white pointer-events-none left-3 top-1/2 sm:text-base">
                      {displayDates.startDate}
                    </div>
                  )}
                </div>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                  วันที่สิ้นสุด <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      setDisplayDates({ ...displayDates, endDate: formatDateForDisplay(e.target.value) });
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                    required
                    style={{ colorScheme: 'light' }}
                  />
                  {displayDates.endDate && (
                    <div className="absolute pr-2 text-sm text-gray-700 -translate-y-1/2 bg-white pointer-events-none left-3 top-1/2 sm:text-base">
                      {displayDates.endDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
            ) : (
              /* Hourly Mode - Date and Time */
              <div className="space-y-3 sm:space-y-4">
              {/* Date - Display Today in dd/mm/yyyy */}
              <div>
                <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                  วันที่ลา <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatDateForDisplay(getTodayDate())}
                    readOnly
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                    required
                  />
                  <div className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <div className="relative w-full" ref={timeStartPickerRef}>
                    <input
                      type="text"
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
                      onFocus={() => setShowTimeStartPicker(true)}
                      onBlur={(e) => {
                        const normalized = normalizeTime(e.target.value);
                        if (normalized !== e.target.value) {
                          const todayDate = getTodayDate();
                          setFormData({
                            ...formData,
                            startTime: normalized,
                            startDate: todayDate,
                            endDate: todayDate
                          });
                        }
                        setTimeout(() => setShowTimeStartPicker(false), 200);
                      }}
                      placeholder="เช่น 09:00"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors"
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowTimeStartPicker(!showTimeStartPicker);
                        setShowTimeEndPicker(false);
                      }}
                      className="absolute text-gray-500 transition-colors -translate-y-1/2 right-2 sm:right-3 top-1/2 hover:text-brand-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                        <path d="M12 7v6l4 2" strokeWidth="1.5" />
                      </svg>
                    </button>

                    {/* Custom Time Picker Dropdown */}
                    {showTimeStartPicker && (
                      <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border-2 rounded-lg shadow-2xl border-orange-400 max-h-64">
                        <div className="flex">
                          {/* Hours Column */}
                          <div className="flex-1 border-r border-gray-200">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              ชั่วโมง
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {hours24.map((hour) => (
                                <button
                                  key={hour}
                                  type="button"
                                  onClick={() => {
                                    const todayDate = getTodayDate();
                                    const currentMinute = formData.startTime?.split(':')[1] || '00';
                                    setFormData({
                                      ...formData,
                                      startTime: `${hour}:${currentMinute}`,
                                      startDate: todayDate,
                                      endDate: todayDate
                                    });
                                    setShowTimeStartPicker(false);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.startTime?.startsWith(hour) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {hour}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Minutes Column */}
                          <div className="flex-1">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              นาที
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {minutes.map((minute) => (
                                <button
                                  key={minute}
                                  type="button"
                                  onClick={() => {
                                    const todayDate = getTodayDate();
                                    const currentHour = formData.startTime?.split(':')[0] || '00';
                                    setFormData({
                                      ...formData,
                                      startTime: `${currentHour}:${minute}`,
                                      startDate: todayDate,
                                      endDate: todayDate
                                    });
                                    setShowTimeStartPicker(false);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.startTime?.endsWith(minute) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {minute}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
                    เวลาสิ้นสุด <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full" ref={timeEndPickerRef}>
                    <input
                      type="text"
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
                      onFocus={() => setShowTimeEndPicker(true)}
                      onBlur={(e) => {
                        const normalized = normalizeTime(e.target.value);
                        if (normalized !== e.target.value) {
                          const todayDate = getTodayDate();
                          setFormData({
                            ...formData,
                            endTime: normalized,
                            startDate: todayDate,
                            endDate: todayDate
                          });
                        }
                        setTimeout(() => setShowTimeEndPicker(false), 200);
                      }}
                      placeholder="เช่น 17:00"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl hover:border-orange-400 focus:border-orange-500 focus:outline-none transition-colors"
                      required
                    />
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowTimeEndPicker(!showTimeEndPicker);
                        setShowTimeStartPicker(false);
                      }}
                      className="absolute text-gray-500 transition-colors -translate-y-1/2 right-2 sm:right-3 top-1/2 hover:text-brand-primary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                        <path d="M12 7v6l4 2" strokeWidth="1.5" />
                      </svg>
                    </button>

                    {/* Custom Time Picker Dropdown */}
                    {showTimeEndPicker && (
                      <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border-2 rounded-lg shadow-2xl border-orange-400 max-h-64">
                        <div className="flex">
                          {/* Hours Column */}
                          <div className="flex-1 border-r border-gray-200">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              ชั่วโมง
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {hours24.map((hour) => (
                                <button
                                  key={hour}
                                  type="button"
                                  onClick={() => {
                                    const todayDate = getTodayDate();
                                    const currentMinute = formData.endTime?.split(':')[1] || '00';
                                    setFormData({
                                      ...formData,
                                      endTime: `${hour}:${currentMinute}`,
                                      startDate: todayDate,
                                      endDate: todayDate
                                    });
                                    setShowTimeEndPicker(false);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.endTime?.startsWith(hour) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {hour}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Minutes Column */}
                          <div className="flex-1">
                            <div className="py-2 text-xs font-semibold text-center text-white bg-brand-primary sm:text-sm">
                              นาที
                            </div>
                            <div className="overflow-y-auto max-h-56">
                              {minutes.map((minute) => (
                                <button
                                  key={minute}
                                  type="button"
                                  onClick={() => {
                                    const todayDate = getTodayDate();
                                    const currentHour = formData.endTime?.split(':')[0] || '00';
                                    setFormData({
                                      ...formData,
                                      endTime: `${currentHour}:${minute}`,
                                      startDate: todayDate,
                                      endDate: todayDate
                                    });
                                    setShowTimeEndPicker(false);
                                  }}
                                  className={`w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-center hover:bg-orange-50 transition-colors ${
                                    formData.endTime?.endsWith(minute) ? 'bg-orange-100 font-semibold text-brand-primary' : ''
                                  }`}
                                >
                                  {minute}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            )
          )}

          {/* Total Days/Hours Display */}
          {formData.requestType === 'leave' && formData.leaveMode === 'fullday' && formData.startDate && formData.endDate && (
            <div className="p-3 border-2 bg-gradient-to-r from-orange-50 to-orange-50 border-orange-200 rounded-xl sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 sm:text-base">จำนวนวันที่ลา:</span>
                <span className="text-lg font-bold text-brand-primary sm:text-xl">{getTotalDays()} วัน</span>
              </div>
            </div>
          )}

          {formData.requestType === 'lateArrival' && formData.startTime && formData.endTime && (
            <div className="p-3 border-2 bg-gradient-to-r from-orange-50 to-orange-50 border-orange-200 rounded-xl sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 sm:text-base">ระยะเวลาที่สาย:</span>
                <span className="text-lg font-bold text-brand-primary sm:text-xl">{getTotalHours()}</span>
              </div>
            </div>
          )}

          {formData.requestType === 'leave' && formData.leaveMode === 'hourly' && formData.startTime && formData.endTime && (
            <div className="p-3 border-2 bg-gradient-to-r from-orange-50 to-orange-50 border-orange-200 rounded-xl sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 sm:text-base">จำนวนชั่วโมงที่ลา:</span>
                <span className="text-lg font-bold text-brand-primary sm:text-xl">{getTotalHours()}</span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
              {formData.requestType === 'lateArrival' ? 'เหตุผลที่เข้างานสาย' : 'เหตุผลในการลา'} <span className="text-red-500">*</span>
              {formData.requestType === 'lateArrival' && (
                <span className="ml-1 text-xs text-brand-primary">(ต้องเป็นเหตุสุดวิสัย)</span>
              )}
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={formData.requestType === 'lateArrival' ? 4 : 3}
              placeholder={formData.requestType === 'lateArrival' 
                ? "กรุณาระบุเหตุผล เช่น รถเสีย อุบัติเหตุ เจอเหตุฉุกเฉินในระหว่างทาง ฯลฯ" 
                : "กรุณาระบุเหตุผลในการลา..."}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-gray-700 font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">
              เอกสารแนบ 
              {formData.requestType === 'leave' && formData.leaveType === 'ลาป่วย' && formData.leaveMode === 'fullday' && getTotalDays() >= 3 && (
                <span className="text-red-500"> * (จำเป็นสำหรับลาป่วย 3 วันขึ้นไป)</span>
              )}
              {formData.requestType === 'lateArrival' && (
                <span className="ml-1 text-xs text-brand-primary">(แนะนำให้แนบหลักฐานประกอบ)</span>
              )}
            </label>

            {/* Warning for sick leave 3+ days */}
            {formData.requestType === 'leave' && formData.leaveType === 'ลาป่วย' && formData.leaveMode === 'fullday' && getTotalDays() >= 3 && (
              <div className="p-2 mb-2 border-2 border-red-200 rounded-lg bg-red-50 sm:p-3">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-xs font-medium text-red-800 sm:text-sm">
                    การลาป่วยตั้งแต่ 3 วันขึ้นไป จำเป็นต้องแนบใบรับรองแพทย์
                  </p>
                </div>
              </div>
            )}

            {/* Info for late arrival */}
            {formData.requestType === 'lateArrival' && (
              <div className="p-2 mb-2 border-2 rounded-lg bg-orange-50 border-orange-200 sm:p-3">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs font-medium sm:text-sm text-orange-800">
                    การแนบรูปภาพหลักฐาน (เช่น รูปถ่ายเหตุการณ์, ใบรับรองจากหน่วยงานที่เกี่ยวข้อง) จะช่วยในการพิจารณาอนุมัติ
                  </p>
                </div>
              </div>
            )}

            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={handleFileChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 file:cursor-pointer file:font-medium"
            />
            <p className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              รองรับเฉพาะไฟล์ .jpg, .jpeg, .png, .pdf เท่านั้น
            </p>
            {formData.documents.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600 sm:text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3 sm:pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-brand-primary to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              ส่งคำขอ
            </button>
          </div>
        </form>
      </div>

      {/* Alert Dialog for success/error messages */}
      <AlertDialog
        isOpen={_showAlert}
        type={_alertConfig.type}
        title={_alertConfig.title}
        message={_alertConfig.message}
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
}

export default LeaveRequestModal;