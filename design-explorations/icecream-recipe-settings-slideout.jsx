import React, { useState } from 'react';
import { X, Pencil, ChevronRight, AlertCircle, Check } from 'lucide-react';

export default function RecipeSettingsSlideout() {
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [selectedType, setSelectedType] = useState('gelato');
  const [pendingType, setPendingType] = useState(null);
  
  // Frozen dessert types with FDA/industry standard targets
  const dessertTypes = {
    gelato: {
      name: 'Gelato',
      icon: '🍨',
      description: 'Italian-style, dense and intensely flavored',
      targets: {
        fat: { min: 3.5, max: 8, unit: '%' },
        sugar: { min: 21, max: 24, unit: '%' },
        msnf: { min: 7, max: 11, unit: '%' },
        solids: { min: 36, max: 42, unit: '%' },
        overrun: { min: 20, max: 35, unit: '%' },
        servingTemp: { min: -14, max: -11, unit: '°C' },
        hardness: { min: 65, max: 75, unit: '%' },
      }
    },
    iceCream: {
      name: 'Ice Cream',
      icon: '🍦',
      description: 'Standard (10% min butterfat, FDA)',
      targets: {
        fat: { min: 10, max: 12, unit: '%' },
        sugar: { min: 14, max: 17, unit: '%' },
        msnf: { min: 9, max: 12, unit: '%' },
        solids: { min: 36, max: 40, unit: '%' },
        overrun: { min: 80, max: 100, unit: '%' },
        servingTemp: { min: -16, max: -14, unit: '°C' },
        hardness: { min: 70, max: 80, unit: '%' },
      }
    },
    premiumIceCream: {
      name: 'Premium Ice Cream',
      icon: '🍦',
      description: '14% min butterfat, lower overrun',
      targets: {
        fat: { min: 14, max: 16, unit: '%' },
        sugar: { min: 14, max: 16, unit: '%' },
        msnf: { min: 8, max: 10, unit: '%' },
        solids: { min: 38, max: 42, unit: '%' },
        overrun: { min: 60, max: 80, unit: '%' },
        servingTemp: { min: -15, max: -13, unit: '°C' },
        hardness: { min: 72, max: 80, unit: '%' },
      }
    },
    superPremiumIceCream: {
      name: 'Super Premium',
      icon: '🍦',
      description: '16%+ butterfat, dense and rich',
      targets: {
        fat: { min: 16, max: 20, unit: '%' },
        sugar: { min: 13, max: 15, unit: '%' },
        msnf: { min: 6, max: 9, unit: '%' },
        solids: { min: 40, max: 45, unit: '%' },
        overrun: { min: 20, max: 50, unit: '%' },
        servingTemp: { min: -14, max: -12, unit: '°C' },
        hardness: { min: 68, max: 78, unit: '%' },
      }
    },
    sorbet: {
      name: 'Sorbet',
      icon: '🍧',
      description: 'Fruit-based, dairy-free',
      targets: {
        fat: { min: 0, max: 0, unit: '%' },
        sugar: { min: 28, max: 32, unit: '%' },
        msnf: { min: 0, max: 0, unit: '%' },
        solids: { min: 30, max: 35, unit: '%' },
        overrun: { min: 15, max: 25, unit: '%' },
        servingTemp: { min: -12, max: -10, unit: '°C' },
        hardness: { min: 55, max: 65, unit: '%' },
      }
    },
    sherbet: {
      name: 'Sherbet',
      icon: '🍧',
      description: '1-2% butterfat, fruit-forward',
      targets: {
        fat: { min: 1, max: 2, unit: '%' },
        sugar: { min: 25, max: 30, unit: '%' },
        msnf: { min: 2, max: 5, unit: '%' },
        solids: { min: 32, max: 38, unit: '%' },
        overrun: { min: 30, max: 50, unit: '%' },
        servingTemp: { min: -13, max: -11, unit: '°C' },
        hardness: { min: 60, max: 70, unit: '%' },
      }
    },
    frozenYogurt: {
      name: 'Frozen Yogurt',
      icon: '🥛',
      description: 'Tangy, cultured dairy base',
      targets: {
        fat: { min: 2, max: 6, unit: '%' },
        sugar: { min: 18, max: 22, unit: '%' },
        msnf: { min: 8, max: 14, unit: '%' },
        solids: { min: 32, max: 38, unit: '%' },
        overrun: { min: 30, max: 50, unit: '%' },
        servingTemp: { min: -12, max: -10, unit: '°C' },
        hardness: { min: 60, max: 70, unit: '%' },
      }
    },
  };

  const currentType = dessertTypes[selectedType];
  const previewType = pendingType ? dessertTypes[pendingType] : null;

  // Calculate what changes between current and pending type
  const getChanges = () => {
    if (!previewType) return [];
    const changes = [];
    const targets = ['fat', 'sugar', 'overrun', 'servingTemp', 'hardness'];
    const labels = {
      fat: 'Fat',
      sugar: 'Sugar', 
      overrun: 'Overrun',
      servingTemp: 'Serving Temp',
      hardness: 'Hardness'
    };
    
    targets.forEach(key => {
      const current = currentType.targets[key];
      const pending = previewType.targets[key];
      if (current.min !== pending.min || current.max !== pending.max) {
        changes.push({
          label: labels[key],
          from: `${current.min}–${current.max}${current.unit}`,
          to: `${pending.min}–${pending.max}${pending.unit}`,
        });
      }
    });
    return changes;
  };

  const changes = getChanges();

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Simulated Header Card */}
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Recipe Settings Slideout</h1>
        <p className="text-slate-500 font-sans mb-8">Click pencil icon to open settings panel</p>

        {/* Recipe Header Card Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-serif font-semibold text-slate-800">Vanilla Gelato Base</span>
                <button 
                  onClick={() => setSettingsOpen(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  title="Recipe settings"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full font-sans">
                  {currentType.icon} {currentType.name}
                </span>
                <span className="text-slate-400 text-sm font-sans">142 kcal/100g</span>
                <span className="text-slate-400 text-sm font-sans">•</span>
                <span className="text-slate-400 text-sm font-sans">1.00 L yield</span>
              </div>
            </div>
            
            {/* Sliders Preview */}
            <div className="flex gap-6">
              {[
                { label: 'Serving', value: `${currentType.targets.servingTemp.min}`, unit: '°C' },
                { label: 'Hardness', value: `${currentType.targets.hardness.min}`, unit: '%' },
                { label: 'Overrun', value: `${currentType.targets.overrun.min}`, unit: '%' },
              ].map(item => (
                <div key={item.label} className="w-28 text-center">
                  <span className="text-slate-500 text-sm font-sans">{item.label}</span>
                  <div className="font-medium text-slate-700 font-sans">{item.value}{item.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Slideout */}
      <div 
        className={`fixed top-0 right-0 h-full w-[420px] bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          settingsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-serif font-semibold text-slate-800 text-lg">Recipe Settings</h2>
          <button 
            onClick={() => { setSettingsOpen(false); setPendingType(null); }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Type Selection */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 font-sans mb-3">Dessert Type</h3>
            <div className="space-y-2">
              {Object.entries(dessertTypes).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key !== selectedType) {
                      setPendingType(key);
                    } else {
                      setPendingType(null);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition text-left ${
                    key === selectedType
                      ? 'border-blue-500 bg-blue-50'
                      : key === pendingType
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium font-sans ${
                        key === selectedType ? 'text-blue-700' : 
                        key === pendingType ? 'text-amber-700' : 'text-slate-700'
                      }`}>
                        {type.name}
                      </span>
                      {key === selectedType && (
                        <span className="text-xs text-blue-600 font-sans">Current</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-sans">{type.description}</span>
                  </div>
                  {key === selectedType && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                  {key === pendingType && (
                    <ChevronRight className="w-5 h-5 text-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Change Preview */}
          {pendingType && changes.length > 0 && (
            <div className="p-6 bg-amber-50 border-b border-amber-100">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 font-sans">
                    Switching to {dessertTypes[pendingType].name}
                  </h4>
                  <p className="text-sm text-amber-700 font-sans">Target ranges will change:</p>
                </div>
              </div>
              <div className="space-y-2 ml-7">
                {changes.map((change, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-sans">
                    <span className="text-amber-700 w-24">{change.label}</span>
                    <span className="text-amber-600 line-through">{change.from}</span>
                    <ChevronRight className="w-3 h-3 text-amber-500" />
                    <span className="text-amber-800 font-medium">{change.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yield */}
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 font-sans mb-3">Batch Yield</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                defaultValue="1.00"
                className="w-24 px-3 py-2 text-right font-medium text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-sans"
              />
              <select className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-sans focus:outline-none focus:border-blue-500">
                <option>Liters</option>
                <option>Quarts</option>
                <option>Gallons</option>
                <option>Grams</option>
              </select>
            </div>
          </div>

          {/* Serving Parameters */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-slate-700 font-sans mb-4">Serving Parameters</h3>
            
            {/* Serving Temperature */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-sans">Serving Temperature</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    defaultValue={currentType.targets.servingTemp.min}
                    className="w-12 px-2 py-1 text-right font-medium text-slate-700 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-sans text-sm"
                  />
                  <span className="text-slate-400 text-sm">°C</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-10 text-right">-25°</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full relative">
                  <div className="absolute h-full bg-blue-200 rounded-full" style={{ left: '20%', width: '15%' }} />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"
                    style={{ left: 'calc(35% - 8px)' }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-10">-8°</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-sans">
                Target: {currentType.targets.servingTemp.min}° to {currentType.targets.servingTemp.max}°C
              </div>
            </div>

            {/* Hardness */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-sans">Hardness (% Water Frozen)</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    defaultValue={currentType.targets.hardness.min}
                    className="w-12 px-2 py-1 text-right font-medium text-slate-700 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-sans text-sm"
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-10 text-right">50%</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full relative">
                  <div className="absolute h-full bg-blue-200 rounded-full" style={{ left: '37%', width: '25%' }} />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"
                    style={{ left: 'calc(37% - 8px)' }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-10">90%</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-sans">
                Target: {currentType.targets.hardness.min}–{currentType.targets.hardness.max}%
              </div>
            </div>

            {/* Overrun */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 font-sans">Overrun (Air Content)</span>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    defaultValue={currentType.targets.overrun.min}
                    className="w-12 px-2 py-1 text-right font-medium text-slate-700 border border-slate-200 rounded focus:outline-none focus:border-blue-500 font-sans text-sm"
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-10 text-right">0%</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full relative">
                  <div className="absolute h-full bg-blue-200 rounded-full" style={{ left: '20%', width: '15%' }} />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"
                    style={{ left: 'calc(20% - 8px)' }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-10">100%</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-sans">
                Target: {currentType.targets.overrun.min}–{currentType.targets.overrun.max}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          {pendingType ? (
            <div className="flex gap-3">
              <button 
                onClick={() => setPendingType(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={() => { setSelectedType(pendingType); setPendingType(null); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition font-sans"
              >
                Apply Changes
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSettingsOpen(false)}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition font-sans"
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {settingsOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => { setSettingsOpen(false); setPendingType(null); }}
        />
      )}
    </div>
  );
}
