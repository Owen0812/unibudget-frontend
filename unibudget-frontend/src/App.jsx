import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Bookkeeping from "./pages/Bookkeeping";
import { ThemeContext, THEMES } from "./ThemeContext";

// 注册 Chart.js 插件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

// ============================================================================
// 🚪 真正的“防盗门”组件 (ProtectedRoute)
// 负责检查用户是否经过了 Login 页面的合法授权
// ============================================================================
function ProtectedRoute({ children }) {
  // 检查浏览器里有没有 Login 页面发下的那把叫 "gdpr_accepted" 的钥匙
  const isAuthed = sessionStorage.getItem("gdpr_accepted") === "true";
  
  // 有钥匙就放行，没钥匙就一脚踢回 "/login"
  return isAuthed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  // 保留了你写好的完美全局状态
  const [isDark, setIsDark] = useState(false);
  const [themeKey, setThemeKey] = useState("indigo");
  const [currency, setCurrency] = useState("GBP");

  const currencySymbols = { 
    GBP: "£", 
    EUR: "€", 
    USD: "$" 
  };

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
        {/* 全局大背景，保证无论哪个页面黑夜模式都生效 */}
        <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0b0f19] text-white' : 'bg-gray-50 text-gray-900'}`}>
          
          <Routes>
            {/* 1. 登录页面：不需要防盗门，并且不能显示侧边栏 */}
            <Route path="/login" element={<Login />} />
            
            {/* 2. 系统内部：把侧边栏和主页面打包，统统塞进防盗门里！ */}
            <Route path="*" element={
              <ProtectedRoute>
                {/* 你的左右分栏完美布局 */}
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
