// src/data/transactionStore.js
// Shared transaction data layer
// Local-first architecture inspired by actualbudget/actual
// Syncs to PostgreSQL backend when available

export const STORAGE_KEY = "unibudget_transactions"

export const INITIAL_TRANSACTIONS = [
  { id: 1,  date: "2025-03-01", description: "Monthly Salary",       category: "Income",    amount: 1500,  type: "income"  },
  { id: 2,  date: "2025-03-02", description: "Rent Payment",         category: "Housing",   amount: -800,  type: "expense" },
  { id: 3,  date: "2025-03-05", description: "Tesco Grocery",        category: "Food",      amount: -65,   type: "expense" },
  { id: 4,  date: "2025-03-07", description: "Bus Pass",             category: "Transport", amount: -55,   type: "expense" },
  { id: 5,  date: "2025-03-10", description: "Freelance Project",    category: "Income",    amount: 300,   type: "income"  },
  { id: 6,  date: "2025-03-12", description: "Netflix Subscription", category: "Leisure",   amount: -18,   type: "expense" },
  { id: 7,  date: "2025-03-14", description: "McDonald's",           category: "Food",      amount: -12,   type: "expense" },
  { id: 8,  date: "2025-03-18", description: "Electric Bill",        category: "Utilities", amount: -45,   type: "expense" },
  { id: 9,  date: "2025-03-20", description: "Part-time Tutoring",   category: "Income",    amount: 200,   type: "income"  },
  { id: 10, date: "2025-03-25", description: "Gym Membership",       category: "Leisure",   amount: -30,   type: "expense" },
]

export function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS
  } catch {
    return INITIAL_TRANSACTIONS
  }
}

export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

// ---------------------------------------------------------------------------
// Sync local transactions to backend PostgreSQL database
// Called on Bookkeeping page load to keep Advanced Insights data up to date
// Skips duplicates by matching date + description + amount
// ---------------------------------------------------------------------------
export async function syncTransactionsToBackend(transactions) {
  try {
    const API_BASE = "http://localhost:8000"

    // Fetch existing records from database to avoid inserting duplicates
    const res = await fetch(`${API_BASE}/api/transactions/`)
    if (!res.ok) return

    const existing = await res.json()
    const existingKeys = new Set(
      existing.map((tx) => `${tx.date}|${tx.description}|${tx.amount}`)
    )

    // Push only transactions not already present in the database
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
    // Backend unavailable — silently continue with localStorage only
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

  const income    = Math.round(sum("Income"))
  const rent      = Math.round(sum("Housing"))
  const food      = Math.round(sum("Food") + sum("Leisure") + sum("Utilities"))
  const transport = Math.round(sum("Transport"))

  return {
    income:    income    || 1500,
    rent:      rent      || 800,
    food:      food      || 300,
    transport: transport || 100,
  }
}