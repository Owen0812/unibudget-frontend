// src/components/HealthScoreGauge.jsx
// Financial Health Score gauge component
// Scoring algorithm inspired by mahfuzurrahman98/financial-health-calculator
// Weighted formula: Savings Rate (40%) + Expense Ratio (35%) + Solvency Outlook (25%)

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

// ---------------------------------------------------------------------------
// Core Algorithm: Calculate Health Score (0-100)
// ---------------------------------------------------------------------------
export function calculateHealthScore(income, totalExpense, bankruptcyProbability) {
  // Guard clause to prevent division by zero if income is 0
  if (!income || income <= 0) return 0;

  // Factor 1: Savings rate (40% weight) - Target: >= 30%
  const savingsRate = Math.max(0, (income - totalExpense) / income);
  const savingsScore = Math.min(savingsRate / 0.3, 1) * 40;

  // Factor 2: Expense ratio (35% weight) - Target: <= 60%
  const expenseRatio = totalExpense / income;
  const expenseScore = Math.max(0, Math.min((1 - expenseRatio) / 0.4, 1)) * 35;

  // Factor 3: Solvency outlook (25% weight) - Target: <= 10% risk
  const solvencyScore = Math.max(0, Math.min((1 - bankruptcyProbability / 100) / 0.9, 1)) * 25;

  return Math.round(savingsScore + expenseScore + solvencyScore);
}

// ---------------------------------------------------------------------------
// UI Mapping: Colors and Labels
// ---------------------------------------------------------------------------
function getScoreLabel(score) {
  if (score >= 80) return { label: "Excellent", color: "#10b981" }; // Emerald
  if (score >= 60) return { label: "Good", color: "#6366f1" };      // Indigo
  if (score >= 40) return { label: "Fair", color: "#f59e0b" };      // Amber
  return { label: "At Risk", color: "#ef4444" };                    // Rose (Fixed ASI Bug!)
}

// ---------------------------------------------------------------------------
// Component Rendering
// ---------------------------------------------------------------------------
export default function HealthScoreGauge({ score }) {
  const { label, color } = getScoreLabel(score);
  const remainder = 100 - score;

  const data = {
    datasets: [
      {
        data: [score, remainder],
        backgroundColor: [color, "#1f2937"], // Active color + dark gray track
        borderWidth: 0,
        circumference: 270, // Creates the 3/4 gauge shape
        rotation: 225,      // Rotates it to start from bottom left
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%", // Makes the doughnut thinner and more elegant
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <h3 className="font-bold text-sm text-gray-300 mb-2">Financial Health Score</h3>
      
      {/* Doughnut gauge with score overlaid in centre */}
      <div className="relative h-40 flex items-center justify-center mt-2">
        <Doughnut data={data} options={options} />
        {/* Absolute positioned center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <span className="text-4xl font-black text-white">{score}</span>
          <span className="text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color }}>
            {label}
          </span>
        </div>
      </div>

      {/* Score breakdown legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
        {[
          { label: "Savings", color: "bg-emerald-500" },
          { label: "Expenses", color: "bg-indigo-500" },
          { label: "Solvency", color: "bg-amber-500" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-gray-500 uppercase font-semibold">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}