import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../../contexts/EventContext';
import { useAuth } from '../../../contexts/useAuth';

export default function EventList() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ดึงข้อมูล user เพื่อกรองกิจกรรม
  
  // Try-catch for useEvents
  let events = [];
  try {
    const context = useEvents();
    // 🔥 ใช้ getFilteredEvents แทน events โดยตรง
    events = context?.getFilteredEvents(user) || [];
  } catch (error) {
    console.error('EventContext error:', error);
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center text-red-500 py-12">
          เกิดข้อผิดพลาดในการโหลดข้อมูลกิจกรรม
        </div>
      </div>
    );
  }

  const handleEventClick = (eventId) => {
    navigate(`/user/event/${eventId}`);
  };

  // ป้องกัน events เป็น undefined
  if (!events) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center text-gray-500 py-12">
          กำลังโหลด...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">กิจกรรมทั้งหมด</h1>
      
      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          ไม่มีกิจกรรมในขณะนี้
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {event.name}
              </h2>
              <p className="text-gray-600 mb-2">{event.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📅 {event.startDate || event.date}</span>
                <span>📍 {event.locationName || event.location || 'ไม่ระบุสถานที่'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
