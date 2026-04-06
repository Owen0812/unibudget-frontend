// src/pages/Bookkeeping.jsx
// Transaction ledger — CRUD with shared localStorage data layer
// Changes here automatically propagate to Dashboard Scenario Builder
// Double-entry ledger design inspired by firefly-iii/firefly-iii

import { useState, useEffect, useRef, useContext } from "react" // 🌟 新增 useContext
import { PlusCircle, Trash2, Search, Filter, RefreshCw, CheckCircle2 } from "lucide-react"
import {
  loadTransactions,
  saveTransactions,
  aggregateToSliderValues,
  syncTransactionsToBackend,
} from "../data/transactionStore"

// 🌟 引入主题大脑
import { ThemeContext } from "../ThemeContext"

const CATEGORIES = ["Income", "Housing", "Food", "Transport", "Utilities", "Leisure", "Other"]

const CATEGORY_COLORS = {
  Income:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Housing:   "bg-rose-500/10 text-rose-500 border-rose-500/20",
  Food:      "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Transport: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  Utilities: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Leisure:   "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Other:     "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const EMPTY_FORM = {
  date: "", description: "", category: "", amount: "", type: "",
}

export default function Bookkeeping() {
  // 🌟 从全局获取黑夜模式和货币符号
  const { isDark, theme, currencySymbol } = useContext(ThemeContext)

  const [transactions, setTransactions] = useState(loadTransactions)
  const [search, setSearch]             = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [syncFlash, setSyncFlash]       = useState(false)
  const [formError, setFormError]       = useState("")
  const isFirstRender = useRef(true)

  const [form, setForm] = useState(EMPTY_FORM)

  // Sync to backend on page load
  useEffect(() => {
    syncTransactionsToBackend(transactions)
  }, [])

  // Persist to localStorage on change, skip first render
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    saveTransactions(transactions)
    setSyncFlash(true)
    const t = setTimeout(() => setSyncFlash(false), 2000)
    return () => clearTimeout(t)
  }, [transactions])

  const handleAdd = () => {
    if (!form.date || !form.description || !form.category || !form.type || !form.amount) {
      setFormError("Please fill in all fields before adding.")
      setTimeout(() => setFormError(""), 3000)
      return
    }
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setFormError("Please enter a valid positive amount.")
      setTimeout(() => setFormError(""), 3000)
      return
    }

    const newTx = {
      ...form,
      amount: form.type === "expense" ? -Math.abs(amount) : Math.abs(amount),
      id: Date.now(),
    }

    setTransactions((prev) => [newTx, ...prev])
    syncTransactionsToBackend([newTx])
    setForm(EMPTY_FORM)

    // Notify Dashboard to instantly re-sync all sliders
    window.dispatchEvent(new Event("focus"))
  }

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    window.dispatchEvent(new Event("focus"))
  }

  const handleReset = () => {
    if (window.confirm("This will permanently delete all transaction records. Are you sure?")) {
      setTransactions([])
      localStorage.removeItem("unibudget_transactions")
      window.dispatchEvent(new Event("focus"))
    }
  }

  const filtered = transactions.filter((tx) => {
    const matchSearch   = tx.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === "All" || tx.category === filterCategory
    return matchSearch && matchCategory
  })

  const totalIncome  = transactions.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0)
  const totalExpense = transactions.filter((tx) => tx.amount < 0).reduce((s, tx) => s + tx.amount, 0)
  const netBalance   = totalIncome + totalExpense
  const preview      = aggregateToSliderValues(transactions)

  return (
    // 🌟 背景色适配
    <main className={`min-h-full max-w-6xl mx-auto px-6 py-8 space-y-6 transition-colors duration-300 ${isDark ? "bg-[#0b0f19]" : "bg-gray-50"}`}>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          {/* 🌟 文字颜色适配 */}
          <h2 className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>Bookkeeping</h2>
          <p className="text-gray-500 text-sm mt-1">
            Your real transactions automatically set the Scenario Builder baseline.
          </p>
        </div>
        <button
          onClick={handleReset}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors ${
            isDark 
              ? "text-gray-400 hover:text-rose-400 bg-gray-900 border border-gray-800 hover:border-rose-900" 
              : "text-gray-600 hover:text-rose-600 bg-white border border-gray-200 hover:bg-rose-50 hover:border-rose-200 shadow-sm"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear All Records
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Income",   value: `+${currencySymbol}${totalIncome.toLocaleString()}`,           color: "text-emerald-500" },
          { label: "Total Expenses", value: `-${currencySymbol}${Math.abs(totalExpense).toLocaleString()}`, color: "text-rose-500"    },
          { label: "Net Balance",    value: `${currencySymbol}${netBalance.toLocaleString()}`,              color: netBalance >= 0 ? "text-emerald-500" : "text-rose-500" },
        ].map((card) => (
          <div key={card.label} className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${isDark ? "bg-[#0b0f19] border-gray-800" : "bg-white border-gray-200"}`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Dashboard sync banner */}
      {transactions.length > 0 && (
        <div className={`border rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-300 ${
          isDark ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-200"
        }`}>
          <div>
            <p className={`text-sm font-bold flex items-center gap-2 mb-1 ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
              <CheckCircle2 className="w-4 h-4" />
              Dashboard Scenario Synced
            </p>
            <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-indigo-400/70" : "text-indigo-500"}`}>
              Income: {currencySymbol}{preview.income.toLocaleString()} &nbsp;|&nbsp;
              Rent: {currencySymbol}{preview.rent.toLocaleString()} &nbsp;|&nbsp;
              Food/Misc: {currencySymbol}{preview.food.toLocaleString()} &nbsp;|&nbsp;
              Transport: {currencySymbol}{preview.transport.toLocaleString()}
            </p>
          </div>
          {syncFlash && (
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg shrink-0 animate-pulse">
              ✓ LIVE SYNCED
            </span>
          )}
        </div>
      )}

      {/* Add Transaction Form */}
      <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${isDark ? "bg-[#0b0f19] border-gray-800" : "bg-white border-gray-200"}`}>
        <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          <PlusCircle className={`w-4 h-4 ${theme?.text || 'text-emerald-500'}`} />
          Add New Transaction
        </h3>

        <div className="flex flex-col lg:flex-row gap-3">
          {/* Date */}
          <input
            type={form.date ? "date" : "text"}
            placeholder="Select Date"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => { if (!form.date) e.target.type = "text" }}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={`w-full lg:w-40 border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors shrink-0 ${theme?.border || 'focus:border-indigo-500'} ${
              isDark ? "bg-gray-950 border-gray-800 text-white placeholder-gray-600 [color-scheme:dark]" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
            }`}
          />

          {/* Description */}
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={`w-full lg:flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${theme?.border || 'focus:border-indigo-500'} ${
              isDark ? "bg-gray-950 border-gray-800 text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
            }`}
          />

          {/* Category */}
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={`w-full lg:w-36 border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors shrink-0 ${theme?.border || 'focus:border-indigo-500'} ${
              isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"
            } ${form.category ? (isDark ? "text-white" : "text-gray-900") : (isDark ? "text-gray-600" : "text-gray-400")}`}
          >
            <option value="" disabled hidden>Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className={isDark ? "text-white" : "text-gray-900"}>{cat}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={`w-full lg:w-32 border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors shrink-0 ${theme?.border || 'focus:border-indigo-500'} ${
              isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"
            } ${form.type ? (isDark ? "text-white" : "text-gray-900") : (isDark ? "text-gray-600" : "text-gray-400")}`}
          >
            <option value="" disabled hidden>Type</option>
            <option value="income" className={isDark ? "text-white" : "text-gray-900"}>Income</option>
            <option value="expense" className={isDark ? "text-white" : "text-gray-900"}>Expense</option>
          </select>

          {/* Amount + Submit */}
          <div className="flex gap-2 w-full lg:w-52 shrink-0">
            <input
              type="number"
              placeholder={`Amount ${currencySymbol}`}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className={`flex-1 min-w-0 border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors ${theme?.border || 'focus:border-indigo-500'} ${
                isDark ? "bg-gray-950 border-gray-800 text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
            <button
              onClick={handleAdd}
              className={`shrink-0 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors shadow-lg ${theme?.bg || 'bg-emerald-600 hover:bg-emerald-500'}`}
            >
              Add
            </button>
          </div>
        </div>

        {formError && (
          <p className="text-xs text-rose-500 mt-3 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" />
            {formError}
          </p>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${theme?.border || 'focus:border-indigo-500'} ${
              isDark ? "bg-[#0b0f19] border-gray-800 text-white placeholder-gray-600" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm"
            }`}
          />
        </div>
        <div className="relative w-full md:w-56">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors appearance-none cursor-pointer ${theme?.border || 'focus:border-indigo-500'} ${
              isDark ? "bg-[#0b0f19] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900 shadow-sm"
            }`}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl transition-colors duration-300 ${isDark ? "bg-[#0b0f19] border-gray-800" : "bg-white border-gray-200"}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${isDark ? "bg-gray-900/50 border-gray-800" : "bg-gray-50/80 border-gray-200"}`}>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 w-12" />
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-100"}`}>
            {filtered.length > 0 ? (
              filtered.map((tx) => (
                <tr key={tx.id} className={`transition-colors group ${isDark ? "hover:bg-gray-800/40" : "hover:bg-gray-50"}`}>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{tx.date}</td>
                  <td className={`px-6 py-4 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right tabular-nums ${
                    tx.amount >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}>
                    {tx.amount >= 0 ? "+" : "-"}{currencySymbol}{Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <p className="text-gray-500 text-sm font-medium mb-1">No transactions yet</p>
                  <p className="text-gray-400 text-xs">
                    Add your first income or expense above to get started.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <p className="text-xs text-gray-500 text-right">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
      )}

    </main>
  )
}
