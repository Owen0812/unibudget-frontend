// src/App.jsx
import React, { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Bookkeeping from "./pages/Bookkeeping"
import Login from "./pages/Login"
import Settings from "./pages/Settings"

function ProtectedRoute({ children }) {
  const isAuthed = sessionStorage.getItem("gdpr_accepted") === "true"
  return isAuthed ? children : <Navigate to="/login" replace />
}

export default function App() {

  useEffect(() => {
    // Handle GitHub OAuth callback — pick up ?user=xxx&status=success from URL
    const urlParams = new URLSearchParams(window.location.search)
    const user   = urlParams.get("user")
    const avatar = urlParams.get("avatar")
    const status = urlParams.get("status")

    if (status === "success" && user) {
      // Store user info and mark GDPR as accepted
      sessionStorage.setItem("gdpr_accepted", "true")
      sessionStorage.setItem("github_user",   user)
      sessionStorage.setItem("github_avatar", avatar || "")

      // Clean up URL — remove query params
      window.history.replaceState({}, document.title, "/dashboard")
    }
  }, [])

  const handleLoginSuccess = () => {
    window.location.href = "/dashboard"
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white flex font-sans">
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <div className="flex-1 overflow-auto h-screen bg-gray-950">
                    <Routes>
                      <Route path="dashboard"   element={<Dashboard />}   />
                      <Route path="bookkeeping" element={<Bookkeeping />} />
                      <Route path="settings"    element={<Settings />}    />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </div>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}