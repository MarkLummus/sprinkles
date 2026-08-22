import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Printer, X } from 'lucide-react';

// Custom icons
const ConeSend = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 8 L20 12 L4 16" />
  </svg>
);

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
      <circle cx="6" cy="0" r="1.5" fill={color} stroke="none">
        <animate attributeName="cy" values="0;6;6" dur="1.2s" repeatCount="indefinite" keyTimes="0;0.5;1" />
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" keyTimes="0;0.4;1" />
      </circle>
      <circle cx="18" cy="0" r="1.5" fill={color} stroke="none">
        <animate attributeName="cy" values="0;7;7" dur="1s" repeatCount="indefinite" keyTimes="0;0.6;1" begin="0.3s" />
        <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.3s" />
      </circle>
      <circle cx="4" cy="0" r="1.5" fill={color} stroke="none">
        <animate attributeName="cy" values="2;10;10" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.6s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.4;1" begin="0.6s" />
      </circle>
      <circle cx="20" cy="0" r="1.5" fill={color} stroke="none">
        <animate attributeName="cy" values="1;9;9" dur="1.1s" repeatCount="indefinite" keyTimes="0;0.55;1" begin="0.15s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.1s" repeatCount="indefinite" keyTimes="0;0.45;1" begin="0.15s" />
      </circle>
      <circle cx="10" cy="0" r="1.5" fill={color} stroke="none">
        <animate attributeName="cy" values="-2;4;4" dur="0.9s" repeatCount="indefinite" keyTimes="0;0.6;1" begin="0.45s" />
        <animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.45s" />
      </circle>
      <circle cx="14" cy="0" r="1.5" fill={color} stroke="none">
        <animate attributeName="cy" values="-1;5;5" dur="1.3s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.75s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.3s" repeatCount="indefinite" keyTimes="0;0.4;1" begin="0.75s" />
      </circle>
    </g>
  </svg>
);

