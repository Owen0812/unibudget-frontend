// src/pages/Bookkeeping.jsx
// Transaction ledger — CRUD with shared localStorage data layer
// Changes here automatically propagate to Dashboard Scenario Builder
// Syncs to PostgreSQL backend to power Advanced Analytics insights
// Double-entry ledger design inspired by firefly-iii/firefly-iii

import { useState, useEffect, useRef } from "react"
import { PlusCircle, Trash2, Search, Filter, RefreshCw, CheckCircle2 } from "lucide-react"
import {
  loadTransactions,
  saveTransactions,
  aggregateToSliderValues,
  syncTransactionsToBackend,
  INITIAL_TRANSACTIONS,
} from "../data/transactionStore"

const CATEGORIES = ["Income", "Housing", "Food", "Transport", "Utilities", "Leisure", "Other"]

const CATEGORY_COLORS = {
  Income:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Housing:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Food:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Transport: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Utilities: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Leisure:   "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Other:     "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

export default function Bookkeeping() {
  const [transactions, setTransactions] = useState(loadTransactions)
  const [search, setSearch]             = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [syncFlash, setSyncFlash]       = useState(false)
  const [formError, setFormError]       = useState("")
  const isFirstRender = useRef(true)

  const [form, setForm] = useState({
    date: "", description: "", category: "Food", amount: "", type: "expense",
  })

  // Sync to backend on page load so Advanced Insights has up-to-date data
  useEffect(() => {
    syncTransactionsToBackend(transactions)
  }, [])

  // Persist to localStorage on change, skip first render to avoid flash on load
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
    if (!form.date || !form.description || !form.amount) {
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

    // Also push new transaction directly to backend
    syncTransactionsToBackend([newTx])

    setForm({ date: "", description: "", category: "Food", amount: "", type: "expense" })
  }

  const handleDelete = (id) =>
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))

  const handleReset = () => {
    setTransactions(INITIAL_TRANSACTIONS)
    syncTransactionsToBackend(INITIAL_TRANSACTIONS)
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
    <main className="min-h-full bg-gray-950 max-w-6xl mx-auto px-6 py-8 space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Bookkeeping</h2>
          <p className="text-gray-500 text-sm mt-1">
            Your real transactions automatically set the Scenario Builder baseline.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-white bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Income",   value: `+£${totalIncome.toLocaleString()}`,           color: "text-emerald-400" },
          { label: "Total Expenses", value: `-£${Math.abs(totalExpense).toLocaleString()}`, color: "text-rose-400"    },
          { label: "Net Balance",    value: `£${netBalance.toLocaleString()}`,              color: netBalance >= 0 ? "text-emerald-400" : "text-rose-400" },
        ].map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-3xl font-extrabold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Dashboard sync banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Dashboard Scenario Synced
          </p>
          <p className="text-xs text-indigo-400/70 font-medium uppercase tracking-wider">
            Income: £{preview.income.toLocaleString()} &nbsp;|&nbsp;
            Rent: £{preview.rent.toLocaleString()} &nbsp;|&nbsp;
            Food/Misc: £{preview.food.toLocaleString()} &nbsp;|&nbsp;
            Transport: £{preview.transport.toLocaleString()}
          </p>
        </div>
        {syncFlash && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg shrink-0 animate-pulse">
            ✓ LIVE SYNCED
          </span>
        )}
      </div>

      {/* Add Transaction Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          Add New Transaction
        </h3>

        <div className="flex flex-col lg:flex-row gap-3">
          <input
            type={form.date ? "date" : "text"}
            placeholder="Select Date"
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => { if (!form.date) e.target.type = "text" }}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full lg:w-40 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark] shrink-0"
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full lg:flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full lg:w-36 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full lg:w-28 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors shrink-0"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <div className="flex gap-2 w-full lg:w-52 shrink-0">
            <input
              type="number"
              placeholder="Amount £"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 min-w-0 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={handleAdd}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors shadow-lg"
            >
              Add
            </button>
          </div>
        </div>

        {formError && (
          <p className="text-xs text-rose-400 mt-3 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-rose-400 inline-block" />
            {formError}
          </p>
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="relative w-full md:w-56">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950 border-b border-gray-800">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length > 0 ? (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Other
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right tabular-nums ${
                    tx.amount >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {tx.amount >= 0 ? "+" : "-"}£{Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-gray-700 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-600 text-sm italic">
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-700 text-right">
        Showing {filtered.length} of {transactions.length} transactions
      </p>

    </main>
  )
}