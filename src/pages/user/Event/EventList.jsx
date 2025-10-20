import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "../../../contexts/EventContext";
import { useAuth } from "../../../contexts/useAuth";

const EventCard = React.memo(({ event }) => (
  <Link to={`/user/event/${event.id}`} className="block">
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden group">
      <div className="bg-gradient-to-r from-[#48CBFF] to-[#3AB4E8] p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
            <p className="text-blue-100 text-sm">{event.date}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-semibold ${event.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {event.status === 'ongoing' ? 'เริ่มงานแล้ว' : 'เสร็จสิ้น'}
          </div>
        </div>
        <p className="text-white/90 text-sm mb-4">{event.description}</p>
      </div>

      <div className="p-6 bg-gray-50">
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-500 mb-1">สถานที่</h4>
            <p className="text-gray-800 font-medium">{event.locationName}</p>
            <p className="text-xs text-gray-500 mt-1"> {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</p>
            <p className="text-xs text-gray-500"> รัศมี {event.radius} เมตร</p>
          </div>
        </div>

        {event.startTime && event.endTime && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-500 mb-1">เวลา</h4>
              <p className="text-gray-800 font-medium">{event.startTime} - {event.endTime} น.</p>
            </div>
          </div>
        )}

        {event.teams && event.teams.length > 0 && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">ทีมที่เข้าร่วม</h4>
              <div className="flex flex-wrap gap-2">
                {event.teams.map((team, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">{team}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
          <span>ดูรายละเอียดเพิ่มเติม</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </Link>
));

EventCard.displayName = 'EventCard';

function EventList() {
  const { getEventsForUser } = useEvents();
  const { user } = useAuth();

  // Get user's department and position
  const userDepartment = user?.department || '';
  const userPosition = user?.position || '';

  // Get filtered events for this user
  const userEvents = useMemo(() => {
    return getEventsForUser(userDepartment, userPosition);
  }, [getEventsForUser, userDepartment, userPosition]);

  // Sort events (ongoing first)
  const sortedEvents = useMemo(() => {
    return [...userEvents].sort((a, b) => {
      if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
      if (a.status !== 'ongoing' && b.status === 'ongoing') return 1;
      return 0;
    });
  }, [userEvents]);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">รายการกิจกรรม</h1>
          <p className="text-gray-600">กิจกรรมและอีเวนท์ที่เกี่ยวข้องกับแผนก {userDepartment} {userPosition && `- ${userPosition}`}</p>
          {sortedEvents.length > 0 && (
            <div className="mt-3 text-sm text-gray-500">
              พบ {sortedEvents.length} กิจกรรม
            </div>
          )}
        </div>

        {sortedEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่มีกิจกรรมสำหรับคุณ</h3>
            <p className="text-gray-500">ไม่มีกิจกรรมที่เกี่ยวข้องกับแผนก {userDepartment} {userPosition && `(${userPosition})`} ในขณะนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
