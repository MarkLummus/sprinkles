import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Printer, X } from 'lucide-react';

// Custom icons
const ConeSend = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 8 L20 12 L4 16" />
  </svg>
);

// Icon components
const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

const IceCreamReady = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
    <circle cx="4" cy="5" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="20" cy="6" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
    </circle>
    <circle cx="3" cy="11" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
    </circle>
    <circle cx="21" cy="10" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1.5s" />
    </circle>
  </svg>
);

const IceCreamActive = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
    <g>
      <circle cx="6" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="0;6;6" dur="1.2s" repeatCount="indefinite" keyTimes="0;0.5;1" />
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" keyTimes="0;0.4;1" />
      </circle>
      <circle cx="18" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="0;7;7" dur="1s" repeatCount="indefinite" keyTimes="0;0.6;1" begin="0.3s" />
        <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.3s" />
      </circle>
      <circle cx="4" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="2;10;10" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.6s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.4;1" begin="0.6s" />
      </circle>
      <circle cx="20" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="1;9;9" dur="1.1s" repeatCount="indefinite" keyTimes="0;0.55;1" begin="0.15s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.1s" repeatCount="indefinite" keyTimes="0;0.45;1" begin="0.15s" />
      </circle>
      <circle cx="10" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="-2;4;4" dur="0.9s" repeatCount="indefinite" keyTimes="0;0.6;1" begin="0.45s" />
        <animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.45s" />
      </circle>
      <circle cx="14" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="-1;5;5" dur="1.3s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.75s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.3s" repeatCount="indefinite" keyTimes="0;0.4;1" begin="0.75s" />
      </circle>
    </g>
  </svg>
);

