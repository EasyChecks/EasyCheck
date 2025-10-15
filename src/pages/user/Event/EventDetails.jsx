import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventData from "./EventData";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = EventData.find((e) => e.id === parseInt(id));

  if (!event) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          fontFamily: "Prompt, sans-serif",
        }}
      >
        <h3>ไม่พบข้อมูลอีเว้นท์</h3>
        <button
          onClick={() => navigate("/event")}
          style={{
            marginTop: "10px",
            backgroundColor: "#48CBFF",
            color: "#fff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          🔙 กลับไปหน้าอีเว้นท์
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#E6F7FF",
        minHeight: "100vh",
        fontFamily: "Prompt, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            color: "#48CBFF",
            fontWeight: "600",
            fontSize: "22px",
            marginBottom: "12px",
          }}
        >
          {event.title}
        </h2>

        <p>
          <b>สถานที่:</b> {event.location}
        </p>
        <p>
          <b>เวลา:</b> {event.time}
        </p>
        <p>
          <b>รายละเอียด:</b> {event.description}
        </p>

        <button
          onClick={() => navigate("/event")}
          style={{
            marginTop: "20px",
            backgroundColor: "#48CBFF",
            color: "#fff",
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>🔙</span> กลับไปหน้าอีเว้นท์
        </button>
      </div>
    </div>
  );
}
