// src/components/SolvencyFanChart.jsx
// 12-Month Solvency Fan Chart component
// Renders P5 / P50 / P95 confidence interval bands using Chart.js
// Visual design inspired by modern fintech SaaS forecasting components

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function SolvencyFanChart({ days, p5, p50, p95 }) {
  if (!days || !p5 || !p50 || !p95) return null;

  const data = {
    labels: days,
    datasets: [
      {
        label: "P95 (Optimistic)",
        data: p95,
        borderColor: "rgba(99, 102, 241, 0)",
        backgroundColor: "rgba(99, 102, 241, 0.15)", 
        fill: "+2", 
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "P50 (Median)",
        data: p50,
        borderColor: "rgba(99, 102, 241, 1)", 
        backgroundColor: "transparent",
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
      },
      {
        label: "P5 (Pessimistic)",
        data: p5,
        borderColor: "rgba(99, 102, 241, 0)",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#9ca3af",
          boxWidth: 12,
          font: { size: 11 },
          filter: (item) => item.text === "P50 (Median)",
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        borderColor: "#374151",
        borderWidth: 1,
        callbacks: {
          title: (ctx) => `Day ${ctx[0].label}`,
          label: (ctx) => ` ${ctx.dataset.label}: £${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#6b7280", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
          callback: (value) => `£${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-gray-300">12-Month Solvency Forecast</h3>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 opacity-40" />
            P95 Optimistic
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
            P50 Median
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 opacity-40" />
            P5 Pessimistic
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-6 italic">
        * Shaded band represents the 90% confidence interval across 10,000 simulated scenarios.
      </p>
      
      <div className="h-64 relative">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}