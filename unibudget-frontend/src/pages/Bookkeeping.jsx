// src/pages/Bookkeeping.jsx
// Transaction ledger — CRUD with shared localStorage data layer
// Changes here automatically propagate to Dashboard Scenario Builder

import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, Search, Filter, RefreshCw, CheckCircle2 } from "lucide-react";
import {
  loadTransactions,
  saveTransactions,
  aggregateToSliderValues,
  INITIAL_TRANSACTIONS,
} from "../data/transactionStore";

const CATEGORIES = ["Income", "Housing", "Food", "Transport", "Utilities", "Leisure", "Other"];

// ---------------------------------------------------------------------------
// Main Bookkeeping Page
// ---------------------------------------------------------------------------
export default function Bookkeeping() {
  const [transactions, setTransactions] = useState(loadTransactions);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [syncFlash, setSyncFlash] = useState(false);

  // New Transaction Form State
  const [form, setForm] = useState({ date: "", description: "", category: "Food", amount: "", type: "expense" });

  // Sync to local storage on change & trigger flash animation
  useEffect(() => {
    saveTransactions(transactions);
    setSyncFlash(true);
    const t = setTimeout(() => setSyncFlash(false), 2000);
    return () => clearTimeout(t);
  }, [transactions]);

  // Handlers
  const handleAdd = () => {
    if (!form.date || !form.description || !form.amount) return;
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    const newTx = {
      ...form,
      amount: form.type === "expense" ? -Math.abs(amount) : Math.abs(amount),
      id: Date.now(),
    };
    
    setTransactions((prev) => [newTx, ...prev]);
    setForm({ date: "", description: "", category: "Food", amount: "", type: "expense" });
  };

  const handleDelete = (id) => setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  const handleReset = () => setTransactions(INITIAL_TRANSACTIONS);

  // Derived Data
  const filtered = transactions.filter((tx) => {
    const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || tx.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const totalIncome = transactions.filter((tx) => tx.amount > 0).reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = transactions.filter((tx) => tx.amount < 0).reduce((s, tx) => s + tx.amount, 0);
  const netBalance = totalIncome + totalExpense;
  
  // Dynamic Slider Preview
  const preview = aggregateToSliderValues(transactions);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 animate-in fade-in duration-300">
      
      {/* Header & Reset Button */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Bookkeeping</h2>
          <p className="text-gray-400 text-sm mt-1">
            Your real transactions automatically set the Scenario Builder baseline.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: "Total Income",   value: `+£${totalIncome.toLocaleString()}`,           color: "text-emerald-400" },
          { label: "Total Expenses", value: `-£${Math.abs(totalExpense).toLocaleString()}`, color: "text-rose-400"    },
          { label: "Net Balance",    value: `£${netBalance.toLocaleString()}`,              color: netBalance >= 0 ? "text-emerald-400" : "text-rose-400" },
        ].map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* 🌟 Dashboard Sync Preview Banner */}
      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-inner">
        <div>
          <p className="text-sm font-bold text-indigo-300 mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Dashboard Scenario Synced
          </p>
          <p className="text-xs font-medium text-indigo-400/80 uppercase tracking-wider">
            Income: £{preview.income.toLocaleString()} | Rent: £{preview.rent.toLocaleString()} | Food/Leisure: £{preview.food.toLocaleString()} | Transport: £{preview.transport.toLocaleString()}
          </p>
        </div>
        <div className="min-w-[80px] text-right">
          {syncFlash && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 animate-in fade-in slide-in-from-right-2">
              LIVE SYNCED
            </span>
          )}
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          Add New Transaction
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
          <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors lg:col-span-2" />
          <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors">
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <div className="flex gap-2">
            <input type="number" placeholder="Amount £" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors w-full" />
            <button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-colors shadow-lg">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm" />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none shadow-sm cursor-pointer">
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950/50 border-b border-gray-800">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length > 0 ? (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-3 py-1 bg-gray-800 text-gray-300 rounded-lg">{tx.category}</span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${tx.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {tx.amount >= 0 ? "+" : ""}£{Math.abs(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(tx.id)} className="text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm italic">No transactions found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}