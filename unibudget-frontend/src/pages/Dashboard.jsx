// src/pages/Dashboard.jsx
// Main Dashboard Interface: Scenario Builder, Diagnostics, and Visualizations
//
// Architectural Inspirations & Literature Review:
// 1. Layout & UX: Inspired by enterprise financial SaaS structures like Maybe Finance (https://github.com/maybe-finance/maybe).
//    The golden-ratio split (4-column control panel vs. 8-column data visualization) maximizes data readability.
// 2. Advisory Engine: Adapted from rule-based financial warning systems seen in Firefly III (https://github.com/firefly-iii/firefly-iii).
// 3. Health Score Integration: Algorithmic weighting principles inspired by mahfuzurrahman98/financial-health-calculator.

import React, { useState, useEffect } from "react";
import ScenarioSlider from "../components/ScenarioSlider";
import SolvencyFanChart from "../components/SolvencyFanChart";
import useDebounce from "../hooks/useDebounce";
import HealthScoreGauge, { calculateHealthScore } from "../components/HealthScoreGauge";

// ---------------------------------------------------------------------------
// Mock Monte Carlo Engine (Will be replaced by Python FastAPI endpoint in Phase 4)
// ---------------------------------------------------------------------------
function mockMonteCarloSimulate(income, rent, food, transport) {
  const monthlyBalance = income - rent - food - transport;
  const expenseRatio = income > 0 ? (rent + food + transport) / income : 1;
  
  // Base volatility on the proportion of expenses
  const volatility = expenseRatio * 0.4;
  const rawRisk = Math.max(0, Math.min(1, expenseRatio - 0.3 + volatility * Math.random()));
  const bankruptcyProbability = Math.round(rawRisk * 100);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const p5 = [], p50 = [], p95 = [];
  let balance = 0;

  for (let i = 0; i < 12; i++) {
    const shock = (Math.random() - 0.5) * volatility * income;
    balance += monthlyBalance;
    p50.push(Math.round(balance));
    p5.push(Math.round(balance - Math.abs(shock) * (i + 1) * 0.8));
    p95.push(Math.round(balance + Math.abs(shock) * (i + 1) * 0.5));
  }

  return { bankruptcyProbability, months, p5, p50, p95, monthlyBalance };
}

// ---------------------------------------------------------------------------
// Context-Aware Advisory Engine
// ---------------------------------------------------------------------------
function getAdvisoryMessage(bankruptcyProbability, expenseRatio, food, income) {
  if (bankruptcyProbability >= 60) return { 
    level: "critical", 
    message: "Critical risk: bankruptcy probability exceeds 60%. Immediate reduction in variable expenses is strongly advised." 
  };
  if (bankruptcyProbability >= 40) return { 
    level: "warning", 
    message: "Elevated risk detected. Consider reducing discretionary spending to improve your 12-month solvency outlook." 
  };
  if (income > 0 && food / income > 0.25) return { 
    level: "warning", 
    message: "Food expenses exceed 25% of income. Reviewing your grocery and dining budget may improve financial resilience." 
  };
  return { 
    level: "good", 
    message: "Your current scenario looks financially stable. Keep maintaining a healthy monthly surplus." 
  };
}

