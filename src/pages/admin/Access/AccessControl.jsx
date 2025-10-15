import React, { useState } from "react";

function AccessControl() {
  const [status, setStatus] = useState("ยังไม่ได้เข้าสู่ระบบ");

  const handleLogin = () => setStatus("✅ เข้าสู่ระบบสำเร็จ");
  const handleLogout = () => setStatus("🚪 ออกจากระบบแล้ว");

  return (
    <div>
      <h2>🔐 ระบบควบคุมสิทธิ์การเข้าถึง</h2>
      <p>สถานะปัจจุบัน: <strong>{status}</strong></p>

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleLogin} style={{ marginRight: "10px" }}>
          เข้าสู่ระบบ
        </button>
        <button onClick={handleLogout}>ออกจากระบบ</button>
      </div>
    </div>
  );
}

export default AccessControl;