import React, { useState } from 'react';
import { Plus, Upload, Globe, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

// Icon component
const IceCreamIcon = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

export default function HomePageEmptyState() {
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  const starterTemplates = [
    { id: 1, name: 'Vanilla Gelato', type: 'Gelato', description: 'Classic base, perfect for beginners' },
    { id: 2, name: 'Chocolate Ice Cream', type: 'Ice Cream', description: 'Rich and creamy American style' },
    { id: 3, name: 'Strawberry Sorbetto', type: 'Sorbetto', description: 'Dairy-free, fruit-forward' },
  ];

  const typeColors = {
    'Gelato': 'bg-blue-50 text-blue-700',
    'Ice Cream': 'bg-amber-50 text-amber-700',
    'Sorbetto': 'bg-pink-50 text-pink-700',
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition font-sans">
            Sign In
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Welcome Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <IceCreamIcon className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-slate-800 mb-3">
            Welcome to Sprinkles
          </h1>
          <p className="text-slate-500 font-sans text-lg max-w-md mx-auto">
            Create perfectly balanced ice cream recipes with AI-powered assistance.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
          <h2 className="font-serif text-xl font-medium text-slate-800 mb-6 text-center">
            Start your first recipe
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button className="flex flex-col items-center p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition group">
              <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-3 transition">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-sans font-medium text-slate-700">From Template</span>
              <span className="text-xs text-slate-400 font-sans mt-1">Recommended</span>
            </button>
            
            <button className="flex flex-col items-center p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition group">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-slate-200 rounded-xl flex items-center justify-center mb-3 transition">
                <Globe className="w-6 h-6 text-slate-600" />
              </div>
              <span className="font-sans font-medium text-slate-700">Import from Web</span>
              <span className="text-xs text-slate-400 font-sans mt-1">Paste a URL</span>
            </button>
            
            <button className="flex flex-col items-center p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition group">
              <div className="w-12 h-12 bg-slate-100 group-hover:bg-slate-200 rounded-xl flex items-center justify-center mb-3 transition">
                <Upload className="w-6 h-6 text-slate-600" />
              </div>
              <span className="font-sans font-medium text-slate-700">Upload File</span>
              <span className="text-xs text-slate-400 font-sans mt-1">JSON, CSV</span>
            </button>
          </div>

          {/* Starter Templates */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 font-sans mb-3 uppercase tracking-wide">
              Popular templates to get started
            </h3>
            <div className="space-y-2">
              {starterTemplates.map(template => (
                <button
                  key={template.id}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition">
                      <BookOpen className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-medium text-slate-700">{template.name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[template.type]}`}>
                          {template.type}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500 font-sans">{template.description}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-300 group-hover:text-blue-500 transition ${hoveredTemplate === template.id ? 'translate-x-1' : ''}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Assistant Hint */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-slate-800 mb-1">
                Not sure where to start?
              </h3>
              <p className="text-sm text-slate-600 font-sans mb-3">
                Our AI assistant can help you brainstorm flavor ideas, explain techniques, or guide you through your first batch.
              </p>
              <button className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition font-sans flex items-center gap-2">
                <IceCreamIcon className="w-4 h-4" />
                Chat with assistant
              </button>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-sm text-slate-400 font-sans mt-8">
          Your recipes are saved locally. Sign in to sync across devices.
        </p>
      </main>
    </div>
  );
}
