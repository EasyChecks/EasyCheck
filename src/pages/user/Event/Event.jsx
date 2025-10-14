import React from "react";
import { useNavigate } from "react-router-dom";
import EventData from "./EventData";

export default function Event() {
  const navigate = useNavigate();

  const handleViewDetails = (id) => {
    navigate(`/event/${id}`); // ใช้ absolute path ได้เลย
  };

  return (
    <div
      style={{
        backgroundColor: "#48CBFF",
        minHeight: "100vh",
        padding: "16px",
        fontFamily: "Prompt, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: "600", color: "#fff" }}>
        อีเว้นท์
      </h1>
      {EventData.map((event) => (
        <div
          key={event.id}
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "12px",
            marginTop: "10px",
          }}
        >
          <p style={{ fontWeight: "600" }}>{event.title}</p>
          <p style={{ color: "#555" }}>{event.description}</p>
          <button
            onClick={() => handleViewDetails(event.id)}
            style={{
              marginTop: "8px",
              backgroundColor: "#48CBFF",
              color: "#fff",
              padding: "6px 12px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            ดูรายละเอียด
          </button>
        </div>
      ))}
    </div>
  );
}