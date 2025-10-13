import React from "react";
import { Outlet, Link } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div>
      {/* ส่วนหัวหรือ Navigation */}
      <header style={{ background: "#f5f5f5", padding: "10px 20px" }}>
        <h1 style={{ margin: 0 }}>EasyCheck</h1>
        <nav style={{ marginTop: "10px" }}>
          <Link to="/" style={{ marginRight: "15px" }}>
            🏠 Event List
          </Link>
          <Link to="/group" style={{ marginRight: "15px" }}>
            📢 Group Notice
          </Link>
          <Link to="/access" style={{ marginRight: "15px" }}>
            🔐 Access Control
          </Link>
        </nav>
      </header>

      {/* ส่วนนี้คือจุดที่ Router จะ render หน้าอื่น ๆ */}
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;