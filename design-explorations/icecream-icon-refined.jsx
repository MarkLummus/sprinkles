import React from 'react';

// Refined: Pure geometric cone (circle + triangle) with dot sprinkles
const IceCreamAI = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Scoop - simple circle */}
    <circle cx="12" cy="7" r="4" />
    {/* Cone - simple triangle */}
    <path d="M8 10 L12 22 L16 10" />
    {/* Sprinkle dots */}
    <circle cx="4" cy="5" r="1" fill={color} stroke="none" />
    <circle cx="20" cy="6" r="1" fill={color} stroke="none" />
    <circle cx="3" cy="11" r="1" fill={color} stroke="none" />
    <circle cx="21" cy="10" r="1" fill={color} stroke="none" />
  </svg>
);

// Variant: Fewer sprinkles (3 dots) - even cleaner
const IceCreamAIMinimal = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Scoop */}
    <circle cx="12" cy="7" r="4" />
    {/* Cone */}
    <path d="M8 10 L12 22 L16 10" />
    {/* 3 sprinkles - asymmetric for visual interest */}
    <circle cx="4" cy="6" r="1" fill={color} stroke="none" />
    <circle cx="20" cy="5" r="1" fill={color} stroke="none" />
    <circle cx="20" cy="11" r="1" fill={color} stroke="none" />
  </svg>
);

// Variant: Sprinkles only on one side (implies motion/magic)
const IceCreamAIActive = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Scoop */}
    <circle cx="12" cy="7" r="4" />
    {/* Cone */}
    <path d="M8 10 L12 22 L16 10" />
    {/* Sprinkles clustered on right - suggests activity */}
    <circle cx="19" cy="4" r="1" fill={color} stroke="none" />
    <circle cx="21" cy="8" r="1" fill={color} stroke="none" />
    <circle cx="19" cy="12" r="1" fill={color} stroke="none" />
  </svg>
);

// Without sprinkles - for quiet/inactive state
const IceCreamIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Scoop */}
    <circle cx="12" cy="7" r="4" />
    {/* Cone */}
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

export default function IconRefinement() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Refined Icon: Circle + Triangle + Dots</h1>
        <p className="text-slate-500 font-sans mb-8">Geometric simplicity that scales well</p>
        
        {/* Size test */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-sans text-sm text-slate-500 mb-4">Scale Test</h3>
          <div className="flex items-end gap-6">
            <div className="text-center">
              <IceCreamAI className="w-4 h-4 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400">16px</span>
            </div>
            <div className="text-center">
              <IceCreamAI className="w-6 h-6 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400">24px</span>
            </div>
            <div className="text-center">
              <IceCreamAI className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400">32px</span>
            </div>
            <div className="text-center">
              <IceCreamAI className="w-12 h-12 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400">48px</span>
            </div>
            <div className="text-center">
              <IceCreamAI className="w-16 h-16 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400">64px</span>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <h3 className="font-sans text-xs text-slate-500 mb-3">4 Sprinkles</h3>
            <IceCreamAI className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center mx-auto">
              <IceCreamAI className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <h3 className="font-sans text-xs text-slate-500 mb-3">3 Sprinkles</h3>
            <IceCreamAIMinimal className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center mx-auto">
              <IceCreamAIMinimal className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <h3 className="font-sans text-xs text-slate-500 mb-3">Active (right)</h3>
            <IceCreamAIActive className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center mx-auto">
              <IceCreamAIActive className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <h3 className="font-sans text-xs text-slate-500 mb-3">No sprinkles</h3>
            <IceCreamIcon className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center mx-auto">
              <IceCreamIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* State pairing idea */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-sans text-sm text-slate-500 mb-4">State Pairing Idea</h3>
          <p className="text-sm text-slate-600 font-sans mb-4">Use sprinkles to indicate AI activity:</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <IceCreamIcon className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <div className="font-sans text-sm text-slate-700">Idle</div>
                <div className="font-sans text-xs text-slate-400">No sprinkles</div>
              </div>
            </div>
            <div className="text-slate-300">→</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                <IceCreamAI className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-sans text-sm text-slate-700">Active</div>
                <div className="font-sans text-xs text-slate-400">With sprinkles</div>
              </div>
            </div>
          </div>
        </div>

        {/* In context */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-sans text-sm text-slate-500 mb-4">In Context</h3>
          
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <IceCreamAI className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-slate-800">Recipe Assistant</h3>
              <p className="text-xs text-slate-400 font-sans">Viewing: Asian Pear Goat Cheese</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-lg font-sans flex items-center gap-2">
              <IceCreamAI className="w-4 h-4" />
              Help me improve it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
