import React from "react";
import { useNavigate } from "react-router-dom";
import eventList from "./EventData";

export default function Event() {
  const navigate = useNavigate();

  const statusColor = (status) => {
    switch (status) {
      case "ยังไม่เข้าร่วม":
        return "bg-gray-600";
      case "เข้าร่วมแล้ว":
        return "bg-green-800";
      case "ไม่ได้เข้าร่วม":
        return "bg-red-800";
      case "ลา":
        return "bg-yellow-500";
      case "ยกเลิกแล้ว":
        return "bg-gray-400";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-blue-400 px-6 py-8">
      <h1 className="text-3xl font-semibold text-white mb-6">อีเวนต์</h1>

      <div className="space-y-4">
        {eventList.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/event/${event.id}`)}
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {event.title}
            </h2>
            <p className="text-sm text-gray-500">ดูรายละเอียดงาน</p>
            <span
              className={`inline-block text-white text-sm px-3 py-1 rounded-md mt-2 ${statusColor(
                event.status
              )}`}
            >
              {event.status}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full mt-8 bg-black text-white py-3 rounded-xl text-base flex justify-center items-center gap-2">
        <span>📅 เดือนกันยายน 2025</span>
      </button>
    </div>
  );
}