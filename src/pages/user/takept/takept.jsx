import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/useAuth';

function TakePhoto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { attendance, checkIn, checkOut } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isEarlyCheckout, setIsEarlyCheckout] = useState(false);
  const [scheduleTimes, setScheduleTimes] = useState({ start: null, end: null });
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [popupInfoMessage, setPopupInfoMessage] = useState('');

  const schedule = location.state?.schedule || { time: '09:00 - 18:00' };

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const [startTimeStr, endTimeStr] = schedule.time.split(' - ');
    const now = new Date();
    const startTime = new Date(now);
    const [startHour, startMinute] = startTimeStr.split(':');
    startTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(now);
    const [endHour, endMinute] = endTimeStr.split(':');
    endTime.setHours(endHour, endMinute, 0, 0);
    setScheduleTimes({ start: startTime, end: endTime });

    if (attendance.status === 'checked_in' && now < endTime) {
      setIsEarlyCheckout(true);
    }
  }, [schedule.time, attendance.status]);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      })
      .catch((err) => console.error('Error accessing camera:', err));
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhoto(canvas.toDataURL('image/png'));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const goBackToDashboard = () => {
    stopCamera();
    navigate('/user/dashboard');
  };

  const confirmPhoto = () => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    if (attendance.status === 'not_checked_in') {
      const status = (scheduleTimes.start && now > scheduleTimes.start) ? 'late' : 'on_time';
      checkIn(currentTime, photo, status);
      setPopupMessage(status === 'late' ? `เข้างานสาย เวลา ${currentTime} น.` : `เข้างานเวลา ${currentTime} น.`);
    } else if (attendance.status === 'checked_in') {
      if (isEarlyCheckout) {
        setPopupInfoMessage(`ไม่สามารถออกงานก่อนเวลา ${schedule.time.split(' - ')[1]} น.`);
        setShowInfoPopup(true);
        return;
      }
      checkOut(currentTime, photo);
      setPopupMessage(`ออกงานเวลา ${currentTime} น.`);
    }
    
    stopCamera();
    setShowSuccessPopup(true);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-gradient-to-b from-orange-50 to-white">
      <div className="bg-brand-primary text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="relative flex items-center justify-center h-full">
          <button onClick={goBackToDashboard} className="absolute p-2 transition-colors rounded-lg left-4 hover:bg-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold font-prompt">ลงเวลาเข้า/ออกงาน</h1>
            <p className="text-xs mt-0.5 opacity-90">ถ่ายรูปเพื่อบันทึกเวลา</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 pb-24">
        {!photo ? (
          <div className="space-y-6">
            <div className="overflow-hidden bg-white shadow-xl rounded-2xl">
              <div className="relative aspect-[3/4] bg-gray-900">
                <video ref={videoRef} className="object-cover w-full h-full" playsInline autoPlay muted />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="http://www.w3.org/2000/svg" width="80px" fill="currentColor" className="mx-auto mb-4 opacity-50">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                      </svg>
                      <p className="text-lg font-prompt">กล้องยังไม่เปิด</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-3">
              {!isCameraActive ? (
                <button onClick={startCamera} className="flex-1 bg-brand-primary text-white py-4 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="http://www.w3.org/2000/svg" width="24px" fill="currentColor"><path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/></svg>
                  เริ่มกล้อง
                </button>
              ) : (
                <button onClick={capturePhoto} className="w-20 h-20 bg-white border-4 border-brand-primary rounded-full shadow-lg hover:bg-brand-primary hover:border-white transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center group">
                  <div className="w-16 h-16 bg-brand-primary rounded-full group-hover:bg-white transition-all duration-300"></div>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <img src={photo} alt="Captured" className="w-full h-auto overflow-hidden bg-white shadow-xl rounded-2xl" />
            <div className="flex gap-3">
              <button onClick={retakePhoto} className="flex items-center justify-center flex-1 gap-2 px-6 py-4 text-lg font-medium text-gray-700 transition-all duration-300 transform bg-gray-100 border border-gray-300 shadow-md rounded-xl font-prompt hover:bg-gray-200 hover:scale-105 active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="http://www.w3.org/2000/svg" width="24px" fill="currentColor"><path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"/></svg>
                ถ่ายใหม่
              </button>
              <button onClick={confirmPhoto} disabled={isEarlyCheckout} className={`flex-1 text-white py-4 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg transition-all duration-300 transform flex items-center justify-center gap-2 ${isEarlyCheckout ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-primary hover:bg-orange-600 active:scale-95 hover:scale-105'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="http://www.w3.org/2000/svg" width="24px" fill="currentColor"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                ยืนยัน
              </button>
            </div>
            {isEarlyCheckout && (<p className="mt-4 font-medium text-center text-red-600 font-prompt">ไม่สามารถออกงานก่อนเวลา {schedule.time.split(' - ')[1]} น.</p>)}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-8 text-center bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
              {/* === ICON REPLACEMENT === */}
              <svg className="w-12 h-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">บันทึกสำเร็จ!</h2>
            <p className="mb-8 text-gray-600">{popupMessage}</p>
            <button onClick={() => navigate('/user/dashboard')} className="w-full bg-brand-primary text-white py-3 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95">
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      )}

      {showInfoPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-8 text-center bg-white shadow-2xl rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="http://www.w3.org/2000/svg" width="48px" fill="#EF4444"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0-17.65-2.5-34.5T870-546l-78-234q-11-33-40.5-54.5T680-856H280q-35 0-64.5 21.5T175-780l-78 234q-7.5 22-10 38.5T80-480q0 83 31.5 156T197-197q54 54 127 85.5T480-80Zm-40-280h80v-80h-80v80Zm0-160h80v-80h-80v80Z"/></svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">ไม่สามารถทำรายการได้</h2>
            <p className="mb-8 text-gray-600">{popupInfoMessage}</p>
            <button onClick={() => setShowInfoPopup(false)} className="w-full px-6 py-3 text-lg font-medium text-white transition-all duration-300 bg-gray-500 shadow-lg rounded-xl font-prompt hover:bg-gray-600">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TakePhoto;