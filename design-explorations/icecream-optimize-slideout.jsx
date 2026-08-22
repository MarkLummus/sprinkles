import React, { useState } from 'react';
import { X, Zap, Lock, Unlock, ArrowRight, AlertTriangle, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function OptimizeSlideout() {
  const [optimizeOpen, setOptimizeOpen] = useState(true);
  const [lockedIngredients, setLockedIngredients] = useState(['vanilla']);
  const [showConflict, setShowConflict] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [allowYieldChange, setAllowYieldChange] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const toggleLock = (id) => {
    setLockedIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Current state - some values out of range
  const balanceMetrics = [
    { 
      id: 'pac', 
      name: 'PAC', 
      current: 210, 
      target: { min: 230, max: 250 }, 
      status: 'low',
      optimized: 238
    },
    { 
      id: 'pod', 
      name: 'POD', 
      current: 125, 
      target: { min: 110, max: 120 }, 
      status: 'high',
      optimized: 118
    },
    { 
      id: 'fat', 
      name: 'Fat', 
      current: 7.8, 
      target: { min: 3.5, max: 8 }, 
      unit: '%',
      status: 'ok',
      optimized: 7.8
    },
    { 
      id: 'sugar', 
      name: 'Sugar', 
      current: 24.5, 
      target: { min: 21, max: 24 }, 
      unit: '%',
      status: 'high',
      optimized: 23.2
    },
  ];

  const ingredients = [
    { id: 'milk', name: 'Whole Milk 3.5%', current: 500, optimized: 520, change: +20 },
    { id: 'cream', name: 'Heavy Cream 35%', current: 150, optimized: 150, change: 0 },
    { id: 'sucrose', name: 'Sucrose', current: 130, optimized: 95, change: -35 },
    { id: 'dextrose', name: 'Dextrose', current: 30, optimized: 55, change: +25 },
    { id: 'smp', name: 'Skim Milk Powder', current: 40, optimized: 40, change: 0 },
    { id: 'vanilla', name: 'Vanilla Extract', current: 8, optimized: 8, change: 0, locked: true },
    { id: 'stabilizer', name: 'Stabilizer Blend', current: 5, optimized: 5, change: 0 },
  ];

  const outOfRangeCount = balanceMetrics.filter(m => m.status !== 'ok').length;
  const changedIngredients = ingredients.filter(i => i.change !== 0 && !lockedIngredients.includes(i.id));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Preview */}
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Optimize Slideout</h1>
        <p className="text-slate-500 font-sans mb-4">Automatically balance recipe to target ranges</p>
        
        {/* Demo Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3 font-sans">Demo states:</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => { setShowConflict(false); setShowSuccess(false); setOptimizeOpen(true); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${!showConflict && !showSuccess ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Normal (can optimize)
            </button>
            <button 
              onClick={() => { setShowConflict(true); setShowSuccess(false); setOptimizeOpen(true); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${showConflict ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Conflict (can't optimize)
            </button>
            <button 
              onClick={() => { setShowConflict(false); setShowSuccess(true); setOptimizeOpen(true); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${showSuccess ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Already balanced
            </button>
          </div>
        </div>

        {/* Trigger Button Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-600 font-sans">From header actions:</span>
            <button 
              onClick={() => setOptimizeOpen(true)}
              className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition font-sans flex items-center gap-2 border border-slate-200"
            >
              <Zap className="w-4 h-4" />
              Optimize
            </button>
          </div>
        </div>
      </div>

      {/* Optimize Slideout */}
      <div 
        className={`fixed top-0 right-0 h-full w-[440px] bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          optimizeOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              showSuccess ? 'bg-emerald-100' : showConflict ? 'bg-amber-100' : 'bg-violet-100'
            }`}>
              <Zap className={`w-5 h-5 ${
                showSuccess ? 'text-emerald-600' : showConflict ? 'text-amber-600' : 'text-violet-600'
              }`} />
            </div>
            <div>
              <h2 className="font-serif font-semibold text-slate-800 text-lg">Optimize Recipe</h2>
              <p className="text-xs text-slate-500 font-sans">
                {showSuccess 
                  ? 'All metrics in range' 
                  : `${outOfRangeCount} metrics out of range`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={() => setOptimizeOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Already Balanced State */}
          {showSuccess && (
            <div className="p-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-medium text-emerald-800 font-sans mb-2">Recipe is balanced</h3>
                <p className="text-sm text-emerald-700 font-sans">
                  All metrics are within target ranges. No changes needed.
                </p>
              </div>
              
              {/* Show current metrics */}
              <div className="mt-6 space-y-3">
                {balanceMetrics.map(metric => (
                  <div key={metric.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600 font-sans">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-emerald-600 font-sans">
                        {metric.current}{metric.unit || ''}
                      </span>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conflict State */}
          {showConflict && !showSuccess && (
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 font-sans">Can't optimize with current constraints</h4>
                    <p className="text-sm text-amber-700 font-sans mt-1">
                      Keeping yield fixed and Vanilla Extract locked makes it impossible to reach target ranges.
                    </p>
                  </div>
                </div>
                
                {/* Options to resolve */}
                <div className="mt-4 space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 cursor-pointer hover:border-amber-300 transition">
                    <input
                      type="checkbox"
                      checked={allowYieldChange}
                      onChange={(e) => setAllowYieldChange(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700 font-sans">Allow yield to change</span>
                      <p className="text-xs text-slate-500 font-sans">Final batch size may differ from 1.00 L</p>
                    </div>
                  </label>
                  
                  <button 
                    onClick={() => toggleLock('vanilla')}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition text-left"
                  >
                    <Unlock className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-sm font-medium text-slate-700 font-sans">Unlock Vanilla Extract</span>
                      <p className="text-xs text-slate-500 font-sans">Allow optimizer to adjust this ingredient</p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Still show what's out of range */}
              <h3 className="text-sm font-medium text-slate-700 font-sans mb-3">Current Issues</h3>
              <div className="space-y-2">
                {balanceMetrics.filter(m => m.status !== 'ok').map(metric => (
                  <div key={metric.id} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-slate-700 font-sans">{metric.name}</span>
                    <div className="flex items-center gap-2 text-sm font-sans">
                      <span className="font-medium text-red-600">{metric.current}{metric.unit || ''}</span>
                      <span className="text-slate-400">
                        (target: {metric.target.min}–{metric.target.max})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Normal Optimization State */}
          {!showConflict && !showSuccess && (
            <>
              {/* What's out of range */}
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-700 font-sans mb-3">Balance Issues</h3>
                <div className="space-y-2">
                  {balanceMetrics.map(metric => {
                    const isOk = metric.status === 'ok';
                    return (
                      <div 
                        key={metric.id} 
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          isOk ? 'bg-slate-50' : 'bg-red-50'
                        }`}
                      >
                        <span className="text-sm text-slate-700 font-sans">{metric.name}</span>
                        <div className="flex items-center gap-3 text-sm font-sans">
                          <span className={`font-medium ${isOk ? 'text-slate-600' : 'text-red-600'}`}>
                            {metric.current}{metric.unit || ''}
                          </span>
                          {!isOk && (
                            <>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-emerald-600">
                                {metric.optimized}{metric.unit || ''}
                              </span>
                            </>
                          )}
                          {isOk && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proposed Changes */}
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-medium text-slate-700 font-sans mb-3">Proposed Changes</h3>
                <div className="space-y-1">
                  {ingredients.map((ing) => {
                    const isLocked = lockedIngredients.includes(ing.id);
                    const hasChange = ing.change !== 0;
                    
                    return (
                      <div 
                        key={ing.id} 
                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                          isLocked ? 'bg-slate-100' : hasChange ? 'bg-blue-50' : 'bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleLock(ing.id)}
                            className={`p-1 rounded transition ${
                              isLocked 
                                ? 'text-slate-500 hover:text-slate-700' 
                                : 'text-slate-300 hover:text-slate-500'
                            }`}
                            title={isLocked ? 'Unlock ingredient' : 'Lock ingredient'}
                          >
                            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <span className={`text-sm font-sans ${isLocked ? 'text-slate-500' : 'text-slate-700'}`}>
                            {ing.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-sans">
                          {isLocked ? (
                            <span className="text-slate-400">{ing.current}g (locked)</span>
                          ) : hasChange ? (
                            <>
                              <span className="text-slate-400">{ing.current}g</span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="font-medium text-blue-600">{ing.optimized}g</span>
                              <span className={`text-xs ${ing.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                ({ing.change > 0 ? '+' : ''}{ing.change})
                              </span>
                            </>
                          ) : (
                            <span className="text-slate-500">{ing.current}g</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="text-xs text-slate-500 font-sans mt-3">
                  Click the lock icon to prevent an ingredient from being changed
                </p>
              </div>

              {/* Advanced Options - collapsed by default */}
              <div className="px-6 py-4 border-b border-slate-100">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-sm text-slate-600 font-sans"
                >
                  <span>Advanced options</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!allowYieldChange}
                        onChange={(e) => setAllowYieldChange(!e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-600 font-sans">Keep total yield fixed (1.00 L)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-6 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600 font-sans">Ingredients changed</span>
                  <span className="text-sm font-medium text-slate-700 font-sans">
                    {changedIngredients.length} of {ingredients.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-sans">New yield</span>
                  <span className="text-sm font-medium text-slate-700 font-sans">1.00 L</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          {showSuccess ? (
            <button 
              onClick={() => setOptimizeOpen(false)}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition font-sans"
            >
              Done
            </button>
          ) : showConflict ? (
            <div className="flex gap-3">
              <button 
                onClick={() => setOptimizeOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition font-sans"
              >
                Cancel
              </button>
              <button 
                disabled={!allowYieldChange}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition font-sans ${
                  allowYieldChange 
                    ? 'text-white bg-blue-500 hover:bg-blue-600' 
                    : 'text-slate-400 bg-slate-200 cursor-not-allowed'
                }`}
              >
                Retry Optimization
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setOptimizeOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={() => setOptimizeOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition font-sans"
              >
                Apply Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {optimizeOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setOptimizeOpen(false)}
        />
      )}
    </div>
  );
}
