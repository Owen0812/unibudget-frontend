// src/App.jsx
import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Bookkeeping from "./pages/Bookkeeping"
import Login from "./pages/Login"
import Settings from "./pages/Settings"

function ProtectedRoute({ children }) {
  const isAuthed = localStorage.getItem("gdpr_accepted") === "true"
  return isAuthed ? children : <Navigate to="/login" replace />
}

export default function App() {
  const handleLoginSuccess = () => {
    window.location.href = "/dashboard"
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-950 text-white flex font-sans">
                <Sidebar />
                <div className="flex-1 overflow-auto h-screen bg-gray-950">
                  <Routes>
                    <Route path="dashboard"   element={<Dashboard />}   />
                    <Route path="bookkeeping" element={<Bookkeeping />} />
                    <Route path="settings"    element={<Settings />}    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}