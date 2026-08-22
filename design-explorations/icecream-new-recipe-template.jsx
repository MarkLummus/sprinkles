import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Printer, X, Sparkles } from 'lucide-react';

const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

export default function NewRecipeFromTemplate() {
  const [showDetails, setShowDetails] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showTemplateBanner, setShowTemplateBanner] = useState(true);
  const [recipeName, setRecipeName] = useState('Vanilla Gelato Base');
  
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };
  
  return (
    <div className="bg-slate-50 min-h-screen" onClick={() => setOpenDropdown(null)}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition font-sans text-sm">
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-lg">🍨</span>
            </div>
            <span className="font-serif font-semibold text-slate-800 text-lg">Sprinkles</span>
          </div>
        </div>
        
        <nav className="flex gap-1">
          {['Ingredients', 'Tools', 'Help'].map(item => (
            <button 
              key={item} 
              className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50"
            >
              {item}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-1">
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('scale'); }}
              className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition font-sans flex items-center gap-1"
            >
              Scale
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openDropdown === 'scale' && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Scale by amount</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Scale by ingredient</button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('optimize'); }}
              className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition font-sans flex items-center gap-1"
            >
              Optimize
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openDropdown === 'optimize' && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Balance to mean</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Balance to range</button>
              </div>
            )}
          </div>
          
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition">
            <Printer className="w-4 h-4" />
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('save'); }}
              className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans flex items-center gap-1"
            >
              Save
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openDropdown === 'save' && (
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Save to recipes</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Export to file</button>
                <div className="border-t border-slate-100 my-1" />
                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Store as ingredient</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Template Banner - dismissable */}
        {showTemplateBanner && (
          <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 font-sans">Started from Vanilla Gelato template</p>
                <p className="text-xs text-slate-500 font-sans">A balanced base ready to customize. Rename it, swap ingredients, make it yours.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowTemplateBanner(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Recipe Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <input 
                  type="text" 
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Recipe name"
                  className="text-2xl font-serif font-semibold text-slate-800 bg-transparent border-none outline-none focus:bg-blue-50 focus:rounded px-1 -ml-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full font-sans">
                  🧊 Gelato
                </span>
                <span className="text-slate-400 text-sm font-sans">142 kcal/100g</span>
                <span className="text-slate-400 text-sm font-sans">•</span>
                <span className="text-slate-400 text-sm font-sans">1.00 L yield</span>
              </div>
            </div>
            
            {/* Sliders - pre-filled with gelato defaults */}
            <div className="flex gap-6">
              {[
                { label: 'Serving', value: '-14', unit: '°C', min: '-25', max: '-8', percent: 65 },
                { label: 'Hardness', value: '70', unit: '%', min: '50', max: '90', percent: 50 },
                { label: 'Overrun', value: '25', unit: '%', min: '0', max: '100', percent: 25 },
              ].map(item => (
                <div key={item.label} className="w-36">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500 font-sans">{item.label}</span>
                    <div className="flex items-baseline">
                      <input 
                        type="text" 
                        defaultValue={item.value}
                        className="w-8 text-right font-medium text-slate-700 font-sans bg-transparent border-none outline-none focus:bg-blue-50 focus:rounded px-0.5 -mr-0.5"
                      />
                      <span className="text-slate-400 font-sans text-xs">{item.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-sans w-6 text-right">{item.min}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative cursor-pointer group">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all" 
                        style={{width: `${item.percent}%`}} 
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{left: `calc(${item.percent}% - 6px)`}}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans w-6">{item.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Left Column */}
          <div className="col-span-2 space-y-5">
            {/* Ingredients Table - Pre-filled vanilla gelato base */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-serif font-medium text-slate-800">Ingredients</h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-slate-500 hover:text-slate-700 font-sans flex items-center gap-1"
                  >
                    {showDetails ? 'Hide details' : 'Show details'}
                    {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-sans">
                    + Add ingredient
                  </button>
                </div>
              </div>
              <table className="w-full text-sm font-sans">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Name</th>
                    <th className="text-left px-3 py-3 font-medium">Category</th>
                    <th className="text-right px-3 py-3 font-medium">Amount</th>
                    {showDetails && (
                      <>
                        <th className="text-right px-3 py-3 font-medium">Water</th>
                        <th className="text-right px-3 py-3 font-medium">Sugar</th>
                        <th className="text-right px-3 py-3 font-medium">Fat</th>
                        <th className="text-right px-5 py-3 font-medium">PAC</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {[
                    { name: 'Whole Milk 3.5%', category: 'Base', categoryColor: 'bg-slate-100 text-slate-600', amount: '500g', water: '440', sugar: '24', fat: '17.5', pac: '24' },
                    { name: 'Heavy Cream 35%', category: 'Fat', categoryColor: 'bg-amber-50 text-amber-700', amount: '150g', water: '87', sugar: '4.4', fat: '52.5', pac: '4.4' },
                    { name: 'Sucrose', category: 'Sweetener', categoryColor: 'bg-yellow-50 text-yellow-700', amount: '130g', water: '', sugar: '130', fat: '', pac: '130' },
                    { name: 'Dextrose', category: 'Sweetener', categoryColor: 'bg-yellow-50 text-yellow-700', amount: '30g', water: '', sugar: '26', fat: '', pac: '50' },
                    { name: 'Skim Milk Powder', category: 'Base', categoryColor: 'bg-slate-100 text-slate-600', amount: '40g', water: '1.2', sugar: '21', fat: '0.4', pac: '21' },
                    { name: 'Vanilla Extract', category: 'Flavor', categoryColor: 'bg-blue-50 text-blue-700', amount: '8g', water: '4.2', sugar: '2.7', fat: '', pac: '4.5' },
                    { name: 'Stabilizer Blend', category: 'Stabilizer', categoryColor: 'bg-emerald-50 text-emerald-700', amount: '5g', water: '', sugar: '', fat: '', pac: '0.1' },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition group">
                      <td className="px-5 py-3">{row.name}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.categoryColor}`}>
                          {row.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-medium text-slate-600">{row.amount}</td>
                      {showDetails && (
                        <>
                          <td className="px-3 py-3 text-right text-slate-500">{row.water || '—'}</td>
                          <td className="px-3 py-3 text-right text-slate-500">{row.sugar || '—'}</td>
                          <td className="px-3 py-3 text-right text-slate-500">{row.fat || '—'}</td>
                          <td className="px-5 py-3 text-right text-slate-500">{row.pac || '—'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-medium">
                  <tr>
                    <td className="px-5 py-3 text-slate-700">Total</td>
                    <td className="px-3 py-3"></td>
                    <td className="px-3 py-3 text-right text-slate-700">863g</td>
                    {showDetails && (
                      <>
                        <td className="px-3 py-3 text-right text-slate-600">532</td>
                        <td className="px-3 py-3 text-right text-slate-600">208</td>
                        <td className="px-3 py-3 text-right text-slate-600">70</td>
                        <td className="px-5 py-3 text-right text-slate-600">234</td>
                      </>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Process Steps - Pre-filled */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-serif font-medium text-slate-800">Process</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-sans">
                  + Add step
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { step: 1, text: 'Combine milk, cream, and skim milk powder in a saucepan. Heat to 40°C, whisking until powder dissolves.', time: '5 min', temp: '40°C' },
                  { step: 2, text: 'Whisk in sugars and stabilizer until fully incorporated.', time: null, temp: null },
                  { step: 3, text: 'Heat to 85°C, stirring constantly. Hold for 2 minutes to pasteurize.', time: '10 min', temp: '85°C' },
                  { step: 4, text: 'Remove from heat. Add vanilla extract.', time: null, temp: null },
                  { step: 5, text: 'Cool in ice bath to 4°C. Refrigerate 4-12 hours to age.', time: '4-12 hr', temp: '4°C' },
                  { step: 6, text: 'Churn in batch freezer to 25% overrun, about -5°C.', time: '15-20 min', temp: '-5°C' },
                  { step: 7, text: 'Transfer to containers and harden in freezer.', time: '2-4 hr', temp: '-18°C' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 px-5 py-3 group hover:bg-slate-50 transition">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center font-sans">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 font-sans">{item.text}</p>
                    </div>
                    {(item.time || item.temp) && (
                      <div className="flex-shrink-0 flex items-start gap-2">
                        {item.temp && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded font-sans">
                            {item.temp}
                          </span>
                        )}
                        {item.time && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-medium rounded font-sans">
                            {item.time}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes - Empty but ready */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h2 className="font-serif font-medium text-slate-800">Notes</h2>
              </div>
              <div className="p-4">
                <textarea
                  placeholder="Add notes about this recipe... (e.g., variations to try, serving suggestions, results from batches)"
                  className="w-full h-20 px-3 py-2 text-sm font-sans text-slate-700 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Side Panel - All green (balanced template) */}
          <div className="space-y-5">
            {/* Balance Card - All on target */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-serif font-medium text-slate-800 mb-4">Recipe Balance</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base bg-emerald-50">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-slate-700 font-sans">PAC</span>
                      <span className="text-sm font-medium text-emerald-600 font-sans">234</span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans">Target: 230–250</div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1.5">
                      <div className="h-full w-3/4 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base bg-emerald-50">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-slate-700 font-sans">POD</span>
                      <span className="text-sm font-medium text-emerald-600 font-sans">118</span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans">Target: 110–120</div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1.5">
                      <div className="h-full w-4/5 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base bg-emerald-50">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-slate-700 font-sans">PAC:POD</span>
                      <span className="text-sm font-medium text-emerald-600 font-sans">1.98</span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans">Target: 1.8–2.2</div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1.5">
                      <div className="h-full w-3/4 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Composition Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-serif font-medium text-slate-800 mb-3">Composition</h3>
              <div className="space-y-2 text-sm font-sans">
                {[
                  { label: 'Water', value: '61.7%', color: 'bg-sky-400' },
                  { label: 'Solids', value: '38.3%', color: 'bg-slate-400' },
                  { label: 'Sugar', value: '24.1%', color: 'bg-amber-400' },
                  { label: 'Fat', value: '8.1%', color: 'bg-orange-300' },
                  { label: 'MSNF', value: '5.5%', color: 'bg-stone-300' },
                  { label: 'Stabilizer', value: '0.6%', color: 'bg-emerald-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-slate-500 flex-1">{item.label}</span>
                    <span className="text-slate-700 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Freezing Curve - On target */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-serif font-medium text-slate-800 mb-3">Freezing Curve</h3>
              <div className="relative h-48">
                <svg viewBox="0 0 210 120" className="w-full h-full">
                  <line x1="25" y1="10" x2="25" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="25" y1="100" x2="190" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                  
                  <line x1="25" y1="32" x2="190" y2="32" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="25" y1="55" x2="190" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="25" y1="77" x2="190" y2="77" stroke="#f1f5f9" strokeWidth="1" />
                  
                  <text x="20" y="15" textAnchor="end" className="text-[8px] fill-slate-400">0</text>
                  <text x="20" y="35" textAnchor="end" className="text-[8px] fill-slate-400">-10</text>
                  <text x="20" y="55" textAnchor="end" className="text-[8px] fill-slate-400">-20</text>
                  <text x="20" y="77" textAnchor="end" className="text-[8px] fill-slate-400">-30</text>
                  <text x="20" y="97" textAnchor="end" className="text-[8px] fill-slate-400">-40</text>
                  
                  <text x="25" y="110" textAnchor="start" className="text-[8px] fill-slate-400">0%</text>
                  <text x="107" y="110" textAnchor="middle" className="text-[8px] fill-slate-400">50%</text>
                  <text x="190" y="110" textAnchor="end" className="text-[8px] fill-slate-400">100%</text>
                  
                  <line x1="25" y1="38" x2="190" y2="38" stroke="#f97316" strokeWidth="1" strokeDasharray="4 2" />
                  <rect x="192" y="32" width="16" height="12" rx="2" fill="#f97316" />
                  <text x="200" y="40" textAnchor="middle" className="text-[7px] fill-white font-medium">-14°</text>
                  
                  <path 
                    d="M 25 10 Q 40 12 55 20 Q 80 32 110 50 Q 145 70 170 82 Q 185 90 190 94" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Single on-target point with halo */}
                  <circle cx="98" cy="38" r="10" fill="#10b981" fillOpacity="0.15" />
                  <circle cx="98" cy="38" r="6" fill="#10b981" stroke="white" strokeWidth="2" />
                  
                  <g>
                    <rect x="56" y="18" width="84" height="14" rx="3" fill="#10b981" />
                    <text x="98" y="28" textAnchor="middle" className="text-[8px] fill-white font-medium">70% at -14°C  ✓</text>
                  </g>
                </svg>
                
                <div className="text-center text-xs text-slate-400 font-sans mt-1">
                  % Water Frozen (Hardness)
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-3 pt-3 border-t border-slate-100 text-xs font-sans">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700 font-medium">On target: 70%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* FAB for AI Chat */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
      >
        <IceCreamIdle className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
