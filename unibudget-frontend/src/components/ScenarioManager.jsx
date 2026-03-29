// src/components/ScenarioManager.jsx
// Save and load scenario snapshots via localStorage
// Storage design inspired by maybe-finance/maybe JSONB snapshot pattern
// (Will migrate to PostgreSQL JSONB in Phase 4)

import React, { useState, useEffect } from "react";
import { Save, FolderOpen, Trash2, ChevronDown, ChevronUp, Download, CheckCircle } from "lucide-react";

const STORAGE_KEY = "unibudget_scenarios";

// ---------------------------------------------------------------------------
// Utility: Load / Save scenarios from localStorage
// ---------------------------------------------------------------------------
function loadScenarios() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function persistScenarios(scenarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

// ---------------------------------------------------------------------------
// Scenario Manager Component
// ---------------------------------------------------------------------------
export default function ScenarioManager({ currentValues, onLoad }) {
  const [scenarios, setScenarios] = useState(loadScenarios);
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Keep localStorage in sync whenever scenarios change
  useEffect(() => {
    persistScenarios(scenarios);
  }, [scenarios]);

  // Save current slider values as a named snapshot
  const handleSave = () => {
    if (!name.trim()) return;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newScenario = {
      id: Date.now(),
      name: name.trim(),
      savedAt: `${new Date().toLocaleDateString()} ${timestamp}`,
      values: currentValues,
    };
    
    setScenarios((prev) => [newScenario, ...prev]);
    setName("");
    
    // Flash confirmation for 2 seconds
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  // Delete a saved scenario by id
  const handleDelete = (id) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // Load a scenario back into the sliders
  const handleLoad = (scenario) => {
    onLoad(scenario.values);
    setIsOpen(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      
      {/* Header */}
      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
        <Save className="w-5 h-5 text-indigo-400" />
        Scenario Archive
      </h3>

      {/* Save Input Row */}
      <div className="flex gap-3 mb-3">
        <input
          type="text"
          placeholder='Name this scenario, e.g. "Worst Case"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
        />
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-colors shadow-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Save Confirmation Flash */}
      <div className="min-h-[24px] mb-4">
        {savedFlash && (
          <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
            <CheckCircle className="w-3.5 h-3.5" /> Snapshot saved to local storage.
          </p>
        )}
      </div>

      {/* Saved Scenarios List */}
      {scenarios.length > 0 && (
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-3 bg-gray-950 border border-gray-800 px-4 py-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-400" />
              {isOpen ? "Hide Archive" : "View Archive"} ({scenarios.length})
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isOpen && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar animate-in slide-in-from-top-2 duration-200">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 group hover:bg-gray-800/50 transition-colors"
                >
                  {/* Scenario Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{scenario.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
                      {scenario.savedAt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleLoad(scenario)}
                      className="text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white p-2 rounded-lg transition-colors"
                      title="Load Scenario"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(scenario.id)}
                      className="text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 p-2 rounded-lg transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                      title="Delete Scenario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {scenarios.length === 0 && (
        <p className="text-xs text-gray-600 mt-2 italic text-center border-t border-gray-800 pt-4">
          No saved scenarios yet. Adjust the sliders and save your first snapshot.
        </p>
      )}
    </div>
  );
}