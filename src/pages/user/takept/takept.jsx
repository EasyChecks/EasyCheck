import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/useAuth';

function TakePhoto() {
  const navigate = useNavigate()
  const { attendance, checkIn, checkOut } = useAuth()
  const [photo, setPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      })
      .catch((err) => console.error('Error accessing camera:', err));
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/png'));
    stopCamera();
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const goBackToDashboard = () => {
    // กลับไปหน้าหลักโดยไม่บันทึกเวลา
    stopCamera();
    navigate('/user/dashboard');
  };

  const confirmPhoto = () => {
    const currentTime = new Date().toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // ตรวจสอบสถานะและบันทึกเวลา
    if (attendance.status === 'not_checked_in') {
      // เข้างาน
      checkIn(currentTime, photo);
    } else if (attendance.status === 'checked_in') {
      // ออกงาน
      checkOut(currentTime, photo);
    }
    
    // ปิดกล้องและรอให้ state update ก่อน navigate
    stopCamera();
    
    // ใช้ setTimeout เพื่อให้ state update ก่อน
    setTimeout(() => {
      navigate('/user/dashboard');
    }, 100);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white z-40 overflow-y-auto">
      {/* Header with Back Button */}
      <div className="bg-[#48CBFF] text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="relative flex items-center">
          {/* Back Button */}
          <button 
            onClick={goBackToDashboard}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="white">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
          
          {/* Title */}
          <div className="flex-1 text-center pr-12">
            <h1 className="text-xl font-bold font-prompt">ลงเวลาเข้า/ออกงาน</h1>
            <p className="text-xs mt-0.5 opacity-90">ถ่ายรูปเพื่อบันทึกเวลา</p>
          </div>
        </div>
      </div>

      {/* Main Content - ไม่มี max-width และ padding น้อยลง */}
      <div className="px-4 py-4 pb-24">
        {!photo ? (
          <div className="space-y-6">
            {/* Camera Preview */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative aspect-[3/4] bg-gray-900">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 -960 960 960" width="80px" fill="currentColor" className="mx-auto mb-4 opacity-50">
                        <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                      </svg>
                      <p className="text-lg font-prompt">กล้องยังไม่เปิด</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Camera Controls */}
            <div className="flex gap-3 justify-center">
              {!isCameraActive ? (
                <button 
                  onClick={startCamera}
                  className="flex-1 bg-[#48CBFF] text-white py-4 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg hover:bg-[#3AB5E8] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z"/>
                  </svg>
                  เริ่มกล้อง
                </button>
              ) : (
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white border-4 border-[#48CBFF] rounded-full shadow-lg hover:bg-[#48CBFF] hover:border-white transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center group"
                >
                  <div className="w-16 h-16 bg-[#48CBFF] rounded-full group-hover:bg-white transition-all duration-300"></div>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Photo Preview */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative">
                <img 
                  src={photo} 
                  alt="Captured" 
                  className="w-full h-auto rounded-2xl"
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-prompt font-medium shadow-lg">
                  ✓ ถ่ายรูปสำเร็จ
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={retakePhoto}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-prompt font-medium text-lg shadow-md hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"/>
                </svg>
                ถ่ายใหม่
              </button>
              <button 
                onClick={confirmPhoto}
                className="flex-1 bg-[#48CBFF] text-white py-4 px-6 rounded-xl font-prompt font-medium text-lg shadow-lg hover:bg-[#3AB5E8] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                </svg>
                ยืนยัน
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default TakePhoto;