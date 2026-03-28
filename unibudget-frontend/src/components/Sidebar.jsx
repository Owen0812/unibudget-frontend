// src/components/Sidebar.jsx
// Persistent sidebar navigation

import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Settings, LogOut, Wallet } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/bookkeeping", icon: BookOpen, label: "Bookkeeping" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col sticky top-0">
      
      {/* Brand Logo Area */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-1">
          <Wallet className="text-indigo-500 w-6 h-6" />
          <span className="text-xl font-black tracking-tight text-white">
            UniBudget <span className="text-indigo-500">Lab</span>
          </span>
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Financial Resilience</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Disclaimer Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed mb-4 text-center">
          ⚠️ Probabilistic projections, not financial advice.
        </p>
        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}