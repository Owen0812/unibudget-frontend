// src/pages/Settings.jsx
// User Settings and Compliance Centre
// Features: Account management, GDPR data controls, Notifications, and Interactive Theme Colors.
// Architecture inspirations noted in the About section.

import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  Bell,
  Palette,
  Trash2,
  Download,
  LogOut,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Sub-component: Section Wrapper
// ---------------------------------------------------------------------------
function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-1">
        <Icon className="w-5 h-5 text-gray-100" />
        <h3 className="font-bold text-base text-white">{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-6 ml-8">{description}</p>
      )}
      <div className="ml-8 space-y-5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Toggle Row (Now supports dynamic theme colors!)
// ---------------------------------------------------------------------------
function ToggleRow({ label, description, enabled, onChange, themeColor = "indigo" }) {
  // Safe color mapping for Tailwind JIT compiler
  const activeColors = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    rose: "bg-rose-600",
    amber: "bg-amber-600",
  };
  
  const activeBg = activeColors[themeColor] || activeColors.indigo;

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gray-950/50 border border-gray-800/50 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-gray-300">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? activeBg : "bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Danger Action Button
// ---------------------------------------------------------------------------
function DangerButton({ icon: Icon, label, description, buttonLabel, onClick }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-rose-950/10 border border-rose-900/30 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-rose-500">{label}</p>
        {description && (
          <p className="text-xs text-rose-400/70 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200 shrink-0 shadow-sm"
      >
        <Icon className="w-4 h-4" />
        {buttonLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------
export default function Settings() {
  // Account mock state
  const [displayName, setDisplayName] = useState("Owen Lin");
  const [email] = useState("sgylin22@liverpool.ac.uk");
  const [editingName, setEditingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Notification preferences
  const [notifyBankruptcy, setNotifyBankruptcy] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(false);

  // 🌟 NEW: Theme and Appearance State
  const [currency, setCurrency] = useState("GBP");
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem("unibudget_theme") || "indigo";
  });

  // Save theme to local storage when changed
  useEffect(() => {
    localStorage.setItem("unibudget_theme", themeColor);
  }, [themeColor]);

  // Confirmation flash states
  const [exportFlash, setExportFlash] = useState(false);
  const [deleteFlash, setDeleteFlash] = useState(false);

  const handleSaveName = () => {
    setEditingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleExportData = () => {
    const mockExport = {
      exportedAt: new Date().toISOString(),
      user: { displayName, email },
      preferences: { themeColor, currency },
      localLedger: JSON.parse(localStorage.getItem("unibudget_transactions") || "[]"),
      localScenarios: JSON.parse(localStorage.getItem("unibudget_scenarios") || "[]"),
    };
    
    const blob = new Blob([JSON.stringify(mockExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unibudget_data_export.json";
    a.click();
    URL.revokeObjectURL(url);
    
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("WARNING: This will permanently delete all your local bookkeeping data and saved scenarios. Are you sure?")) {
      localStorage.removeItem("unibudget_transactions");
      localStorage.removeItem("unibudget_scenarios");
      localStorage.removeItem("unibudget_theme");
      setDeleteFlash(true);
      setTimeout(() => { window.location.reload(); }, 1500);
    }
  };

  // Color options for the theme picker
  const themeOptions = [
    { id: "indigo", bgClass: "bg-indigo-500", ringClass: "ring-indigo-500" },
    { id: "emerald", bgClass: "bg-emerald-500", ringClass: "ring-emerald-500" },
    { id: "amber", bgClass: "bg-amber-500", ringClass: "ring-amber-500" },
    { id: "rose", bgClass: "bg-rose-500", ringClass: "ring-rose-500" },
  ];

  return (
    <main className="max-w-3xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-300">

      {/* Page Header */}
      <div className="mb-4">
        <h2 className="text-3xl font-black tracking-tight text-white">Settings</h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage your workspace, privacy controls, and application theme.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. Appearance & Theme (🌟 The Interactive Color Picker!) */}
      {/* ------------------------------------------------------------------ */}
      <SettingsSection icon={Palette} title="Appearance & Theme" description="Customize how UniBudget Lab looks and formats data.">
        
        {/* Accent Color Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-950/50 border border-gray-800/50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-300">Accent Color</p>
            <p className="text-xs text-gray-500 mt-1">Personalize the application's primary color.</p>
          </div>
          <div className="flex items-center gap-3">
            {themeOptions.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setThemeColor(theme.id)}
                className={`w-8 h-8 rounded-full ${theme.bgClass} transition-all duration-200 ${
                  themeColor === theme.id 
                    ? `ring-2 ring-offset-2 ring-offset-gray-950 ${theme.ringClass} scale-110 shadow-lg` 
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                title={`Change theme to ${theme.id}`}
                aria-label={theme.id}
              />
            ))}
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-between p-4 bg-gray-950/50 border border-gray-800/50 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-300">Base Currency</p>
            <p className="text-xs text-gray-500 mt-1">Affects ledger and Monte Carlo outputs.</p>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="GBP">£ GBP — British Pound</option>
            <option value="EUR">€ EUR — Euro</option>
            <option value="USD">$ USD — US Dollar</option>
          </select>
        </div>
      </SettingsSection>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Notifications (Uses the selected theme color!) */}
      {/* ------------------------------------------------------------------ */}
      <SettingsSection icon={Bell} title="Notifications" description="Configure how the Advisory Engine communicates with you.">
        <ToggleRow
          label="Bankruptcy Risk Alerts"
          description="Trigger an alert if 12-month solvency drops below 60% confidence."
          enabled={notifyBankruptcy}
          onChange={setNotifyBankruptcy}
          themeColor={themeColor} // 🌟 Passed dynamically!
        />
        <ToggleRow
          label="Weekly Ledger Summary"
          description="Receive an automated digest of your bookkeeping patterns."
          enabled={notifyWeekly}
          onChange={setNotifyWeekly}
          themeColor={themeColor} // 🌟 Passed dynamically!
        />
      </SettingsSection>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Account */}
      {/* ------------------------------------------------------------------ */}
      <SettingsSection icon={User} title="Account" description="Your profile information linked via OAuth 2.0.">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Name</p>
          {editingName ? (
            <div className="flex gap-3">
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors shadow-inner" />
              <button onClick={handleSaveName} className={`bg-gray-800 hover:bg-gray-700 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors shadow-lg`}>Save</button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <button onClick={() => setEditingName(true)} className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                Edit <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Address</p>
          <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 opacity-70 cursor-not-allowed">
            <p className="text-sm font-medium text-gray-300">{email}</p>
          </div>
        </div>
      </SettingsSection>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Privacy & GDPR Compliance */}
      {/* ------------------------------------------------------------------ */}
      <SettingsSection icon={ShieldCheck} title="Privacy & GDPR Compliance" description="Your rights under UK GDPR.">
        <div className="space-y-2 mt-6">
          <DangerButton icon={Download} label="Export Workspace Data" description="GDPR Art. 20 (Right to Data Portability)." buttonLabel="Export JSON" onClick={handleExportData} />
        </div>
        <div className="space-y-2">
          <DangerButton icon={Trash2} label="Wipe Local Workspace" description="GDPR Art. 17 (Right to Erasure)." buttonLabel="Wipe Data" onClick={handleDeleteAccount} />
        </div>
      </SettingsSection>

      {/* ------------------------------------------------------------------ */}
      {/* 5. System About & Academic Context */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-xs text-gray-500 space-y-2 shadow-inner">
        <p className="font-bold text-gray-400 mb-3 text-sm tracking-tight">About UniBudget Lab</p>
        <p><strong className="text-gray-400">Version:</strong> 1.0.0-rc.1</p>
        <p><strong className="text-gray-400">Context:</strong> COMP208 Group Project, University of Liverpool</p>
        <p><strong className="text-gray-400">Tech Stack:</strong> React SPA, Tailwind CSS, Chart.js, FastAPI, PostgreSQL</p>
        <div className="pt-3 mt-3 border-t border-gray-800">
          <p className="mb-1 font-medium text-gray-400">Literature & Architectural Inspirations:</p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>UI/UX & Router Pattern: <span className="font-mono">maybe-finance/maybe</span></li>
            <li>Double-Entry Ledger & Rules: <span className="font-mono">firefly-iii/firefly-iii</span></li>
            <li>Virtualization Concepts: <span className="font-mono">actualbudget/actual</span></li>
          </ul>
        </div>
        <p className="pt-4 mt-4 border-t border-gray-800 italic leading-relaxed text-[10px] uppercase tracking-wider text-gray-600">
          Disclaimer: Results are probabilistic projections, not professional financial advice. Built in strict adherence to UK GDPR guidelines and the BCS Code of Conduct.
        </p>
      </div>

    </main>
  );
}