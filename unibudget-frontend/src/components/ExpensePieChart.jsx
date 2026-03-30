// src/components/ExpensePieChart.jsx
// Expense breakdown doughnut chart using Chart.js

import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export default function ExpensePieChart({ data }) {
  const { rent = 0, food = 0, transport = 0 } = data || {}
  const total = rent + food + transport

  const chartData = {
    labels: ["Rent", "Essential", "Discretionary"],
    datasets: [
      {
        data: [rent, food, transport],
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(99, 102, 241, 0.8)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(99, 102, 241, 1)",
        ],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#9ca3af",
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        borderColor: "#374151",
        borderWidth: 1,
        callbacks: {
          label: (ctx) =>
            ` £${ctx.parsed.toLocaleString()} (${total > 0 ? Math.round((ctx.parsed / total) * 100) : 0}%)`,
        },
      },
    },
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
      <h3 className="font-bold text-sm text-gray-300 mb-1">Monthly Expense Breakdown</h3>
      <p className="text-xs text-gray-600 mb-4">
        Total: £{total.toLocaleString()}
      </p>
      <div className="flex-1 min-h-[200px]">
        {total > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm italic">
            Adjust sliders to see breakdown
          </div>
        )}
      </div>
    </div>
  )
}