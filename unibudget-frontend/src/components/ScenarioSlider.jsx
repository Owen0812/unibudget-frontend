// src/components/ScenarioSlider.jsx
// Reusable slider component with live value display and colour-coded track
// Inspired by shadcn/ui Slider design patterns

function ScenarioSlider({ label, min, max, step = 1, value, onChange, unit = "£", color = "indigo" }) {
  const percentage = ((value - min) / (max - min)) * 100

  const colorMap = {
    indigo:  "bg-indigo-500",
    emerald: "bg-emerald-500",
    rose:    "bg-rose-500",
    amber:   "bg-amber-500",
    teal:    "bg-teal-500",
    purple:  "bg-purple-500",
  }

  const trackColor = colorMap[color] || colorMap.indigo

  return (
    <div className="w-full mb-6">
      {/* Label row: name on the left, live value on the right */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-bold text-white tabular-nums">
          {unit}{value.toLocaleString()}
        </span>
      </div>

      {/* Slider track container */}
      <div className="relative w-full h-2 bg-slate-800 rounded-full">
        {/* Filled coloured track */}
        <div
          className={`absolute top-0 left-0 h-2 rounded-full ${trackColor}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Native range input — transparent overlay on top of the track */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb dot */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${trackColor} border-2 border-white shadow-lg pointer-events-none`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">{unit}{min.toLocaleString()}</span>
        <span className="text-xs text-slate-500">{unit}{max.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default ScenarioSlider