export default function HybridConcept() {
  const [showDetails, setShowDetails] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [aiState, setAiState] = useState('ready'); // 'idle', 'ready', 'active'
  
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleOpenChat = () => {
    setChatOpen(true);
    setAiState('ready');
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setAiState('idle');
  };

  // Simulate AI thinking when sending a message
  const handleSend = () => {
    if (chatInput.trim()) {
      setAiState('active');
      setChatInput('');
      // Simulate response time
      setTimeout(() => setAiState('ready'), 3000);
    }
  };
  
  const sampleConversation = [
    { role: 'user', content: 'This recipe was too hard when it came out of the freezer. How can I fix it?' },
    { role: 'assistant', content: 'Looking at your Asian Pear Goat Cheese recipe, I can see your POD is at 121 which is just slightly above the target range of 110-120. However, your PAC at 232 is good.\n\nTo soften the texture, you could:\n\n1. **Increase POD slightly** — swap some sucrose for dextrose or add a touch of invert sugar\n\n2. **Raise serving temperature** — your current -15°C is on the colder side for gelato; try -12°C to -13°C\n\n3. **Reduce overrun** — at 23%, lowering to 18-20% can help with scoopability\n\nWant me to adjust the recipe to target a softer texture?' },
  ];
  
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
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🍨</span>
          </div>
          <span className="font-serif font-semibold text-slate-800 text-lg">Sprinkles</span>
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
        
        <div className="flex items-center gap-2">
          {/* Scale Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('scale'); }}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition font-sans flex items-center gap-1"
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
          
          {/* Optimize Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('optimize'); }}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition font-sans flex items-center gap-1"
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
          
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <Printer className="w-4 h-4" />
          </button>
          
          {/* Save Dropdown */}
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
        {/* Compact Recipe Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <input 
                  type="text" 
                  defaultValue="Asian Pear Goat Cheese" 
                  className="text-2xl font-serif font-semibold text-slate-800 bg-transparent border-none outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full font-sans">
                  🧊 Gelato
                </span>
                <span className="text-slate-400 text-sm font-sans">125 kcal/100g</span>
                <span className="text-slate-400 text-sm font-sans">•</span>
                <span className="text-slate-400 text-sm font-sans">2.87 L yield</span>
              </div>
            </div>
            
            {/* Compact Sliders */}
            <div className="flex gap-6">
              {[
                { label: 'Serving', value: '-15', unit: '°C', min: '-25', max: '-8', percent: 59 },
                { label: 'Hardness', value: '75', unit: '%', min: '50', max: '90', percent: 63 },
                { label: 'Overrun', value: '23', unit: '%', min: '0', max: '100', percent: 23 },
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
                      {/* Slider thumb indicator on hover */}
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
          {/* Left Column - Ingredients + Notes */}
          <div className="col-span-2 space-y-5">
            {/* Ingredients Table */}
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
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Whole Milk 3.3%', category: 'Base', categoryColor: 'bg-slate-100 text-slate-600', amount: '794g', water: '700', sugar: '38.2', fat: '25.4', pac: '38.2' },
                  { name: 'Cream, heavy', category: 'Fat', categoryColor: 'bg-amber-50 text-amber-700', amount: '175g', water: '101', sugar: '5.11', fat: '63.1', pac: '5.11' },
                  { name: 'Sucrose', category: 'Sweetener', categoryColor: 'bg-yellow-50 text-yellow-700', amount: '98g', water: '', sugar: '98', fat: '', pac: '98' },
                  { name: 'Dextrose', category: 'Sweetener', categoryColor: 'bg-yellow-50 text-yellow-700', amount: '80g', water: '', sugar: '70', fat: '', pac: '133' },
                  { name: 'Dried Skimmed Milk Powder', category: 'Base', categoryColor: 'bg-slate-100 text-slate-600', amount: '68g', water: '1.36', sugar: '35', fat: '0.61', pac: '35.4' },
                  { name: 'Asian Pear, freeze dried', category: 'Flavor', categoryColor: 'bg-purple-50 text-purple-700', amount: '60g', water: '', sugar: '26.5', fat: '0.24', pac: '49.9' },
                  { name: 'Goat Cheese', category: 'Flavor', categoryColor: 'bg-purple-50 text-purple-700', amount: '100g', water: '45.5', sugar: '', fat: '29.8', pac: '' },
                  { name: 'Stabilizer Mix 4421', category: 'Stabilizer', categoryColor: 'bg-green-50 text-green-700', amount: '8.8g', water: '0.72', sugar: '', fat: '0.02', pac: '0.08' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition group">
                    <td className="px-5 py-3 text-slate-800">{row.name}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.categoryColor}`}>
                        {row.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600 font-medium">{row.amount}</td>
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
                  <td className="px-3 py-3 text-right text-slate-700">2,562g</td>
                  {showDetails && (
                    <>
                      <td className="px-3 py-3 text-right text-slate-600">1,868</td>
                      <td className="px-3 py-3 text-right text-slate-600">398</td>
                      <td className="px-3 py-3 text-right text-slate-600">120</td>
                      <td className="px-5 py-3 text-right text-slate-600">594</td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-serif font-medium text-slate-800">Process</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-sans">
                  + Add step
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { step: 1, text: 'Combine milk, cream, and goat cheese in a saucepan. Heat to 40°C, whisking until cheese is incorporated.', time: '5 min', temp: '40°C' },
                  { step: 2, text: 'Whisk in sugars, milk powder, and stabilizer until fully dissolved.', time: null, temp: null },
                  { step: 3, text: 'Pasteurize: bring to 85°C and hold for 2 minutes, stirring constantly.', time: '10 min', temp: '85°C' },
                  { step: 4, text: 'Strain through fine mesh, then cool in ice bath to 4°C. Refrigerate overnight to age.', time: '12 hr', temp: '4°C' },
                  { step: 5, text: 'Add freeze-dried Asian pear to base. Churn in batch freezer to 23% overrun.', time: '20 min', temp: '-5°C' },
                  { step: 6, text: 'Transfer to containers and harden in blast freezer.', time: '4 hr', temp: '-35°C' },
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

            {/* Notes */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h2 className="font-serif font-medium text-slate-800">Notes</h2>
              </div>
              <div className="p-4">
                <textarea
                  placeholder="Add notes about this recipe... (e.g., serving suggestions, variations tried, pairing ideas)"
                  className="w-full h-24 px-3 py-2 text-sm font-sans text-slate-700 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                  defaultValue="First batch was slightly too sweet. Next time reduce sucrose by 10g. Pairs well with almond biscotti."
                />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-5">
            {/* Balance Card */}
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
                      <span className="text-sm font-medium text-emerald-600 font-sans">232</span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans">Target: 220–230</div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1.5">
                      <div className="h-full w-4/5 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base bg-amber-50">
                    ↑
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-slate-700 font-sans">POD</span>
                      <span className="text-sm font-medium text-amber-600 font-sans">121</span>
                    </div>
                    <div className="text-xs text-slate-400 font-sans">Target: 110–120</div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1.5">
                      <div className="h-full w-full bg-amber-400 rounded-full" />
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
                      <span className="text-sm font-medium text-emerald-600 font-sans">1.92</span>
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
                  { label: 'Water', value: '72.9%', color: 'bg-blue-400' },
                  { label: 'Solids', value: '27.0%', color: 'bg-slate-400' },
                  { label: 'Sugar', value: '15.5%', color: 'bg-yellow-400' },
                  { label: 'Fat', value: '4.7%', color: 'bg-amber-400' },
                  { label: 'MSNF', value: '5.7%', color: 'bg-slate-300' },
                  { label: 'Stabilizer', value: '0.19%', color: 'bg-green-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-slate-500 flex-1">{item.label}</span>
                    <span className="text-slate-700 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Freezing Curve Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-serif font-medium text-slate-800 mb-3">Freezing Curve</h3>
              <div className="relative h-48">
                <svg viewBox="0 0 210 120" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="25" y1="10" x2="25" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                  <line x1="25" y1="100" x2="190" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                  
                  {/* Horizontal grid lines for reference */}
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
                  
                  {/* Serving temperature dashed line - full width */}
                  <line x1="25" y1="42" x2="190" y2="42" stroke="#f97316" strokeWidth="1" strokeDasharray="4 2" />
                  {/* Serving temp label - moved inside viewBox */}
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
                  
                  {/* Current recipe point - where curve intersects serving temp */}
                  <circle cx="90" cy="42" r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
                  {/* Current annotation - wider pill with more padding */}
                  <g>
                    <rect x="50" y="22" width="64" height="14" rx="3" fill="#3b82f6" />
                    <text x="82" y="32" textAnchor="middle" className="text-[8px] fill-white font-medium">64% at -15°C</text>
                  </g>
                  
                  {/* Desired hardness point - target 75% */}
                  <circle cx="130" cy="62" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                  {/* Desired annotation - wider pill with more padding */}
                  <g>
                    <rect x="96" y="68" width="68" height="14" rx="3" fill="#10b981" />
                    <text x="130" y="78" textAnchor="middle" className="text-[8px] fill-white font-medium">75% at -18°C</text>
                  </g>
                </svg>
                
                {/* X-axis label */}
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

          </div>
        </div>
      </main>
      
      {/* Chat Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              {aiState === 'active' ? (
                <IceCreamActive className="w-5 h-5 text-white" />
              ) : (
                <IceCreamReady className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-serif font-medium text-slate-800">Recipe Assistant</h3>
              <p className="text-xs text-slate-400 font-sans">
                {aiState === 'active' ? 'Sprinkling...' : 'Viewing: Asian Pear Goat Cheese'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleCloseChat}
            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {sampleConversation.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                  <IceCreamIdle className="w-4 h-4 text-white" />
                </div>
              )}
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-sans ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-md' 
                    : 'bg-slate-100 text-slate-700 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {/* Sprinkling indicator */}
          {aiState === 'active' && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                <IceCreamActive className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-sm text-slate-500 font-sans">Sprinkling...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Input */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your recipe..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={aiState === 'active'}
            />
            <button 
              onClick={handleSend}
              disabled={aiState === 'active'}
              className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl transition"
            >
              <ConeSend className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center font-sans">
            AI can read and suggest changes to your recipe
          </p>
        </div>
      </div>
      
      {/* Floating Action Button */}
      {!chatOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
        >
          <IceCreamIdle className="w-7 h-7 text-white" />
        </button>
      )}
    </div>
  );
}
