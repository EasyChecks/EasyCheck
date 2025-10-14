import React from "react";
import { useParams, Link } from "react-router-dom";

function EventDetails() {
  const { id } = useParams();

  return (
    <div>
      <h2>📖 รายละเอียดกิจกรรม</h2>
      <p>นี่คือรายละเอียดของกิจกรรมหมายเลข: <strong>{id}</strong></p>
      <Link to="/event">⬅️ กลับไปหน้ารายการกิจกรรม</Link>
    </div>
  );
}

export default EventDetails;