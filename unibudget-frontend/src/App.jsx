// src/App.jsx
// App entry point — global theme provider, routing, and auth guard
// Chart.js registered globally to avoid duplicate registration errors

import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Bookkeeping from "./pages/Bookkeeping";
import { ThemeContext, THEMES } from "./ThemeContext";

// Register all required Chart.js components once at app level
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

// ---------------------------------------------------------------------------
// Route guard — checks for valid GDPR consent token in sessionStorage
// Redirects unauthenticated users to /login
// ---------------------------------------------------------------------------
function ProtectedRoute({ children }) {
  const isAuthed = sessionStorage.getItem("gdpr_accepted") === "true";
  return isAuthed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [themeKey, setThemeKey] = useState("indigo");
  const [currency, setCurrency] = useState("GBP");

  const currencySymbols = {
    GBP: "£",
    EUR: "€",
    USD: "$"
  };

  // Sync dark mode class on document root for Tailwind dark: variants
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const value = {
    isDark,
    setIsDark,
    themeKey,
    setThemeKey,
    theme: THEMES[themeKey] || THEMES.indigo,
    currency,
    setCurrency,
    currencySymbol: currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$"
  };

  return (
    <ThemeContext.Provider value={value}>
      <BrowserRouter>
        {/* Global background — dark mode transitions applied at root level */}
        <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'}`}>

          <Routes>
            {/* Public route — no auth required, sidebar hidden */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes — sidebar + main content wrapped in auth guard */}
            <Route path="*" element={
              <ProtectedRoute>
                <Sidebar />
                <div className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/bookkeeping" element={<Bookkeeping />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            } />
          </Routes>

        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}