// ---------------------------------------------------------------------------
// Main Dashboard Component
// ---------------------------------------------------------------------------
export default function Dashboard() {
  // Scenario States
  const [income, setIncome] = useState(1500);
  const [rent, setRent] = useState(800);
  const [food, setFood] = useState(300);
  const [transport, setTransport] = useState(100);
  
  // Engine Output States
  const [simResult, setSimResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounced values to prevent continuous triggering during slider drag
  const debouncedIncome = useDebounce(income, 500);
  const debouncedRent = useDebounce(rent, 500);
  const debouncedFood = useDebounce(food, 500);
  const debouncedTransport = useDebounce(transport, 500);

  // Trigger Simulation on parameter change
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setSimResult(mockMonteCarloSimulate(debouncedIncome, debouncedRent, debouncedFood, debouncedTransport));
      setIsCalculating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedIncome, debouncedRent, debouncedFood, debouncedTransport]);

  // Derived Metrics
  const totalExpense = rent + food + transport;
  const balance = income - totalExpense;
  const expenseRatio = income > 0 ? totalExpense / income : 1;
  const advisory = simResult ? getAdvisoryMessage(simResult.bankruptcyProbability, expenseRatio, food, income) : null;

  // UI Theme Mapping
  const advisoryStyles = {
    critical: "border-rose-500 bg-rose-500/10 text-rose-300",
    warning: "border-amber-500 bg-amber-500/10 text-amber-300",
    good: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
  };
  const riskColor = simResult?.bankruptcyProbability >= 60 ? "text-rose-400" : simResult?.bankruptcyProbability >= 40 ? "text-amber-400" : "text-emerald-400";

  return (
    // Max-width 1600px wrapper for ultrawide screen optimization
    <div className="max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
      
      {/* ================= LEFT COLUMN: Controls & Diagnostics ================= */}
      <div className="xl:col-span-4 space-y-6 flex flex-col">
        
        {/* Scenario Builder Container */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
          <h2 className="text-lg font-bold mb-1 text-white">Scenario Builder</h2>
          <p className="text-xs text-gray-500 mb-6">Drag sliders to model your finances.</p>
          <ScenarioSlider label="Monthly Income" min={500} max={5000} step={50} value={income} onChange={setIncome} color="emerald" />
          <ScenarioSlider label="Rent" min={300} max={2000} step={25} value={rent} onChange={setRent} color="rose" />
          <ScenarioSlider label="Food & Dining" min={100} max={800} step={10} value={food} onChange={setFood} color="amber" />
          <ScenarioSlider label="Transport" min={0} max={300} step={10} value={transport} onChange={setTransport} color="indigo" />
        </div>

        {/* Diagnostics & Advisory Wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 flex-grow">
          <HealthScoreGauge score={calculateHealthScore(income, totalExpense, simResult?.bankruptcyProbability ?? 50)} />
          
          {advisory && (
            <div className={`rounded-2xl p-5 border text-sm leading-relaxed shadow-xl transition-colors duration-300 ${advisoryStyles[advisory.level]}`}>
              <p className="font-bold mb-2 uppercase tracking-wide text-xs flex items-center gap-2">
                {advisory.level === "critical" && "⛔ Critical Alert"}
                {advisory.level === "warning"  && "⚠️ Advisory Notice"}
                {advisory.level === "good"     && "✅ System Nominal"}
              </p>
              <p className="opacity-90">{advisory.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT COLUMN: Data Visualization ================= */}
      <div className="xl:col-span-8 flex flex-col space-y-6">
        
        {/* Key Performance Indicators (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Monthly Surplus</p>
            <p className={`text-3xl font-black ${balance >= 0 ? "text-emerald-400" : "text-rose-500"}`}>£{balance.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Expenses</p>
            <p className="text-3xl font-black text-white">£{totalExpense.toLocaleString()}</p>
          </div>
          <div className={`rounded-2xl p-6 border shadow-xl flex flex-col justify-center transition-colors duration-500 ${isCalculating ? 'opacity-70' : ''} ${simResult?.bankruptcyProbability >= 60 ? 'bg-rose-950/20 border-rose-900/50' : 'bg-gray-900 border-gray-800'}`}>
             <div className="flex justify-between items-start">
               <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bankruptcy Risk</p>
               {isCalculating && <span className="text-[10px] font-mono text-indigo-400 animate-pulse uppercase">Calculating...</span>}
             </div>
             {simResult ? (
               <p className={`text-4xl font-black ${riskColor}`}>{simResult.bankruptcyProbability}%</p>
             ) : (
               <p className="text-xl font-bold text-gray-600">--</p>
             )}
          </div>
        </div>

        {/* Primary Visualization: Solvency Fan Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col min-h-[500px]">
          <h3 className="font-bold text-sm text-gray-300 mb-4">12-Month Solvency Fan Chart</h3>
          <div className={`flex-1 relative transition-opacity duration-500 ${isCalculating ? 'opacity-40 grayscale-[30%]' : 'opacity-100'}`}>
            {simResult && (
              <SolvencyFanChart
                months={simResult.months}
                p5={simResult.p5}
                p50={simResult.p50}
                p95={simResult.p95}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}