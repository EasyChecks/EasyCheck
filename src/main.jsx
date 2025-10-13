import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import EventList from "./pages/user/Event/EventList.jsx";
import EventDetails from "./pages/user/Event/EventDetails.jsx";
import GroupNotice from "./pages/common/GroupNotice/GroupNotice.jsx";
import AccessControl from "./pages/admin/Access/AccessControl.jsx";
import "./index.css";

// 🔹 กำหนด router ทั้งหมดในที่เดียว
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // หน้าแรก
        element: <EventList />,
      },
      {
        path: "event/:id",
        element: <EventDetails />,
      },
      {
        path: "group",
        element: <GroupNotice />,
      },
      {
        path: "access",
        element: <AccessControl />,
      },
      {
        path: "*", // สำหรับกรณี route ไม่ตรง
        element: <h2>404 Not Found</h2>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);