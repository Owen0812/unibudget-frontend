// src/pages/Login.jsx
// OAuth 2.0 login page — placeholder until backend auth is ready

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-extrabold">
          UniBudget <span className="text-indigo-400">Lab</span>
        </h1>
        <p className="text-gray-400 text-sm">Sign in to access your financial dashboard</p>
        <button className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100 transition-colors">
          Continue with Google
        </button>
        <button className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700">
          Continue with GitHub
        </button>
        <p className="text-xs text-gray-600">
          Results are probabilistic projections, not professional financial advice.
        </p>
      </div>
    </div>
  )
}