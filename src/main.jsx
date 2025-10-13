import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import React from "react"

export const Wait = () => <div style={{ padding: 20, textAlign: 'center' }}>Waiting for my team…</div>

const router = createBrowserRouter([
  { 
    path: '/', 
    element: <App /> 
  },
  { 
    path: '/leave', 
    element: <Wait /> 
  },
  { 
    path: '/calendar', 
    element: <Wait /> 
  },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
