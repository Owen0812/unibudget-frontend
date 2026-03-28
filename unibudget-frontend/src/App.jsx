// src/App.jsx
// Application root — sets up React Router and persistent layout

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Components and Pages
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Bookkeeping from "./pages/Bookkeeping";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white flex font-sans">
        
        <Routes>
          {/* Public Route: Login page (No sidebar) */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes: Main app layout with persistent sidebar */}
          <Route
            path="/*"
            element={
              <>
                <Sidebar />
                <div className="flex-1 overflow-auto h-screen bg-gray-950">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="bookkeeping" element={<Bookkeeping />} />
                    <Route path="settings" element={<Settings />} />
                    
                    {/* Default redirect to dashboard if route not found */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>

      </div>
    </BrowserRouter>
  );
}