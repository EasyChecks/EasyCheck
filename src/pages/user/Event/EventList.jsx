import React from "react";
import { Link } from "react-router-dom";

function EventList() {
  const events = [
    { id: 1, title: "กิจกรรมปฐมนิเทศนักศึกษาใหม่" },
    { id: 2, title: "อบรมการใช้งานระบบ EasyCheck" },
    { id: 3, title: "การแข่งขันกีฬาเทคโนโลยี" },
  ];

  return (
    <div>
      <Link to="/">go to main</Link>
      <h2>📅 รายการกิจกรรมทั้งหมด</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <Link to={`/event/${event.id}`}>{event.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventList;