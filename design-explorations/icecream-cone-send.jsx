import React from 'react';

// Reference: our cone icon
const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

// Cone triangle pointing up-right (rotated 45 degrees from pointing down)
const ConeSend = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Triangle pointing up-right - like the cone rotated */}
    <path d="M6 18 L18 6 L10 6 L6 18 Z" />
  </svg>
);

// Variant: just the V outline (no closing line)
const ConeSendOpen = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 16 L16 8" />
    <path d="M16 8 L8 8" />
  </svg>
);

// Variant: pointing more right than up
const ConeSendRight = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 8 L20 12 L4 16" />
  </svg>
);

// Variant: filled triangle
const ConeSendFilled = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill={color} stroke="none" className={className}>
    <path d="M6 18 L18 6 L10 6 Z" />
  </svg>
);

// Variant: stroke only, true cone angle
const ConeSendStroke = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 18 L18 6" />
    <path d="M18 6 L10 6" />
  </svg>
);

// Cleaner: proper proportions matching the cone
const ConeSendClean = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Same proportions as cone: tip to edges */}
    <path d="M5 19 L19 5" />
    <path d="M19 5 L19 14" />
  </svg>
);

export default function ConeSendDemo() {
  const variants = [
    { name: 'Closed Triangle', Icon: ConeSend },
    { name: 'Open V', Icon: ConeSendOpen },
    { name: 'Pointing Right', Icon: ConeSendRight },
    { name: 'Filled', Icon: ConeSendFilled },
    { name: 'Stroke Only', Icon: ConeSendStroke },
    { name: 'Clean', Icon: ConeSendClean },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Cone Triangle as Send</h1>
        <p className="text-slate-500 font-sans mb-8">The cone shape rotated to point up-right</p>
        
        {/* Concept illustration */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="font-sans text-sm text-slate-500 mb-4">Concept</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <IceCreamIdle className="w-16 h-16 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400">Full icon</span>
            </div>
            <span className="text-2xl text-slate-300">→</span>
            <div className="text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-slate-700 mx-auto mb-2">
                <path d="M8 10 L12 22 L16 10" />
              </svg>
              <span className="text-xs text-slate-400">Just the cone</span>
            </div>
            <span className="text-2xl text-slate-300">→</span>
            <div className="text-center">
              <ConeSendStroke className="w-16 h-16 text-slate-700 mx-auto mb-2" />
              <span className="text-xs text-slate-400">Rotated up-right</span>
            </div>
          </div>
        </div>
        
        {/* Variants */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {variants.map(({ name, Icon }) => (
            <div key={name} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <h3 className="font-sans text-xs text-slate-500 mb-3">{name}</h3>
              <Icon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <div className="flex justify-center gap-2">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <button className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* In context */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-sans text-sm text-slate-500 mb-4">In Context</h3>
          
          <div className="space-y-3">
            {variants.map(({ name, Icon }) => (
              <div key={name} className="flex gap-2 items-center">
                <span className="text-xs text-slate-400 w-28 flex-shrink-0">{name}</span>
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans"
                  defaultValue="How can I make this less icy?"
                />
                <button className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition">
                  <Icon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
