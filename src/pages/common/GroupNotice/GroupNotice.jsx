import React from "react";

function GroupNotice() {
  const notices = [
    { id: 1, text: "📢 ประกาศจากฝ่ายวิชาการ: เลื่อนเวลาเรียนวันจันทร์" },
    { id: 2, text: "📢 ฝ่ายกิจการนักศึกษา: เชิญเข้าร่วมงานรับน้องเทค" },
    { id: 3, text: "📢 ฝ่าย IT: ปิดระบบ EasyCheck ชั่วคราวคืนวันศุกร์" },
  ];

  return (
    <div>
      <h2>📢 ประกาศกลุ่ม / ภาควิชา</h2>
      <ul>
        {notices.map((n) => (
          <li key={n.id}>{n.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default GroupNotice;