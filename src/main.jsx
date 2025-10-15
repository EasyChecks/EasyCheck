import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import Event from "./pages/user/Event/Event.jsx";
import EventDetails from "./pages/user/Event/EventDetails.jsx";
import Auth from "./pages/Auth/Auth.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard.jsx";
import ManagerDashboard from "./pages/manager/ManagerDashboard.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import Layout from "./pages/user/layout/Layout.jsx";
import CalendarScreen from "./pages/user/Calendar/CalendarScreen.jsx";
import SettingsScreen from "./pages/user/Settings/SettingsScreen.jsx";
import TakePhoto from "./pages/user/takept/takept.jsx";
import ProfileScreen from "./pages/user/Profile/ProfileScreen.jsx";
import LeaveScreen from "./pages/user/Leave/LeaveScreen.jsx";
import LeaveDetail from "./pages/user/Leave/LeaveDetail.jsx";
import ListLeave from "./pages/user/Leave/ListLeave.jsx";
import ListLeaveAdmin from "./pages/user/Leave/LeaveForm.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { LeaveProvider } from "./contexts/LeaveContext.jsx";

export const Wait = () => <div style={{ padding: 20, textAlign: 'center' }}>Waiting for my team…</div>

// 🔹 กำหนด router ทั้งหมดในที่เดียว
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />
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
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/user/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <UserDashboard />
      },
      {
        path: 'take-photo',
        element: <TakePhoto />
      },
      {
        path: 'leave',
        element: <LeaveScreen />
      },
      {
        path: 'calendar',
        element: <CalendarScreen />
      },
      {
        path: 'event',
        element: <Event />
      },
      {
        path: 'event/:id',
        element: <EventDetails />
      },
      {
        path: 'profile',
        element: <ProfileScreen />
      },
      {
        path: 'settings',
        element: <SettingsScreen />
      }
    ]
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
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <LeaveProvider>
        <RouterProvider router={router} />
      </LeaveProvider>
    </AuthProvider>
  </React.StrictMode>
);