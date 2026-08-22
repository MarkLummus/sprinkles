import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Printer, Menu, X, Zap, Pencil, GripVertical, Check, AlertCircle, MessageCircle } from 'lucide-react';

// Simulated tablet frame component
const TabletFrame = ({ orientation, children, label }) => {
  const isPortrait = orientation === 'portrait';
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-medium text-slate-600 font-sans mb-2">{label}</p>
      <div 
        className="bg-slate-800 rounded-[2rem] p-3 shadow-2xl"
        style={{
          width: isPortrait ? '400px' : '580px',
          height: isPortrait ? '560px' : '400px',
        }}
      >
        <div className="bg-white rounded-[1.25rem] w-full h-full overflow-hidden overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Tablet Portrait Layout
const TabletPortrait = () => {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div className="min-h-full bg-slate-50 relative">
      {/* Header - Compact */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">🍨</span>
            </div>
            <span className="font-serif font-semibold text-slate-800">Sprinkles</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-500">
            <Printer className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-500"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="absolute inset-0 bg-black/50 z-30" onClick={() => setMenuOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-4">
              <button onClick={() => setMenuOpen(false)} className="p-2 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {['Scale', 'Optimize', 'Print', 'Save', 'Ingredients', 'Tools', 'Help'].map(item => (
                <button key={item} className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg font-sans">
                  {item}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="p-4">
        {/* Recipe Header - Stacked */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-lg font-serif font-semibold text-slate-800">Asian Pear & Goat Cheese</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full font-sans">
                  🧊 Gelato
                </span>
                <span className="text-slate-400 text-xs font-sans">1.00 L</span>
              </div>
            </div>
            <button className="p-1.5 text-slate-400">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          
          {/* Sliders - Horizontal scroll */}
          <div className="flex gap-4 mt-3 overflow-x-auto pb-1">
            {[
              { label: 'Serving', value: '-14°C' },
              { label: 'Hardness', value: '70%' },
              { label: 'Overrun', value: '25%' },
            ].map(item => (
              <div key={item.label} className="flex-shrink-0 text-center">
                <span className="text-xs text-slate-500 font-sans">{item.label}</span>
                <div className="text-sm font-medium text-slate-700 font-sans">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Summary - Collapsible */}
        <button 
          onClick={() => setSidePanelOpen(!sidePanelOpen)}
          className="w-full bg-white rounded-xl border border-slate-200 p-3 mb-4 shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-slate-700 font-sans">Recipe Balanced</span>
              <p className="text-xs text-slate-500 font-sans">PAC 234 · POD 118 · Fat 7.2%</p>
            </div>
          </div>
          {sidePanelOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {/* Expanded Balance Panel */}
        {sidePanelOpen && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'PAC', value: '234', status: 'ok' },
                { label: 'POD', value: '118', status: 'ok' },
                { label: 'Fat', value: '7.2%', status: 'ok' },
                { label: 'Sugar', value: '22.5%', status: 'ok' },
                { label: 'MSNF', value: '9.1%', status: 'ok' },
                { label: 'Solids', value: '38.8%', status: 'ok' },
              ].map(item => (
                <div key={item.label} className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 font-sans">{item.label}</span>
                  <div className="text-sm font-semibold text-slate-700 font-sans">{item.value}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 py-2 text-sm text-blue-600 font-medium font-sans flex items-center justify-center gap-1">
              <Zap className="w-4 h-4" />
              Optimize
            </button>
          </div>
        )}

        {/* Ingredients - Compact Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-serif font-medium text-slate-800 text-sm">Ingredients</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              { name: 'Whole Milk 3.5%', amount: '500g' },
              { name: 'Heavy Cream 35%', amount: '150g' },
              { name: 'Fresh Goat Cheese', amount: '120g' },
              { name: 'Sucrose', amount: '95g' },
            ].map((row, i) => (
              <div key={i} className="flex items-center px-4 py-2.5">
                <GripVertical className="w-4 h-4 text-slate-300 mr-2" />
                <span className="flex-1 text-sm text-slate-700 font-sans">{row.name}</span>
                <span className="text-sm font-medium text-slate-600 font-sans">{row.amount}</span>
              </div>
            ))}
            <div className="px-4 py-2.5 text-sm text-slate-400 font-sans">
              + 4 more ingredients
            </div>
          </div>
        </div>

        {/* Process - Collapsed */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="font-serif font-medium text-slate-800 text-sm">Process</h2>
            <span className="text-xs text-slate-500 font-sans">6 steps</span>
          </div>
        </div>
      </main>

      {/* Bottom Sheet Trigger - AI Chat FAB */}
      <button className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

// Tablet Landscape Layout
const TabletLandscape = () => {
  return (
    <div className="min-h-full bg-slate-50">
      {/* Header - More like desktop */}
      <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-slate-500 text-xs font-sans">
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <span className="text-xs">🍨</span>
            </div>
            <span className="font-serif font-semibold text-slate-800 text-sm">Sprinkles</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 rounded font-sans">Scale</button>
          <button className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 rounded font-sans">Optimize</button>
          <button className="p-1.5 text-slate-400">
            <Printer className="w-4 h-4" />
          </button>
          <button className="px-2.5 py-1 text-xs bg-blue-500 text-white rounded font-sans">Save</button>
        </div>
      </header>

      <main className="p-3 flex gap-3" style={{ height: 'calc(100% - 45px)' }}>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Recipe Header */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 mb-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-base font-serif font-semibold text-slate-800">Asian Pear & Goat Cheese</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full font-sans">
                    🧊 Gelato
                  </span>
                  <span className="text-slate-400 text-[10px] font-sans">1.00 L · 142 kcal/100g</span>
                </div>
              </div>
              <div className="flex gap-3">
                {[
                  { label: 'Serving', value: '-14°C' },
                  { label: 'Hardness', value: '70%' },
                  { label: 'Overrun', value: '25%' },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <span className="text-[10px] text-slate-500 font-sans">{item.label}</span>
                    <div className="text-xs font-medium text-slate-700 font-sans">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-serif font-medium text-slate-800 text-xs">Ingredients</h2>
              <button className="text-[10px] text-blue-600 font-sans">+ Add</button>
            </div>
            <table className="w-full text-xs font-sans">
              <tbody>
                {[
                  { name: 'Whole Milk 3.5%', cat: 'Base', amount: '500g' },
                  { name: 'Heavy Cream 35%', cat: 'Fat', amount: '150g' },
                  { name: 'Fresh Goat Cheese', cat: 'Fat', amount: '120g' },
                  { name: 'Sucrose', cat: 'Sweetener', amount: '95g' },
                  { name: 'Dextrose', cat: 'Sweetener', amount: '55g' },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="pl-2 py-1.5 w-6">
                      <GripVertical className="w-3 h-3 text-slate-300" />
                    </td>
                    <td className="py-1.5 text-slate-700">{row.name}</td>
                    <td className="py-1.5 text-slate-500">{row.cat}</td>
                    <td className="pr-3 py-1.5 text-right font-medium text-slate-600">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel - Narrower */}
        <div className="w-44 flex-shrink-0 space-y-3 overflow-y-auto">
          {/* Balance Card */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <h3 className="font-serif font-medium text-slate-800 text-xs mb-2">Balance</h3>
            <div className="space-y-1.5">
              {[
                { label: 'PAC', value: '234' },
                { label: 'POD', value: '118' },
                { label: 'Fat', value: '7.2%' },
                { label: 'Sugar', value: '22.5%' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-sans">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700 font-sans">{item.value}</span>
                    <div className="w-3 h-3 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-2 h-2 text-emerald-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-2 py-1.5 text-[10px] text-blue-600 font-medium font-sans flex items-center justify-center gap-1 hover:bg-blue-50 rounded">
              <Zap className="w-3 h-3" />
              Optimize
            </button>
          </div>

          {/* Composition Mini */}
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
            <h3 className="font-serif font-medium text-slate-800 text-xs mb-2">Composition</h3>
            <div className="space-y-1">
              {[
                { label: 'Water', value: '61.7%', color: 'bg-sky-400' },
                { label: 'Solids', value: '38.3%', color: 'bg-slate-400' },
                { label: 'Fat', value: '7.2%', color: 'bg-orange-300' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[10px]">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-slate-500 font-sans flex-1">{item.label}</span>
                  <span className="font-medium text-slate-700 font-sans">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center">
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
};

// Bottom Sheet Slideout Preview
const BottomSheetPreview = () => {
  return (
    <div className="min-h-full bg-slate-900/50 relative flex flex-col justify-end">
      {/* Dimmed background representing the page */}
      <div className="absolute inset-0 opacity-30">
        <div className="bg-white m-4 rounded-xl h-32" />
        <div className="bg-white m-4 rounded-xl h-48" />
      </div>
      
      {/* Bottom Sheet */}
      <div className="bg-white rounded-t-2xl shadow-2xl relative z-10">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-serif font-semibold text-slate-800 text-sm">Optimize Recipe</h3>
              <p className="text-[10px] text-slate-500 font-sans">2 issues to fix</p>
            </div>
          </div>
          <button className="p-2 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content Preview */}
        <div className="p-4 space-y-2">
          <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-700 font-sans">PAC too high - will not freeze properly</span>
          </div>
          <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-700 font-sans">Fat too low - will lack creaminess</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 pt-0">
          <button className="w-full py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg font-sans">
            Apply Fixes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function TabletResponsive() {
  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Tablet Responsive Layouts</h1>
        <p className="text-slate-500 font-sans mb-8">iPad Portrait, Landscape, and Bottom Sheet pattern</p>

        <div className="flex flex-wrap gap-8 justify-center">
          {/* Portrait */}
          <TabletFrame orientation="portrait" label="iPad Portrait (768px)">
            <TabletPortrait />
          </TabletFrame>

          {/* Landscape */}
          <TabletFrame orientation="landscape" label="iPad Landscape (1024px)">
            <TabletLandscape />
          </TabletFrame>

          {/* Bottom Sheet */}
          <TabletFrame orientation="portrait" label="Bottom Sheet (Slideout in Portrait)">
            <BottomSheetPreview />
          </TabletFrame>
        </div>

        {/* Responsive Strategy */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6 max-w-3xl mx-auto">
          <h3 className="font-serif font-medium text-slate-800 mb-4">Responsive Strategy</h3>
          <div className="space-y-4 text-sm font-sans">
            <div>
              <p className="font-medium text-slate-700 mb-2">Portrait (under 900px):</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Single column layout</li>
                <li>• Balance/Composition collapsed into summary card</li>
                <li>• Tap to expand full metrics</li>
                <li>• Hamburger menu for nav + actions</li>
                <li>• Slideouts become bottom sheets</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium text-slate-700 mb-2">Landscape (900px+):</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Two column: content + narrow side panel</li>
                <li>• Header shows Scale, Optimize, Save buttons</li>
                <li>• Side panel always visible (narrower)</li>
                <li>• Slideouts from right side</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-2">Bottom Sheet (Portrait slideouts):</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Drag handle at top</li>
                <li>• Swipe down to dismiss</li>
                <li>• Max height ~70% of screen</li>
                <li>• Scrollable content area</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
