import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import EventList from "./pages/user/Event/EventList.jsx";
import EventDetails from "./pages/user/Event/EventDetails.jsx";
import Auth from "./pages/Auth/Auth.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard.jsx";
import ManagerDashboard from "./pages/admin/ManagerDashboard.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import LeaveDetail from "./pages/user/Leave/LeaveDetail.jsx";
import ListLeave from "./pages/user/Leave/ListLeave.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import LeaveScreen from "./pages/user/Leave/LeaveScreen.jsx";

export const Wait = () => <div style={{ padding: 20, textAlign: 'center' }}>Waiting for my team…</div>

// 🔹 กำหนด router ทั้งหมดในที่เดียว
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/auth',
    element: <Auth />
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/superadmin',
    element: (
      <ProtectedRoute allowedRoles={['superadmin']}>
        <SuperAdminDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/manager',
    element: (
      <ProtectedRoute allowedRoles={['manager']}>
        <ManagerDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/user',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <UserDashboard />
      </ProtectedRoute>
    )
  },
  {
    path: '/user/leave/list',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <ListLeave />
      </ProtectedRoute>
    )
  },
  {
    path: '/user/leave/detail/:id',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <LeaveDetail />
      </ProtectedRoute>
    )
  },
  {
    path: '/user/leave',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <LeaveScreen />
      </ProtectedRoute>
    )
  },
  {
    path: '/calendar',
    element: (
      <ProtectedRoute>
        <Wait />
      </ProtectedRoute>
    )
  },
  {
    path: '/event',
    element: (
      <ProtectedRoute>
        <EventList />
      </ProtectedRoute>
    )
  },
  {
    path: '/event/:id',
    element: (
      <ProtectedRoute>
        <EventDetails />
      </ProtectedRoute>
    )
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);