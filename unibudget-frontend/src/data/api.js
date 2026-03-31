// src/data/api.js
// Axios instance pointing to FastAPI backend
// Falls back gracefully when backend is offline

import axios from "axios"

const api = axios.create({
  baseURL: "https://unibudget-backend.onrender.com/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
})

export default api