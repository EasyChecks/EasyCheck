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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

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
