import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import eventList from "./EventData";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);

  const event = eventList.find((item) => item.id === parseInt(id));

  const handleJoin = () => {
    setJoined(true);
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        ไม่พบข้อมูลอีเวนต์
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 text-lg font-medium mb-4"
      >
        ← กลับ
      </button>

      <h1 className="text-3xl font-semibold text-gray-800 mb-6">อีเวนต์</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
          <p className="text-gray-500 text-base">{event.person}</p>
        </div>

        <div>
          <p className="text-gray-500 text-base">สถานที่</p>
          <p className="text-gray-700 text-base">{event.location}</p>
        </div>

        <div>
          <p className="text-gray-500 text-base">สถานะ</p>
          <span
            className={`inline-block text-white px-3 py-1 rounded-md text-sm ${
              joined ? "bg-green-800" : "bg-gray-600"
            }`}
          >
            {joined ? "เข้าร่วมแล้ว" : event.status}
          </span>
        </div>

        <div>
          <p className="text-gray-500 text-base">ช่วงเวลา</p>
          <p className="text-gray-700 text-base">
            {event.dateStart} → {event.dateEnd}
          </p>
          <p className="text-gray-700 text-base">เวลา {event.time}</p>
        </div>

        <div>
          <p className="text-gray-500 text-base">รายละเอียดงาน</p>
          <p className="text-gray-700 text-base">{event.description}</p>
        </div>
      </div>

      <button
        onClick={handleJoin}
        disabled={joined}
        className={`w-full mt-8 py-3 rounded-xl text-white text-base font-medium ${
          joined
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {joined ? "เข้าร่วมแล้ว" : "เข้าร่วม"}
      </button>
    </div>
  );
}