import React from 'react';

// Freezing Curve - Off Target State (current: 64%, target: 75%)
const FreezingCurveOffTarget = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <h3 className="font-serif font-medium text-slate-800 mb-1">Freezing Curve</h3>
    <p className="text-xs text-slate-400 mb-3 font-sans">Off target state</p>
    <div className="relative h-48">
      <svg viewBox="0 0 210 120" className="w-full h-full">
        {/* Grid lines */}
        <line x1="25" y1="10" x2="25" y2="100" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="25" y1="100" x2="190" y2="100" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Horizontal grid lines */}
        <line x1="25" y1="32" x2="190" y2="32" stroke="#f1f5f9" strokeWidth="1" />
        <line x1="25" y1="55" x2="190" y2="55" stroke="#f1f5f9" strokeWidth="1" />
        <line x1="25" y1="77" x2="190" y2="77" stroke="#f1f5f9" strokeWidth="1" />
        
        {/* Y-axis labels */}
        <text x="20" y="15" textAnchor="end" className="text-[8px] fill-slate-400">0</text>
        <text x="20" y="35" textAnchor="end" className="text-[8px] fill-slate-400">-10</text>
        <text x="20" y="55" textAnchor="end" className="text-[8px] fill-slate-400">-20</text>
        <text x="20" y="77" textAnchor="end" className="text-[8px] fill-slate-400">-30</text>
        <text x="20" y="97" textAnchor="end" className="text-[8px] fill-slate-400">-40</text>
        
        {/* X-axis labels */}
        <text x="25" y="110" textAnchor="start" className="text-[8px] fill-slate-400">0%</text>
        <text x="107" y="110" textAnchor="middle" className="text-[8px] fill-slate-400">50%</text>
        <text x="190" y="110" textAnchor="end" className="text-[8px] fill-slate-400">100%</text>
        
        {/* Serving temperature dashed line */}
        <line x1="25" y1="42" x2="190" y2="42" stroke="#f97316" strokeWidth="1" strokeDasharray="4 2" />
        <rect x="192" y="36" width="16" height="12" rx="2" fill="#f97316" />
        <text x="200" y="44" textAnchor="middle" className="text-[7px] fill-white font-medium">-15°</text>
        
        {/* Freezing curve */}
        <path 
          d="M 25 10 Q 40 12 50 18 Q 70 28 90 42 Q 120 62 150 78 Q 170 88 190 95" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Current recipe point */}
        <circle cx="90" cy="42" r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
        <g>
          <rect x="50" y="22" width="64" height="14" rx="3" fill="#3b82f6" />
          <text x="82" y="32" textAnchor="middle" className="text-[8px] fill-white font-medium">64% at -15°C</text>
        </g>
        
        {/* Target hardness point */}
        <circle cx="130" cy="62" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
        <g>
          <rect x="96" y="68" width="68" height="14" rx="3" fill="#10b981" />
          <text x="130" y="78" textAnchor="middle" className="text-[8px] fill-white font-medium">75% at -18°C</text>
        </g>
      </svg>
      
      <div className="text-center text-xs text-slate-400 font-sans mt-1">
        % Water Frozen (Hardness)
      </div>
    </div>
    
    {/* Legend */}
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs font-sans">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        <span className="text-slate-600">Current: 64%</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="text-slate-600">Target: 75%</span>
      </div>
    </div>
  </div>
);

// Freezing Curve - On Target State (current = target = 75%)
const FreezingCurveOnTarget = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
    <h3 className="font-serif font-medium text-slate-800 mb-1">Freezing Curve</h3>
    <p className="text-xs text-slate-400 mb-3 font-sans">On target state</p>
    <div className="relative h-48">
      <svg viewBox="0 0 210 120" className="w-full h-full">
        {/* Grid lines */}
        <line x1="25" y1="10" x2="25" y2="100" stroke="#e2e8f0" strokeWidth="1" />
        <line x1="25" y1="100" x2="190" y2="100" stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Horizontal grid lines */}
        <line x1="25" y1="32" x2="190" y2="32" stroke="#f1f5f9" strokeWidth="1" />
        <line x1="25" y1="55" x2="190" y2="55" stroke="#f1f5f9" strokeWidth="1" />
        <line x1="25" y1="77" x2="190" y2="77" stroke="#f1f5f9" strokeWidth="1" />
        
        {/* Y-axis labels */}
        <text x="20" y="15" textAnchor="end" className="text-[8px] fill-slate-400">0</text>
        <text x="20" y="35" textAnchor="end" className="text-[8px] fill-slate-400">-10</text>
        <text x="20" y="55" textAnchor="end" className="text-[8px] fill-slate-400">-20</text>
        <text x="20" y="77" textAnchor="end" className="text-[8px] fill-slate-400">-30</text>
        <text x="20" y="97" textAnchor="end" className="text-[8px] fill-slate-400">-40</text>
        
        {/* X-axis labels */}
        <text x="25" y="110" textAnchor="start" className="text-[8px] fill-slate-400">0%</text>
        <text x="107" y="110" textAnchor="middle" className="text-[8px] fill-slate-400">50%</text>
        <text x="190" y="110" textAnchor="end" className="text-[8px] fill-slate-400">100%</text>
        
        {/* Serving temperature dashed line */}
        <line x1="25" y1="42" x2="190" y2="42" stroke="#f97316" strokeWidth="1" strokeDasharray="4 2" />
        <rect x="192" y="36" width="16" height="12" rx="2" fill="#f97316" />
        <text x="200" y="44" textAnchor="middle" className="text-[7px] fill-white font-medium">-15°</text>
        
        {/* Freezing curve */}
        <path 
          d="M 25 10 Q 40 12 50 18 Q 70 28 110 42 Q 140 58 160 72 Q 175 82 190 90" 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Single "On Target" point - green with halo effect */}
        <circle cx="110" cy="42" r="10" fill="#10b981" fillOpacity="0.15" />
        <circle cx="110" cy="42" r="6" fill="#10b981" stroke="white" strokeWidth="2" />
        
        {/* On target annotation with checkmark */}
        <g>
          <rect x="68" y="22" width="84" height="14" rx="3" fill="#10b981" />
          <text x="110" y="32" textAnchor="middle" className="text-[8px] fill-white font-medium">75% at -15°C  ✓</text>
        </g>
      </svg>
      
      <div className="text-center text-xs text-slate-400 font-sans mt-1">
        % Water Frozen (Hardness)
      </div>
    </div>
    
    {/* Legend - simplified for on-target */}
    <div className="flex items-center justify-center mt-3 pt-3 border-t border-slate-100 text-xs font-sans">
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <span className="text-emerald-700 font-medium">On target: 75%</span>
      </div>
    </div>
  </div>
);

// Demo showing both states side by side
export default function FreezingCurveStates() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Freezing Curve States</h1>
        <p className="text-slate-500 font-sans mb-8">Comparing off-target vs on-target visualization</p>
        
        <div className="grid grid-cols-2 gap-6">
          <FreezingCurveOffTarget />
          <FreezingCurveOnTarget />
        </div>
        
        {/* Logic explanation */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-serif font-medium text-slate-800 mb-3">Display Logic</h3>
          <div className="space-y-2 text-sm font-sans text-slate-600">
            <p><strong>Off target:</strong> Two points shown — blue (current) and green (target) with separate labels</p>
            <p><strong>On target:</strong> Single green point with halo effect, checkmark in label, simplified legend with success styling</p>
            <p><strong>Tolerance:</strong> Consider "on target" when within ±2% of target hardness</p>
          </div>
        </div>
      </div>
    </div>
  );
}
