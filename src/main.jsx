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
import Layout from "./pages/user/layout/Layout.jsx";
import CalendarScreen from "./pages/user/Calendar/CalendarScreen.jsx";
import SettingsScreen from "./pages/user/Settings/SettingsScreen.jsx";
import TakePhoto from "./pages/user/takept/takept.jsx";
import ProfileScreen from "./pages/user/Profile/ProfileScreen.jsx";
import LeaveScreen from "./pages/user/Leave/LeaveScreen.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthProvider.jsx";

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
        <Layout />
      </ProtectedRoute>
    ),
    children: [
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
        path: 'events',
        element: <EventList />
      },
      {
        path: 'events/:id',
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
    path: '/leave',
    element: (
      <ProtectedRoute>
        <Wait />
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