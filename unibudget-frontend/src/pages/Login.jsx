// src/pages/Login.jsx
// OAuth 2.0 login page with Active GDPR Consent Flow
// Demonstrates strict compliance with UK data protection regulations

import React, { useState } from "react";
import { ShieldCheck, Wallet, Github, Chrome, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ---------------------------------------------------------------------------
// GDPR Consent Modal — Explicit opt-in required by UK/EU Law
// ---------------------------------------------------------------------------
function GdprModal({ onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-black text-white">Privacy & Data Notice</h2>
        </div>

        <div className="space-y-4 text-sm text-gray-400 mb-8">
          <p className="leading-relaxed">
            Before authenticating, please confirm you understand how UniBudget Lab handles your data under <span className="text-white font-bold">UK GDPR</span>.
          </p>
          <ul className="space-y-3 p-4 bg-gray-950 rounded-xl border border-gray-800">
            {[
              "We extract only your name and email from your OAuth provider.",
              "We NEVER connect to live banking APIs (Open Banking).",
              "Simulation parameters are stored purely as anonymized JSONB.",
              "We do not sell, broker, or share your data with third parties.",
            ].map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 font-medium hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all duration-200"
          >
            I Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Login Page
// ---------------------------------------------------------------------------
export default function Login() {
  const navigate = useNavigate();
  
  const [showGdpr, setShowGdpr] = useState(false);
  const [pendingProvider, setPending] = useState(null);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);

  // Step 1: User clicks a provider button → Show GDPR modal
  const handleProviderClick = (provider) => {
    setPending(provider);
    setShowGdpr(true);
    setDeclined(false);
  };

  // Step 2a: User accepts GDPR → Show success msg, then redirect
  const handleAccept = () => {
    setShowGdpr(false);
    setGdprAccepted(true);
    
    // Simulate OAuth redirect delay so user can see the confirmation message
    setTimeout(() => {
      // In Phase 4: window.location.href = `http://localhost:8000/auth/${pendingProvider}`
      navigate("/dashboard");
    }, 1500);
  };

  // Step 2b: User declines GDPR → Show warning, cancel login
  const handleDecline = () => {
    setShowGdpr(false);
    setDeclined(true);
    setPending(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background ambient glow (Visual Polish) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* GDPR Modal Overlay */}
      {showGdpr && <GdprModal onAccept={handleAccept} onDecline={handleDecline} />}

      <div className="w-full max-w-sm relative z-10 space-y-8">
        
        {/* Logo & Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gray-900 border border-gray-800 rounded-2xl mb-5 shadow-xl">
            <Wallet className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            UniBudget <span className="text-indigo-500">Lab</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">Stochastic Financial Resilience System</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center mb-2">
            <h2 className="text-lg font-bold text-white mb-1">Sign in to workspace</h2>
            <p className="text-xs text-gray-500">Choose an identity provider to continue.</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleProviderClick("google")}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-950 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-sm"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              onClick={() => handleProviderClick("github")}
              className="w-full flex items-center justify-center gap-3 bg-gray-950 text-white font-bold py-3.5 rounded-xl border border-gray-800 hover:bg-gray-800 transition-all duration-200 shadow-sm"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          {/* Feedback Area */}
          <div className="min-h-[60px]">
            {gdprAccepted && (
              <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-400 leading-relaxed font-medium">
                  Consent recorded. Connecting to <span className="capitalize text-emerald-300 font-bold">{pendingProvider}</span>...
                </p>
              </div>
            )}

            {declined && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
                <Info className="w-5 h-5 text-rose-500 shrink-0" />
                <p className="text-xs text-rose-400 leading-relaxed font-medium">
                  Authentication aborted. You must accept the privacy notice to access the simulation engine.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Compliance Block */}
        <div className="text-center space-y-2 opacity-60">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Protected by OAuth 2.0 · GDPR Compliant
          </p>
          <p className="text-[10px] text-gray-500 leading-relaxed max-w-xs mx-auto">
            Results are probabilistic projections. BCS Code of Conduct observed.
          </p>
        </div>

      </div>
    </div>
  );
}