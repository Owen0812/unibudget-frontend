// src/components/Sidebar.jsx
import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard, BookOpen, Settings,
  LogOut, Wallet, ChevronLeft, ChevronRight,
} from "lucide-react"
import api from "../data/api"

const navItems = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard"   },
  { to: "/bookkeeping", icon: BookOpen,         label: "Bookkeeping" },
  { to: "/settings",    icon: Settings,         label: "Settings"    },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // Continue even if backend call fails
    }
    // Clear all auth state then redirect to login
    localStorage.removeItem("gdpr_accepted")
    window.location.href = "/login"
  }

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col sticky top-0 transition-all duration-300 ease-in-out z-50`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white rounded-full p-1.5 shadow-lg transition-transform hover:scale-110 z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={`px-6 py-6 border-b border-gray-800 flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3"}`}>
        <Wallet className="text-indigo-500 w-7 h-7 shrink-0" />
        {!isCollapsed && (
          <span className="text-xl font-black tracking-tight text-white whitespace-nowrap">
            UniBudget <span className="text-indigo-500">Lab</span>
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-hidden">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
            title={isCollapsed ? label : ""}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        {!isCollapsed && (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed mb-4 text-center">
            ⚠️ Probabilistic projections only.
          </p>
        )}
        <button
          onClick={handleSignOut}
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-center gap-2"} w-full py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}