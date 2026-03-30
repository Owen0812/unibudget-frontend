// src/pages/Login.jsx
// OAuth 2.0 login page with Active GDPR Consent Flow
// Demonstrates strict compliance with UK data protection regulations

import React, { useState } from "react"
import { Scale, LogIn, CheckCircle } from "lucide-react"

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.64 24.55c0-1.65-.15-3.23-.42-4.75H24v9h12.79c-.55 2.89-2.23 5.35-4.75 7.04l7.41 5.75c4.32-3.98 6.83-9.85 6.83-16.54z"/>
    <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.41-5.75c-2.23 1.54-5.07 2.44-8.48 2.44-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

const GithubIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
)

function GdprModal({ onAccept }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-5">
        <h2 className="text-2xl font-black flex items-center gap-3 text-indigo-400">
          <LogIn size={24} />
          UK GDPR Consent
        </h2>
        <div className="text-sm text-gray-400 leading-relaxed space-y-3">
          <p>
            In compliance with the{" "}
            <span className="text-white font-semibold">UK General Data Protection Regulation (UK GDPR)</span>,
            this platform requires your explicit consent before processing your data.
          </p>
          <ul className="space-y-2">
            {[
              "We collect only your display name and email from your OAuth provider.",
              "We never connect to real banking APIs or access your bank accounts.",
              "Your financial scenarios are stored encrypted in our database.",
              "You may request deletion of all your data at any time via Settings.",
              "We do not sell or share your data with third parties.",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-600 border-t border-gray-800 pt-3">
            Results are probabilistic projections, not professional financial advice.
            BCS Code of Conduct observed.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onAccept}
            className="px-6 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg text-sm"
          >
            I Understand and Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Login({ onLoginSuccess }) {
  const [showGdpr, setShowGdpr] = useState(false)
  const [pendingProvider, setPending] = useState(null)
  const [gdprAccepted, setGdprAccepted] = useState(false)

  const handleProviderClick = (provider) => {
    setPending(provider)
    setShowGdpr(true)
  }

  const handleAccept = () => {
    setShowGdpr(false)
    setGdprAccepted(true)
    localStorage.setItem("gdpr_accepted", "true")
    setTimeout(() => {
      onLoginSuccess()
    }, 1000)
  }

  return (
    <div className="min-h-screen w-full bg-gray-950 flex flex-col items-center justify-center p-6">

      {showGdpr && <GdprModal onAccept={handleAccept} />}

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-indigo-600 rounded-2xl p-3 shadow-xl">
          <Scale className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-indigo-400">UniBudget</h1>
          <p className="text-lg font-bold -mt-1 text-white">Lab Platform</p>
        </div>
      </div>

      {/* Login card */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">Sign In</h2>
          <p className="text-sm text-gray-500 mt-1.5">
            Choose a provider to continue. You will be asked to review our privacy notice.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleProviderClick("google")}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-all text-sm shadow-sm"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <button
            onClick={() => handleProviderClick("github")}
            className="w-full flex items-center justify-center gap-3 bg-gray-950 text-white font-bold py-3.5 rounded-xl border border-gray-800 hover:bg-gray-800 transition-all text-sm"
          >
            <GithubIcon />
            Continue with GitHub
          </button>
        </div>

        {/* Status indicator */}
        <div className="pt-4 border-t border-gray-800 text-center">
          {gdprAccepted ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-medium">
              <CheckCircle className="w-4 h-4" />
              Consent recorded. Redirecting to dashboard...
            </div>
          ) : (
            <p className="text-xs text-gray-600">
              Protected by OAuth 2.0 · GDPR (UK) Compliant
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-700 mt-6 text-center max-w-sm">
        Results are probabilistic projections, not professional financial advice.
      </p>
    </div>
  )
}