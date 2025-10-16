import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import { LeaveProvider } from "./contexts/LeaveContext.jsx";
import { TeamProvider } from "./contexts/TeamContext.jsx";
import { LoadingProvider } from "./contexts/LoadingContext.jsx";
import PuffLoader from "./components/common/PuffLoader.jsx";

// Import Auth และ Layout แบบปกติเพื่อความเร็ว (ใช้บ่อย)
import Auth from "./pages/Auth/Auth.jsx";
import Layout from "./pages/user/layout/Layout.jsx";
import AdminLayout from "./pages/admin/layout/layout.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";

// Lazy load หน้าที่ใช้น้อย
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const TakePhoto = lazy(() => import("./pages/user/takept/takept.jsx"));
const LeaveScreen = lazy(() => import("./pages/user/Leave/LeaveScreen.jsx"));
const LeaveDetail = lazy(() => import("./pages/user/Leave/LeaveDetail.jsx"));
const ListLeave = lazy(() => import("./pages/user/Leave/ListLeave.jsx"));
const CalendarScreen = lazy(() => import("./pages/user/Calendar/CalendarScreen.jsx"));
const Event = lazy(() => import("./pages/user/Event/Event.jsx"));
const EventDetails = lazy(() => import("./pages/user/Event/EventDetails.jsx"));
const ProfileScreen = lazy(() => import("./pages/user/Profile/ProfileScreen.jsx"));
const SettingsScreen = lazy(() => import("./pages/user/Settings/SettingsScreen.jsx"));
const TeamAttendance = lazy(() => import("./pages/user/Team/TeamAttendance.jsx"));
const LeaveApproval = lazy(() => import("./pages/user/Leave/LeaveApproval.jsx"));

// Loading Component - ใช้ PuffLoader
const PageLoader = () => <PuffLoader text="กำลังโหลด..." />;

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
      <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
      }
    ]
  },
  {
    path: '/superadmin',
    element: <Navigate to="/admin" replace />
  },
  {
    path: '/user',
    element: (
      <ProtectedRoute allowedRoles={['user', 'manager']}>
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
        element: <Suspense fallback={<PageLoader />}><TakePhoto /></Suspense>
      },
      {
        path: 'leave',
        element: <Suspense fallback={<PageLoader />}><LeaveScreen /></Suspense>
      },
      {
        path: 'calendar',
        element: <Suspense fallback={<PageLoader />}><CalendarScreen /></Suspense>
      },
      {
        path: 'event',
        element: <Suspense fallback={<PageLoader />}><Event /></Suspense>
      },
      {
        path: 'event/:id',
        element: <Suspense fallback={<PageLoader />}><EventDetails /></Suspense>
      },
      {
        path: 'profile',
        element: <Suspense fallback={<PageLoader />}><ProfileScreen /></Suspense>
      },
      {
        path: 'settings',
        element: <Suspense fallback={<PageLoader />}><SettingsScreen /></Suspense>
      },
      {
        path: 'team-attendance',
        element: <Suspense fallback={<PageLoader />}><TeamAttendance /></Suspense>
      },
      {
        path: 'leave-approval',
        element: <Suspense fallback={<PageLoader />}><LeaveApproval /></Suspense>
      }
    ]
  },
  {
    path: '/user/leave',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <Suspense fallback={<PageLoader />}><LeaveScreen /></Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/user/leave/list',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <Suspense fallback={<PageLoader />}><ListLeave /></Suspense>
      </ProtectedRoute>
    )
  },
  {
    path: '/user/leave/detail/:id',
    element: (
      <ProtectedRoute allowedRoles={['user']}>
        <Suspense fallback={<PageLoader />}><LeaveDetail /></Suspense>
      </ProtectedRoute>
    )
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <TeamProvider>
          <LeaveProvider>
            <RouterProvider router={router} />
          </LeaveProvider>
        </TeamProvider>
      </AuthProvider>
    </LoadingProvider>
  </React.StrictMode>
);