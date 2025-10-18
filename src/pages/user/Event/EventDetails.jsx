import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventsData as EventData } from "../../../data/usersData"; // ย้ายข้อมูลมาจาก usersData แล้ว

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);

  const event = EventData.find((e) => e.id === parseInt(id));

  const handleJoinEvent = () => {
    setIsJoined(true);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูลอีเว้นท์</h3>
          <p className="text-gray-600 mb-6">ไม่สามารถค้นหากิจกรรมที่คุณต้องการได้</p>
          <button
            onClick={() => navigate("/user/event")}
            className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>กลับไปหน้าอีเว้นท์</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => navigate("/user/event")}
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">กลับ</span>
        </button>
      </div>

      {/* Event Header */}
      <div className="bg-white text-gray-800 px-6 py-8 rounded-3xl shadow-lg mx-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
              Event ID: #{event.id}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Description Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">รายละเอียด</h3>
                <p className="text-gray-800 leading-relaxed">{event.description}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">สถานที่</h3>
                <p className="text-gray-800 font-medium">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Time Section */}
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">เวลา</h3>
                <p className="text-gray-800 font-medium">{event.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button 
            onClick={handleJoinEvent}
            disabled={isJoined}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 ${
              isJoined 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
            }`}
          >
            {isJoined ? '✓ เข้าร่วมแล้ว' : 'เข้าร่วมกิจกรรม'}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-4 mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800 text-center">
          💡 <span className="font-medium">เคล็ดลับ:</span> อย่าลืมเช็คอินเมื่อถึงสถานที่จัดกิจกรรม
        </p>
      </div>
    </div>
  );
}
