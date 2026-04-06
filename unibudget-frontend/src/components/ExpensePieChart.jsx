// src/components/ExpensePieChart.jsx
// Expense breakdown doughnut chart using Chart.js
import React, { useContext } from "react";
import { Doughnut } from "react-chartjs-2";
// 🌟 必须保留的图表引擎启动器
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ThemeContext } from "../ThemeContext";

// 注册图表组件
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensePieChart({ data }) {
  // 🌟 接入你的主题大脑和货币符号
  const { isDark, currencySymbol } = useContext(ThemeContext);
  const displayCurrency = currencySymbol || "£";
  
  const { rent = 0, food = 0, transport = 0 } = data || {};
  const total = rent + food + transport;

  const chartData = {
    labels: ["Rent", "Essential", "Discretionary"],
    datasets: [{
      data: [rent, food, transport],
      backgroundColor: ["rgba(239, 68, 68, 0.8)", "rgba(245, 158, 11, 0.8)", "rgba(99, 102, 241, 0.8)"],
      borderColor: [isDark ? "#111827" : "#ffffff", isDark ? "#111827" : "#ffffff", isDark ? "#111827" : "#ffffff"],
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: isDark ? "#9ca3af" : "#4b5563", padding: 16, font: { size: 12 }, usePointStyle: true, pointStyle: "circle", boxWidth: 6, boxHeight: 6 },
      },
      tooltip: {
        backgroundColor: isDark ? "#1f2937" : "#ffffff", 
        titleColor: isDark ? "#f9fafb" : "#111827", 
        bodyColor: isDark ? "#9ca3af" : "#4b5563", 
        borderColor: isDark ? "#374151" : "#e5e7eb", 
        borderWidth: 1,
        callbacks: { 
          // 🌟 货币符号跟着 Settings 走！
          label: (ctx) => ` ${displayCurrency}${ctx.parsed.toLocaleString()} (${total > 0 ? Math.round((ctx.parsed / total) * 100) : 0}%)` 
        },
      },
    },
  };

  return (
    // 🌟 你的无缝丝滑变色逻辑！
    <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-2xl p-6 shadow-xl flex flex-col transition-colors duration-300`}>
      <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Monthly Expense Breakdown</h3>
      <p className={`text-xs mb-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Total: {displayCurrency}{total.toLocaleString()}</p>
      <div className="flex-1 min-h-[200px]">
        {total > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className={`flex items-center justify-center h-full text-sm italic ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            Adjust sliders to see breakdown
          </div>
        )}
      </div>
    </div>
  );
}
