import React from "react";
import { Routes, Route } from "react-router-dom";
import Event from "./Event";
import EventDetails from "./EventDetails";

// ✅ Router สำหรับส่วน Event ของ SaBo4K (ไม่ซ้อน BrowserRouter)
export default function EventRouter() {
  return (
    <Routes>
      <Route path="/" element={<Event />} />          {/* /event */}
      <Route path=":id" element={<EventDetails />} /> {/* /event/1 */}
    </Routes>
  );
}