export default function MintWarmPalette() {
  const [showDetails, setShowDetails] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [aiState, setAiState] = useState('ready');
  
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

  const handleSend = () => {
    if (chatInput.trim()) {
      setAiState('active');
      setChatInput('');
      setTimeout(() => setAiState('ready'), 3000);
    }
  };
  
  const sampleConversation = [
    { role: 'user', content: 'This recipe was too hard when it came out of the freezer. How can I fix it?' },
    { role: 'assistant', content: 'Looking at your Asian Pear Goat Cheese recipe, I can see your POD is at 121 which is just slightly above the target range.\n\nTo soften the texture, you could:\n\n1. Swap some sucrose for dextrose\n2. Raise serving temperature to -12°C\n3. Reduce overrun to 18-20%\n\nWant me to adjust the recipe?' },
  ];

  // Color tokens - Mint + Warm Neutral
  const colors = {
    // Warm neutrals
    bgPage: '#FAF8F6',        // Warm off-white
    bgCard: '#FFFFFF',
    bgCardAlt: '#F5F2EF',     // Warm gray
    bgHover: '#F0EBE6',
    
    // Borders
    border: '#E8E2DB',
    borderLight: '#F0EBE6',
    
    // Text
    textPrimary: '#3D3730',   // Warm dark brown
    textSecondary: '#6B635A',
    textMuted: '#9C958C',
    
    // Mint accent
    mint: '#6BBAA8',          // Primary mint
    mintLight: '#E8F5F1',     // Light mint bg
    mintDark: '#4A9A8A',      // Darker mint for hover
    
    // Amber accent (warm complement)
    amber: '#D4A574',
    amberLight: '#FDF6EE',
    
    // Status colors
    success: '#6BBAA8',       // Use mint for success
    warning: '#D4A574',       // Use amber for warning
    error: '#C97B7B',
  };
  
  return (
    <div style={{ backgroundColor: colors.bgPage }} className="min-h-screen" onClick={() => setOpenDropdown(null)}>
      {/* Header */}
      <header style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 transition font-sans text-sm" style={{ color: colors.textSecondary }}>
            <ArrowLeft className="w-4 h-4" />
            Recipes
          </button>
          <div style={{ backgroundColor: colors.border }} className="w-px h-6" />
          <div className="flex items-center gap-2">
            <div style={{ background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <IceCreamIdle className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-semibold text-lg" style={{ color: colors.textPrimary }}>Sprinkles</span>
          </div>
        </div>
        
        <nav className="flex gap-1">
          {['Recipe', 'Ingredients', 'Tools', 'Help'].map(item => (
            <button 
              key={item} 
              className="px-4 py-2 text-sm rounded-lg transition font-sans"
              style={{ 
                backgroundColor: item === 'Recipe' ? colors.bgCardAlt : 'transparent',
                color: item === 'Recipe' ? colors.textPrimary : colors.textSecondary,
                fontWeight: item === 'Recipe' ? 500 : 400
              }}
            >
              {item}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-1">
          <button className="px-3 py-2 text-sm rounded-lg transition font-sans" style={{ color: colors.textSecondary }}>
            New
          </button>
          
          {/* Scale Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('scale'); }}
              className="px-3 py-2 text-sm rounded-lg transition font-sans flex items-center gap-1"
              style={{ color: colors.textSecondary }}
            >
              Scale
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openDropdown === 'scale' && (
              <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg border py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50" style={{ color: colors.textPrimary }}>Scale by amount</button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-opacity-50" style={{ color: colors.textPrimary }}>Scale by ingredient</button>
              </div>
            )}
          </div>
          
          {/* Optimize Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('optimize'); }}
              className="px-3 py-2 text-sm rounded-lg transition font-sans flex items-center gap-1"
              style={{ color: colors.textSecondary }}
            >
              Optimize
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openDropdown === 'optimize' && (
              <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="absolute right-0 mt-1 w-48 rounded-lg shadow-lg border py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm" style={{ color: colors.textPrimary }}>Balance to mean</button>
                <button className="w-full text-left px-4 py-2 text-sm" style={{ color: colors.textPrimary }}>Balance to range</button>
              </div>
            )}
          </div>
          
          <button className="p-2 rounded-lg transition" style={{ color: colors.textMuted }}>
            <Printer className="w-4 h-4" />
          </button>
          
          {/* Save Dropdown */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleDropdown('save'); }}
              className="px-3 py-2 text-sm text-white rounded-lg transition font-sans flex items-center gap-1"
              style={{ background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }}
            >
              Save
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {openDropdown === 'save' && (
              <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="absolute right-0 mt-1 w-52 rounded-lg shadow-lg border py-1 z-50">
                <button className="w-full text-left px-4 py-2 text-sm" style={{ color: colors.textPrimary }}>Save to recipes</button>
                <button className="w-full text-left px-4 py-2 text-sm" style={{ color: colors.textPrimary }}>Export to file</button>
                <div style={{ borderColor: colors.borderLight }} className="border-t my-1" />
                <button className="w-full text-left px-4 py-2 text-sm" style={{ color: colors.textPrimary }}>Store as ingredient</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Compact Recipe Header Card */}
        <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="rounded-xl border p-5 mb-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <input 
                  type="text" 
                  defaultValue="Asian Pear Goat Cheese" 
                  className="text-2xl font-serif font-semibold bg-transparent border-none outline-none"
                  style={{ color: colors.textPrimary }}
                />
              </div>
              <div className="flex items-center gap-3">
                <span style={{ backgroundColor: colors.mintLight, color: colors.mintDark }} className="px-2.5 py-1 text-xs font-medium rounded-full font-sans">
                  🧊 Gelato
                </span>
                <span className="text-sm font-sans" style={{ color: colors.textMuted }}>125 kcal/100g</span>
                <span style={{ color: colors.textMuted }}>•</span>
                <span className="text-sm font-sans" style={{ color: colors.textMuted }}>2.87 L yield</span>
              </div>
            </div>
            
            {/* Compact Sliders */}
            <div className="flex gap-8">
              {[
                { label: 'Serving Temp', value: '-15°C', percent: 40, icon: '❄️' },
                { label: 'Hardness', value: '75%', percent: 75, icon: '🧊' },
                { label: 'Overrun', value: '23%', percent: 23, icon: '🫧' },
              ].map(item => (
                <div key={item.label} className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-sans flex items-center gap-1" style={{ color: colors.textMuted }}>
                      <span className="text-xs">{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="font-medium font-sans" style={{ color: colors.textSecondary }}>{item.value}</span>
                  </div>
                  <div style={{ backgroundColor: colors.bgCardAlt }} className="h-2 rounded-full overflow-hidden">
                    <div 
                      style={{ background: `linear-gradient(90deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }}
                      className="h-full rounded-full transition-all" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Ingredients Table */}
          <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="col-span-2 rounded-xl border shadow-sm overflow-hidden">
            <div style={{ borderColor: colors.borderLight }} className="px-5 py-3 border-b flex items-center justify-between">
              <h2 className="font-serif font-medium" style={{ color: colors.textPrimary }}>Ingredients</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm font-sans flex items-center gap-1"
                  style={{ color: colors.textMuted }}
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button className="text-sm font-sans" style={{ color: colors.mint }}>
                  + Add ingredient
                </button>
              </div>
            </div>
            <table className="w-full text-sm font-sans">
              <thead style={{ backgroundColor: colors.bgCardAlt, color: colors.textMuted }} className="text-xs uppercase tracking-wide">
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
              <tbody style={{ color: colors.textPrimary }}>
                {[
                  { name: 'Whole Milk 3.3%', category: 'Base', categoryBg: colors.bgCardAlt, categoryColor: colors.textSecondary, amount: '794g', water: '700', sugar: '38.2', fat: '25.4', pac: '38.2' },
                  { name: 'Cream, heavy', category: 'Fat', categoryBg: colors.amberLight, categoryColor: colors.amber, amount: '175g', water: '101', sugar: '5.11', fat: '63.1', pac: '5.11' },
                  { name: 'Sucrose', category: 'Sweetener', categoryBg: '#FEF9E7', categoryColor: '#B8860B', amount: '98g', water: '', sugar: '98', fat: '', pac: '98' },
                  { name: 'Dextrose', category: 'Sweetener', categoryBg: '#FEF9E7', categoryColor: '#B8860B', amount: '80g', water: '', sugar: '70', fat: '', pac: '133' },
                  { name: 'Dried Skimmed Milk', category: 'Base', categoryBg: colors.bgCardAlt, categoryColor: colors.textSecondary, amount: '68g', water: '1.36', sugar: '35', fat: '0.61', pac: '35.4' },
                  { name: 'Asian Pear, freeze dried', category: 'Flavor', categoryBg: colors.mintLight, categoryColor: colors.mintDark, amount: '60g', water: '', sugar: '26.5', fat: '0.24', pac: '49.9' },
                  { name: 'Goat Cheese', category: 'Flavor', categoryBg: colors.mintLight, categoryColor: colors.mintDark, amount: '100g', water: '45.5', sugar: '', fat: '29.8', pac: '' },
                  { name: 'Stabilizer Mix 4421', category: 'Stabilizer', categoryBg: '#E8F5E9', categoryColor: '#558B2F', amount: '8.8g', water: '0.72', sugar: '', fat: '0.02', pac: '0.08' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderColor: colors.borderLight }} className="border-t hover:bg-opacity-50 transition group">
                    <td className="px-5 py-3">{row.name}</td>
                    <td className="px-3 py-3">
                      <span style={{ backgroundColor: row.categoryBg, color: row.categoryColor }} className="px-2 py-0.5 rounded text-xs font-medium">
                        {row.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-medium" style={{ color: colors.textSecondary }}>{row.amount}</td>
                    {showDetails && (
                      <>
                        <td className="px-3 py-3 text-right" style={{ color: colors.textMuted }}>{row.water || '—'}</td>
                        <td className="px-3 py-3 text-right" style={{ color: colors.textMuted }}>{row.sugar || '—'}</td>
                        <td className="px-3 py-3 text-right" style={{ color: colors.textMuted }}>{row.fat || '—'}</td>
                        <td className="px-5 py-3 text-right" style={{ color: colors.textMuted }}>{row.pac || '—'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ backgroundColor: colors.bgCardAlt }} className="font-medium">
                <tr>
                  <td className="px-5 py-3" style={{ color: colors.textPrimary }}>Total</td>
                  <td className="px-3 py-3"></td>
                  <td className="px-3 py-3 text-right" style={{ color: colors.textPrimary }}>2,562g</td>
                  {showDetails && (
                    <>
                      <td className="px-3 py-3 text-right" style={{ color: colors.textSecondary }}>1,868</td>
                      <td className="px-3 py-3 text-right" style={{ color: colors.textSecondary }}>398</td>
                      <td className="px-3 py-3 text-right" style={{ color: colors.textSecondary }}>120</td>
                      <td className="px-5 py-3 text-right" style={{ color: colors.textSecondary }}>594</td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Side Panel */}
          <div className="space-y-5">
            {/* Balance Card */}
            <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="rounded-xl border p-5 shadow-sm">
              <h3 className="font-serif font-medium mb-4" style={{ color: colors.textPrimary }}>Recipe Balance</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: colors.mintLight }} className="w-11 h-11 rounded-full flex items-center justify-center text-base">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium font-sans" style={{ color: colors.textPrimary }}>PAC</span>
                      <span className="text-sm font-medium font-sans" style={{ color: colors.mint }}>232</span>
                    </div>
                    <div className="text-xs font-sans" style={{ color: colors.textMuted }}>Target: 220–230</div>
                    <div style={{ backgroundColor: colors.bgCardAlt }} className="h-1.5 rounded-full mt-1.5">
                      <div style={{ backgroundColor: colors.mint }} className="h-full w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: colors.amberLight }} className="w-11 h-11 rounded-full flex items-center justify-center text-base">
                    ↑
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium font-sans" style={{ color: colors.textPrimary }}>POD</span>
                      <span className="text-sm font-medium font-sans" style={{ color: colors.amber }}>121</span>
                    </div>
                    <div className="text-xs font-sans" style={{ color: colors.textMuted }}>Target: 110–120</div>
                    <div style={{ backgroundColor: colors.bgCardAlt }} className="h-1.5 rounded-full mt-1.5">
                      <div style={{ backgroundColor: colors.amber }} className="h-full w-full rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div style={{ backgroundColor: colors.mintLight }} className="w-11 h-11 rounded-full flex items-center justify-center text-base">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium font-sans" style={{ color: colors.textPrimary }}>PAC:POD</span>
                      <span className="text-sm font-medium font-sans" style={{ color: colors.mint }}>1.92</span>
                    </div>
                    <div className="text-xs font-sans" style={{ color: colors.textMuted }}>Target: 1.8–2.2</div>
                    <div style={{ backgroundColor: colors.bgCardAlt }} className="h-1.5 rounded-full mt-1.5">
                      <div style={{ backgroundColor: colors.mint }} className="h-full w-3/4 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Composition Card */}
            <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="rounded-xl border p-5 shadow-sm">
              <h3 className="font-serif font-medium mb-3" style={{ color: colors.textPrimary }}>Composition</h3>
              <div className="space-y-2 text-sm font-sans">
                {[
                  { label: 'Water', value: '72.9%', color: '#7EC8E3' },
                  { label: 'Solids', value: '27.0%', color: colors.textMuted },
                  { label: 'Sugar', value: '15.5%', color: '#E8C97B' },
                  { label: 'Fat', value: '4.7%', color: colors.amber },
                  { label: 'MSNF', value: '5.7%', color: '#B8B0A8' },
                  { label: 'Stabilizer', value: '0.19%', color: colors.mint },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full" />
                    <span style={{ color: colors.textMuted }} className="flex-1">{item.label}</span>
                    <span style={{ color: colors.textSecondary }} className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Freezing Curve Card */}
            <div style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="rounded-xl border p-5 shadow-sm">
              <h3 className="font-serif font-medium mb-3" style={{ color: colors.textPrimary }}>Freezing Curve</h3>
              <div className="relative h-48">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="25" y1="10" x2="25" y2="100" stroke={colors.border} strokeWidth="1" />
                  <line x1="25" y1="100" x2="190" y2="100" stroke={colors.border} strokeWidth="1" />
                  
                  {/* Y-axis labels */}
                  <text x="20" y="15" textAnchor="end" fill={colors.textMuted} className="text-[8px]">0</text>
                  <text x="20" y="35" textAnchor="end" fill={colors.textMuted} className="text-[8px]">-10</text>
                  <text x="20" y="55" textAnchor="end" fill={colors.textMuted} className="text-[8px]">-20</text>
                  <text x="20" y="75" textAnchor="end" fill={colors.textMuted} className="text-[8px]">-30</text>
                  <text x="20" y="95" textAnchor="end" fill={colors.textMuted} className="text-[8px]">-40</text>
                  
                  {/* X-axis labels */}
                  <text x="25" y="110" textAnchor="start" fill={colors.textMuted} className="text-[8px]">0</text>
                  <text x="107" y="110" textAnchor="middle" fill={colors.textMuted} className="text-[8px]">50</text>
                  <text x="190" y="110" textAnchor="end" fill={colors.textMuted} className="text-[8px]">100</text>
                  
                  {/* Serving temperature line */}
                  <line x1="25" y1="42" x2="190" y2="42" stroke={colors.amber} strokeWidth="1" strokeDasharray="4 2" />
                  <text x="192" y="44" fill={colors.amber} className="text-[7px]">-15°C</text>
                  
                  {/* Freezing curve */}
                  <path 
                    d="M 25 10 Q 40 12 50 18 Q 70 28 90 42 Q 120 62 150 78 Q 170 88 190 95" 
                    fill="none" 
                    stroke={colors.mint} 
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Hardness indicator point */}
                  <circle cx="130" cy="42" r="4" fill={colors.mint} />
                  
                  {/* Hardness label */}
                  <text x="130" y="35" textAnchor="middle" fill={colors.mintDark} className="text-[7px] font-medium">75%</text>
                </svg>
                
                {/* X-axis label */}
                <div className="text-center text-xs font-sans mt-1" style={{ color: colors.textMuted }}>
                  % Water Frozen
                </div>
              </div>
              
              {/* Legend */}
              <div style={{ borderColor: colors.borderLight }} className="flex items-center justify-between mt-3 pt-3 border-t text-xs font-sans">
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: colors.amber }} className="w-3 h-0.5" />
                  <span style={{ color: colors.textMuted }}>Serving Temp</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: colors.mint }} className="w-2 h-2 rounded-full" />
                  <span style={{ color: colors.textMuted }}>Hardness: 75%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Chat Panel */}
      <div 
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        className={`fixed top-0 right-0 h-full w-96 border-l shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Chat Header */}
        <div style={{ borderColor: colors.borderLight }} className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              <IceCreamIdle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-medium" style={{ color: colors.textPrimary }}>Recipe Assistant</h3>
              <p className="text-xs font-sans" style={{ color: colors.textMuted }}>
                {aiState === 'active' ? 'Sprinkling...' : 'Viewing: Asian Pear Goat Cheese'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleCloseChat}
            className="p-2 rounded-lg transition"
            style={{ color: colors.textMuted }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {sampleConversation.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div style={{ background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }} className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                  <IceCreamIdle className="w-4 h-4 text-white" />
                </div>
              )}
              <div 
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm font-sans"
                style={{ 
                  backgroundColor: msg.role === 'user' ? colors.mint : colors.bgCardAlt,
                  color: msg.role === 'user' ? 'white' : colors.textPrimary,
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '16px',
                }}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {/* Sprinkling indicator */}
          {aiState === 'active' && (
            <div className="flex justify-start">
              <div style={{ background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }} className="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                <IceCreamActive className="w-4 h-4 text-white" />
              </div>
              <div style={{ backgroundColor: colors.bgCardAlt }} className="rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-sm font-sans" style={{ color: colors.textMuted }}>Sprinkling...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Input */}
        <div style={{ borderColor: colors.borderLight }} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your recipe..."
              style={{ backgroundColor: colors.bgCardAlt, borderColor: colors.border, color: colors.textPrimary }}
              className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-sans focus:outline-none focus:ring-2"
              disabled={aiState === 'active'}
            />
            <button 
              onClick={handleSend}
              disabled={aiState === 'active'}
              style={{ background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }}
              className="p-2.5 text-white rounded-xl transition disabled:opacity-50"
            >
              <ConeSend className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs mt-2 text-center font-sans" style={{ color: colors.textMuted }}>
            AI can read and suggest changes to your recipe
          </p>
        </div>
      </div>
      
      {/* Floating Action Button */}
      {!chatOpen && (
        <button
          onClick={handleOpenChat}
          style={{ background: `linear-gradient(135deg, ${colors.mint} 0%, ${colors.mintDark} 100%)` }}
          className="fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
        >
          <IceCreamIdle className="w-7 h-7 text-white" />
        </button>
      )}
    </div>
  );
}
