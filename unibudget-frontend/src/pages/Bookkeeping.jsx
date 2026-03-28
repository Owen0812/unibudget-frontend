// src/pages/Bookkeeping.jsx
// Transaction ledger with full CRUD functionality
// Table structure inspired by firefly-iii double-entry ledger design
// List architecture inspired by actualbudget/actual

import React, { useState } from "react";
import { PlusCircle, Trash2, Search, Filter } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock transaction data — will be replaced by API calls in Phase 4
// ---------------------------------------------------------------------------
const MOCK_TRANSACTIONS = [
  { id: 1, date: "2026-03-01", description: "Monthly Salary", category: "Income", amount: 1500, type: "income" },
  { id: 2, date: "2026-03-02", description: "Rent Payment", category: "Housing", amount: -800, type: "expense" },
  { id: 3, date: "2026-03-05", description: "Tesco Grocery", category: "Food", amount: -65, type: "expense" },
  { id: 4, date: "2026-03-07", description: "Bus Pass", category: "Transport", amount: -55, type: "expense" },
  { id: 5, date: "2026-03-10", description: "Freelance Project", category: "Income", amount: 300, type: "income" },
  { id: 6, date: "2026-03-12", description: "Netflix Subscription", category: "Leisure", amount: -18, type: "expense" },
  { id: 7, date: "2026-03-14", description: "McDonald's", category: "Food", amount: -12, type: "expense" },
  { id: 8, date: "2026-03-18", description: "Electric Bill", category: "Utilities", amount: -45, type: "expense" },
  { id: 9, date: "2026-03-20", description: "Part-time Tutoring", category: "Income", amount: 200, type: "income" },
  { id: 10, date: "2026-03-25", description: "Gym Membership", category: "Leisure", amount: -30, type: "expense" },
];

const CATEGORIES = ["Income", "Housing", "Food", "Transport", "Utilities", "Leisure", "Other"];

// ---------------------------------------------------------------------------
// Sub-component: Add Transaction Form
// ---------------------------------------------------------------------------
function AddTransactionForm({ onAdd }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0], // Default to today
    description: "",
    category: "Food",
    amount: "",
    type: "expense",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.description || !form.amount) return;

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;

    onAdd({
      ...form,
      amount: form.type === "expense" ? -Math.abs(amount) : Math.abs(amount),
      id: Date.now(),
    });

    // Reset form after submission
    setForm({ ...form, description: "", amount: "" });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl">
      <h3 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
        <PlusCircle className="w-4 h-4 text-indigo-400" />
        Add New Entry
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {/* Date */}
        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
          required
        />

        {/* Description */}
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors lg:col-span-2"
          required
        />

        {/* Category */}
        <select
          value={form.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Type toggle */}
        <select
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className={`bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors ${form.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Amount */}
        <div className="flex gap-2 lg:col-span-2">
          <input
            type="number"
            placeholder="Amount £"
            value={form.amount}
            step="0.01"
            min="0"
            onChange={(e) => handleChange("amount", e.target.value)}
            className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors flex-1 min-w-0 font-mono"
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-colors whitespace-nowrap shadow-lg"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Transaction Row
// ---------------------------------------------------------------------------
function TransactionRow({ tx, onDelete }) {
  const categoryColors = {
    Income: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Housing: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Food: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Transport: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Utilities: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Leisure: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors group">
      <td className="px-6 py-4 text-sm text-gray-400 font-mono">{tx.date}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-200">{tx.description}</td>
      <td className="px-6 py-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${categoryColors[tx.category] || categoryColors.Other}`}>
          {tx.category}
        </span>
      </td>
      <td className={`px-6 py-4 text-sm font-bold text-right tabular-nums ${tx.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
        {tx.amount >= 0 ? "+" : "-"}£{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="px-6 py-4 text-right w-16">
        <button
          onClick={() => onDelete(tx.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition-all p-1 rounded-md hover:bg-rose-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main Bookkeeping Page
// ---------------------------------------------------------------------------
export default function Bookkeeping() {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const handleAdd = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const filtered = transactions.filter((tx) => {
    const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || tx.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalIncome = transactions.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = transactions.filter((tx) => tx.amount < 0).reduce((s, tx) => s + tx.amount, 0);
  const netBalance = totalIncome + totalExpense;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-white">Bookkeeping</h2>
        <p className="text-gray-400 text-sm mt-1">
          Track your real-world income and expenses to calibrate the Monte Carlo simulation.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Income", value: `+£${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "text-emerald-400" },
          { label: "Total Expenses", value: `-£${Math.abs(totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "text-rose-400" },
          { label: "Net Balance", value: `£${netBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: netBalance >= 0 ? "text-emerald-400" : "text-rose-400" },
        ].map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <AddTransactionForm onAdd={handleAdd} />

      {/* Controls: Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>
        <div className="relative md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer shadow-sm"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-950 border-b border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length > 0 ? (
                filtered.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm font-medium">No transactions found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500 font-medium mt-4 text-right px-2">
        Showing {filtered.length} of {transactions.length} entries
      </p>

    </main>
  );
}