// src/data/transactionStore.js
// Shared transaction store using localStorage
// Acts as a lightweight data layer before PostgreSQL backend is connected
// Pattern inspired by actualbudget/actual local-first data architecture

export const STORAGE_KEY = "unibudget_transactions";

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
];

// Load transactions from localStorage, fall back to initial mock data
export function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

// Persist transactions to localStorage
export function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// ---------------------------------------------------------------------------
// Aggregate transactions into slider-compatible values
// Income    = sum of all income entries
// Housing   = sum of all Housing category expenses (abs value)
// Food      = sum of Food + Leisure + Utilities (discretionary spending)
// Transport = sum of Transport category expenses
// ---------------------------------------------------------------------------
export function aggregateToSliderValues(transactions) {
  const sum = (cat) =>
    transactions
      .filter((tx) => tx.category === cat)
      .reduce((acc, tx) => acc + Math.abs(tx.amount), 0);

  const income    = Math.round(sum("Income"));
  const rent      = Math.round(sum("Housing"));
  const food      = Math.round(sum("Food") + sum("Leisure") + sum("Utilities"));
  const transport = Math.round(sum("Transport"));

  // Apply safe fallback values if a category has no entries to prevent slider breakage
  return {
    income:    income    || 1500,
    rent:      rent      || 800,
    food:      food      || 300,
    transport: transport || 100,
  };
}