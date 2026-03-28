// src/pages/Dashboard.jsx
// Main dashboard page — Scenario Builder + Fan Chart + Risk Cards
// Layout inspired by modern fintech dashboard structures

import React, { useState, useEffect } from "react";
import ScenarioSlider from "../components/ScenarioSlider";
import SolvencyFanChart from "../components/SolvencyFanChart";
import useDebounce from "../hooks/useDebounce";
import HealthScoreGauge, { calculateHealthScore } from "../components/HealthScoreGauge";

// ---------------------------------------------------------------------------
// Mock Monte Carlo Engine (Will be replaced by Python backend)
// ---------------------------------------------------------------------------
function mockMonteCarloSimulate(income, rent, food, transport) {
  const monthlyBalance = income - rent - food - transport;
  const expenseRatio = income > 0 ? (rent + food + transport) / income : 1;
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
// Advisory Engine
// ---------------------------------------------------------------------------
function getAdvisoryMessage(bankruptcyProbability, expenseRatio, food, income) {
  if (bankruptcyProbability >= 60) return {
    level: "critical",
    message: "Critical risk: bankruptcy probability exceeds 60%. Immediate reduction in variable expenses is strongly advised.",
  };
  if (bankruptcyProbability >= 40) return {
    level: "warning",
    message: "Elevated risk detected. Consider reducing discretionary spending to improve your 12-month solvency outlook.",
  };
  if (income > 0 && food / income > 0.25) return {
    level: "warning",
    message: "Food expenses exceed 25% of income. Reviewing your grocery and dining budget may improve financial resilience.",
  };
  return {
    level: "good",
    message: "Your current scenario looks financially stable. Keep maintaining a healthy monthly surplus.",
  };
}

export default function Dashboard() {
  const [income, setIncome] = useState(1500);
  const [rent, setRent] = useState(800);
  const [food, setFood] = useState(300);
  const [transport, setTransport] = useState(100);
  
  const [simResult, setSimResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const debouncedIncome = useDebounce(income, 500);
  const debouncedRent = useDebounce(rent, 500);
  const debouncedFood = useDebounce(food, 500);
  const debouncedTransport = useDebounce(transport, 500);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      const result = mockMonteCarloSimulate(
        debouncedIncome, debouncedRent, debouncedFood, debouncedTransport
      );
      setSimResult(result);
      setIsCalculating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedIncome, debouncedRent, debouncedFood, debouncedTransport]);

  const totalExpense = rent + food + transport;
  const balance = income - totalExpense;
  const expenseRatio = income > 0 ? totalExpense / income : 1;

  const advisory = simResult
    ? getAdvisoryMessage(simResult.bankruptcyProbability, expenseRatio, food, income)
    : null;

  const advisoryStyles = {
    critical: "border-rose-500 bg-rose-500/10 text-rose-300",
    warning: "border-amber-500 bg-amber-500/10 text-amber-300",
    good: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
  };

  const riskColor =
    simResult?.bankruptcyProbability >= 60 ? "text-rose-400" :
    simResult?.bankruptcyProbability >= 40 ? "text-amber-400" :
    "text-emerald-400";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT COLUMN: Controls (Spans 4 columns) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* 1. Scenario Builder */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
          <h2 className="text-lg font-bold mb-1 text-white">Scenario Builder</h2>
          <p className="text-xs text-gray-500 mb-6">
            Drag sliders to model your monthly finances. Results update automatically.
          </p>
          <ScenarioSlider label="Monthly Income" min={500} max={5000} step={50} value={income} onChange={setIncome} color="emerald" />
          <ScenarioSlider label="Rent" min={300} max={2000} step={25} value={rent} onChange={setRent} color="rose" />
          <ScenarioSlider label="Food & Dining" min={100} max={800} step={10} value={food} onChange={setFood} color="amber" />
          <ScenarioSlider label="Transport" min={0} max={300} step={10} value={transport} onChange={setTransport} color="indigo" />
        </div>

        {/* 2. Health Score Gauge (Safely Injected) */}
        <HealthScoreGauge 
          score={calculateHealthScore(
            income, 
            totalExpense, 
            simResult?.bankruptcyProbability ?? 50
          )} 
        />

        {/* 3. Advisory Engine Output */}
        {advisory && (
          <div className={`rounded-2xl p-5 border text-sm leading-relaxed shadow-lg transition-colors duration-300 ${advisoryStyles[advisory.level]}`}>
            <p className="font-bold mb-2 uppercase tracking-wide text-xs flex items-center gap-2">
              {advisory.level === "critical" && "⛔ Critical Alert"}
              {advisory.level === "warning"  && "⚠️ Advisory Notice"}
              {advisory.level === "good"     && "✅ System Nominal"}
            </p>
            <p className="opacity-90">{advisory.message}</p>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Visualizations (Spans 8 columns) */}
      <div className="lg:col-span-8 space-y-6 flex flex-col">
        
        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Monthly Surplus</p>
            <p className={`text-3xl font-black ${balance >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
              £{balance.toLocaleString()}
            </p>
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
               <p className={`text-4xl font-black ${riskColor}`}>
                 {simResult.bankruptcyProbability}%
               </p>
             ) : (
               <p className="text-xl font-bold text-gray-600">--</p>
             )}
          </div>
        </div>

        {/* Core Visualization: The Fan Chart */}
        <div className={`flex-grow transition-opacity duration-500 ${isCalculating ? 'opacity-40 grayscale-[30%]' : 'opacity-100'}`}>
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
  );
}