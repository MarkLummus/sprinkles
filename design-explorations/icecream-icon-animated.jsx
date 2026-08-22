import React, { useState, useEffect } from 'react';

// Static icon - no sprinkles (idle state)
const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

// Animated icon - sprinkles raining down
const IceCreamActive = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Cone and scoop */}
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
    
    {/* Falling sprinkles with staggered animations */}
    <g>
      <circle cx="6" cy="0" r="1" fill={color} stroke="none">
        <animate 
          attributeName="cy" 
          values="0;6;6" 
          dur="1.2s" 
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
        />
        <animate 
          attributeName="opacity" 
          values="0;1;0" 
          dur="1.2s" 
          repeatCount="indefinite"
          keyTimes="0;0.4;1"
        />
      </circle>
      
      <circle cx="18" cy="0" r="1" fill={color} stroke="none">
        <animate 
          attributeName="cy" 
          values="0;7;7" 
          dur="1s" 
          repeatCount="indefinite"
          keyTimes="0;0.6;1"
          begin="0.3s"
        />
        <animate 
          attributeName="opacity" 
          values="0;1;0" 
          dur="1s" 
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          begin="0.3s"
        />
      </circle>
      
      <circle cx="4" cy="0" r="1" fill={color} stroke="none">
        <animate 
          attributeName="cy" 
          values="2;10;10" 
          dur="1.4s" 
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          begin="0.6s"
        />
        <animate 
          attributeName="opacity" 
          values="0;1;0" 
          dur="1.4s" 
          repeatCount="indefinite"
          keyTimes="0;0.4;1"
          begin="0.6s"
        />
      </circle>
      
      <circle cx="20" cy="0" r="1" fill={color} stroke="none">
        <animate 
          attributeName="cy" 
          values="1;9;9" 
          dur="1.1s" 
          repeatCount="indefinite"
          keyTimes="0;0.55;1"
          begin="0.15s"
        />
        <animate 
          attributeName="opacity" 
          values="0;1;0" 
          dur="1.1s" 
          repeatCount="indefinite"
          keyTimes="0;0.45;1"
          begin="0.15s"
        />
      </circle>
      
      <circle cx="10" cy="0" r="1" fill={color} stroke="none">
        <animate 
          attributeName="cy" 
          values="-2;4;4" 
          dur="0.9s" 
          repeatCount="indefinite"
          keyTimes="0;0.6;1"
          begin="0.45s"
        />
        <animate 
          attributeName="opacity" 
          values="0;1;0" 
          dur="0.9s" 
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          begin="0.45s"
        />
      </circle>
      
      <circle cx="14" cy="0" r="1" fill={color} stroke="none">
        <animate 
          attributeName="cy" 
          values="-1;5;5" 
          dur="1.3s" 
          repeatCount="indefinite"
          keyTimes="0;0.5;1"
          begin="0.75s"
        />
        <animate 
          attributeName="opacity" 
          values="0;1;0" 
          dur="1.3s" 
          repeatCount="indefinite"
          keyTimes="0;0.4;1"
          begin="0.75s"
        />
      </circle>
    </g>
  </svg>
);

// Gentle pulse version - sprinkles appear and fade around the cone
const IceCreamPulse = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
    
    {/* Pulsing sprinkles */}
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

// Demo component
export default function AnimatedIconDemo() {
  const [state, setState] = useState('idle');
  
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Animated Sprinkles</h1>
        <p className="text-slate-500 font-sans mb-8">Sprinkles rain down when AI is active</p>
        
        {/* Animation showcase */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <h3 className="font-sans text-sm text-slate-500 mb-4">Idle</h3>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <IceCreamIdle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 font-sans">No animation</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <h3 className="font-sans text-sm text-slate-500 mb-4">Active / Thinking</h3>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <IceCreamActive className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-slate-400 font-sans">Sprinkles falling</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <h3 className="font-sans text-sm text-slate-500 mb-4">Ready / Waiting</h3>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <IceCreamPulse className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-slate-400 font-sans">Gentle pulse</p>
          </div>
        </div>

        {/* Interactive demo */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h3 className="font-sans text-sm text-slate-500 mb-4">Interactive Demo</h3>
          <div className="flex items-center gap-8">
            <div className="flex gap-2">
              {['idle', 'ready', 'active'].map((s) => (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  className={`px-4 py-2 text-sm rounded-lg font-sans capitalize transition ${
                    state === s 
                      ? 'bg-violet-100 text-violet-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex-1 flex justify-center">
              <button className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
                state === 'idle' 
                  ? 'bg-slate-100' 
                  : 'bg-gradient-to-br from-violet-500 to-purple-600'
              }`}>
                {state === 'idle' && <IceCreamIdle className="w-7 h-7 text-slate-400" />}
                {state === 'ready' && <IceCreamPulse className="w-7 h-7 text-white" />}
                {state === 'active' && <IceCreamActive className="w-7 h-7 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* State mapping */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-sans text-sm text-slate-500 mb-4">State Mapping</h3>
          <div className="space-y-3 text-sm font-sans">
            <div className="flex items-center gap-3">
              <IceCreamIdle className="w-5 h-5 text-slate-400" />
              <span className="text-slate-700 font-medium">Idle</span>
              <span className="text-slate-400">— FAB closed, chat hidden</span>
            </div>
            <div className="flex items-center gap-3">
              <IceCreamPulse className="w-5 h-5 text-violet-600" />
              <span className="text-slate-700 font-medium">Ready</span>
              <span className="text-slate-400">— Chat open, waiting for input</span>
            </div>
            <div className="flex items-center gap-3">
              <IceCreamActive className="w-5 h-5 text-violet-600" />
              <span className="text-slate-700 font-medium">Active</span>
              <span className="text-slate-400">— AI is generating a response</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
