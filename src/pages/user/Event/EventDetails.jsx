import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEvents } from "../../../contexts/EventContext";
import { useAuth } from '../../../contexts/useAuth';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, canJoinEvent, getTimeRemainingToJoin } = useEvents();
  const { attendance } = useAuth()
  const [timeRemaining, setTimeRemaining] = React.useState(null);

  const event = events.find((e) => e.id === parseInt(id));

  // Update time remaining every minute (only if event exists)
  useEffect(() => {
    if (!event) return
    const updateTimeRemaining = () => {
      const remaining = getTimeRemainingToJoin(event);
      setTimeRemaining(remaining);
    }
    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000)
    return () => clearInterval(interval)
  }, [event, getTimeRemainingToJoin])

  // Helper function to format time display
  const formatTimeRemaining = (timeObj) => {
    if (!timeObj) return null;
    
    if (timeObj.hours === 0 && timeObj.minutes === 0) {
      return "หมดเวลาแล้ว";
    }
    
    if (timeObj.hours === 0) {
      return `${timeObj.minutes} นาที`;
    }
    
    return `${timeObj.hours} ชั่วโมง ${timeObj.minutes} นาที`;
  };

  const handleJoinEvent = () => {
    if (canJoinEvent(event)) {
      // Event 'join' action — UI-only here (attendance handled by checkIn)
      // If you want joining to also call checkIn, call `checkIn` from useAuth here.
    }
  };

  const canUserJoin = event ? canJoinEvent(event) : false;
  const isJoined = attendance?.status === 'checked_in'

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
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-8 rounded-3xl shadow-lg mx-4 relative">
        {/* Top-right: ตาราง label */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/20 text-white px-3 py-1.5 rounded-full text-sm border border-white/30 shadow-sm backdrop-blur-sm font-medium">
            ตาราง
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 pr-24">
            <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
            <p className="text-blue-100 text-sm mb-2">{event.date}</p>
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
                <p className="text-gray-800 font-medium mb-2">{event.locationName}</p>
                <p className="text-sm text-gray-600">
                  พิกัด: {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                </p>
                <p className="text-sm text-gray-600">
                  รัศมี: {event.radius} เมตร
                </p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">แผนที่สถานที่</h3>
            <div className="relative h-[400px] rounded-xl overflow-hidden border-2 border-gray-200 z-10">
              <MapContainer
                center={[event.latitude, event.longitude]}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[event.latitude, event.longitude]} />
                <Circle
                  center={[event.latitude, event.longitude]}
                  radius={event.radius}
                  pathOptions={{ 
                    color: event.status === 'ongoing' ? '#22C55E' : '#6B7280',
                    fillColor: event.status === 'ongoing' ? '#22C55E' : '#6B7280',
                    fillOpacity: 0.2 
                  }}
                />
              </MapContainer>
            </div>
          </div>

          {/* Time Section */}
          {event.startTime && event.endTime && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">เวลา</h3>
                  <p className="text-gray-800 font-medium">{event.startTime} - {event.endTime} น.</p>
                </div>
              </div>
            </div>
          )}

          {/* Teams Section */}
          {event.teams && event.teams.length > 0 && (
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">ทีมที่เข้าร่วม</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.teams.map((team, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action area removed as requested (time banners and join button) */}
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
