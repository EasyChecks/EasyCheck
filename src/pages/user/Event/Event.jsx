import React from "react";
import { useNavigate } from "react-router-dom";
import { eventsData as EventData } from "../../../data/usersData"; // ย้ายข้อมูลมาจาก usersData แล้ว

export default function Event() {
  const navigate = useNavigate();

  const handleViewDetails = (id) => {
    navigate(`/user/event/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 pb-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">อีเว้นท์</h1>
        <p className="text-gray-600 text-sm mt-1">กิจกรรมและงานที่กำลังจะมาถึง</p>
      </div>

      {/* Event List */}
      <div className=" mt-6 space-y-4">
        {EventData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500">ไม่มีกิจกรรมในขณะนี้</p>
          </div>
        ) : (
          EventData.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Event Header */}
              <div className="bg-white/20 px-6 py-4 border-b border-gray-200 flex items-center space-x-3">
                <h3 className="text-lg font-bold text-black">{event.title}</h3>
              </div>

              {/* Event Body */}
              <div className="p-4 space-y-3">
                <p className="text-gray-700">{event.description}</p>

                {/* Location */}
                <div className="flex items-start space-x-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{event.location}</span>
                </div>

                {/* Time */}
                <div className="flex items-start space-x-2 text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{event.time}</span>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => handleViewDetails(event.id)}
                  className="w-full mt-4 bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}