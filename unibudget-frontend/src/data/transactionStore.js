// src/data/transactionStore.js
// Shared transaction data layer
// Local-first architecture inspired by actualbudget/actual
// Syncs to PostgreSQL backend when available

export const STORAGE_KEY = "unibudget_transactions"

export function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

// ---------------------------------------------------------------------------
// Sync local transactions to backend PostgreSQL database
// Skips duplicates by matching date + description + amount
// ---------------------------------------------------------------------------
export async function syncTransactionsToBackend(transactions) {
  try {
    const API_BASE = "http://localhost:8000"

    const res = await fetch(`${API_BASE}/api/transactions/`)
    if (!res.ok) return

    const existing = await res.json()
    const existingKeys = new Set(
      existing.map((tx) => `${tx.date}|${tx.description}|${tx.amount}`)
    )

    for (const tx of transactions) {
      const key = `${tx.date}|${tx.description}|${tx.amount}`
      if (existingKeys.has(key)) continue

      await fetch(`${API_BASE}/api/transactions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date:        tx.date,
          description: tx.description,
          category:    tx.category,
          amount:      tx.amount,
          type:        tx.type,
        }),
      })
    }
  } catch {
    console.warn("Backend sync skipped: server unavailable.")
  }
}

// ---------------------------------------------------------------------------
// Aggregate transactions into slider-compatible values
// Income    = sum of all income entries
// Housing   = sum of Housing category expenses
// Food      = sum of Food + Leisure + Utilities
// Transport = sum of Transport category expenses
// ---------------------------------------------------------------------------
export function aggregateToSliderValues(transactions) {
  const sum = (cat) =>
    transactions
      .filter((tx) => tx.category === cat)
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0)

  return {
    income:    Math.round(sum("Income")),
    rent:      Math.round(sum("Housing")),
    food:      Math.round(sum("Food") + sum("Leisure") + sum("Utilities")),
    transport: Math.round(sum("Transport")),
  }
}