import React, { useState } from 'react';
import { 
  X, Link, Search, AlertTriangle, Check, ChevronDown, ChevronRight,
  Plus, HelpCircle, RefreshCw
} from 'lucide-react';

// AI Icon
const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

export default function ImportFromWebFlow() {
  const [slideoutOpen, setSlideoutOpen] = useState(true);
  
  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Demo Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="font-serif text-xl text-slate-800">Import from Web</h1>
        <p className="text-sm text-slate-500 font-sans">Slideout flow for importing recipes from URLs</p>
      </div>

      {/* Trigger Button (for demo) */}
      <div className="p-8">
        <button 
          onClick={() => setSlideoutOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-sans text-sm hover:bg-blue-600 transition flex items-center gap-2"
        >
          <Link className="w-4 h-4" />
          Import from Web
        </button>
      </div>

      {/* Slideout */}
      {slideoutOpen && <ImportSlideout onClose={() => setSlideoutOpen(false)} />}
    </div>
  );
}

function ImportSlideout({ onClose }) {
  const [step, setStep] = useState('input'); // 'input', 'fetching', 'review'
  const [url, setUrl] = useState('');
  const [expandedSections, setExpandedSections] = useState(['ingredients', 'process']);

  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleFetch = () => {
    setStep('fetching');
    setTimeout(() => setStep('review'), 2000);
  };

  // Simulated parsed recipe data
  const parsedRecipe = {
    name: 'Honey Lavender Ice Cream',
    source: 'seriouseats.com',
    type: 'Ice Cream',
    typeConfidence: 'high',
    yield: { value: 1, unit: 'quart', grams: 946 },
    yieldConfidence: 'medium',
    warnings: [
      { type: 'yield', message: 'Yield converted from "1 quart" — verify this is correct' },
    ],
    ingredients: [
      { 
        original: '2 cups heavy cream',
        name: 'Heavy Cream (36%)',
        matched: true,
        amount: 480,
        unit: 'g',
        conversion: { from: '2 cups', confidence: 'high', density: 1.01 }
      },
      { 
        original: '1 cup whole milk',
        name: 'Whole Milk',
        matched: true,
        amount: 245,
        unit: 'g',
        conversion: { from: '1 cup', confidence: 'high', density: 1.03 }
      },
      { 
        original: '3/4 cup honey',
        name: 'Honey',
        matched: true,
        amount: 255,
        unit: 'g',
        conversion: { from: '3/4 cup', confidence: 'high', density: 1.42 }
      },
      { 
        original: '2 tablespoons dried lavender',
        name: 'Dried Lavender',
        matched: false,
        amount: 6,
        unit: 'g',
        conversion: { from: '2 tbsp', confidence: 'low', note: 'Estimated — dried herbs vary widely' }
      },
      { 
        original: '6 large egg yolks',
        name: 'Egg Yolk',
        matched: true,
        amount: 120,
        unit: 'g',
        conversion: { from: '6 yolks', confidence: 'high', note: '~20g per yolk' }
      },
      { 
        original: '1/4 teaspoon salt',
        name: 'Salt',
        matched: true,
        amount: 1.5,
        unit: 'g',
        conversion: { from: '1/4 tsp', confidence: 'high' }
      },
    ],
    process: [
      { step: 1, text: 'Combine cream, milk, and lavender in a saucepan. Heat until steaming, then remove from heat and let steep for 30 minutes.' },
      { step: 2, text: 'Strain out lavender. Return cream mixture to medium heat.' },
      { step: 3, text: 'Whisk egg yolks and honey in a bowl until smooth.' },
      { step: 4, text: 'Slowly pour hot cream into yolk mixture, whisking constantly.' },
      { step: 5, text: 'Return to saucepan and cook over medium heat, stirring constantly, until mixture reaches 170°F (77°C).' },
      { step: 6, text: 'Strain into a bowl, stir in salt. Chill completely, then churn according to your ice cream maker\'s instructions.' },
    ],
  };

  const getConfidenceBadge = (confidence) => {
    const styles = {
      high: 'bg-emerald-100 text-emerald-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-1.5 py-0.5 text-xs rounded font-medium ${styles[confidence]}`}>
        {confidence}
      </span>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      />
      
      {/* Slideout Panel */}
      <div className="fixed top-0 right-0 h-full w-[560px] bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-slate-800">Import from Web</h2>
            <p className="text-sm text-slate-500 font-sans">
              {step === 'input' && 'Paste a recipe URL to import'}
              {step === 'fetching' && 'Reading recipe...'}
              {step === 'review' && 'Review imported recipe'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step: Input */}
          {step === 'input' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-1.5">
                  Recipe URL
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.seriouseats.com/honey-lavender-ice-cream"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <IceCreamIdle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-sans font-medium mb-1">AI-Powered Import</p>
                    <p className="text-sm text-blue-700 font-sans">
                      We'll extract the recipe, convert volume measurements to grams, and match ingredients to your library.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-sans mb-2">Works with most recipe sites including:</p>
                <div className="flex flex-wrap gap-2">
                  {['Serious Eats', 'King Arthur', 'Food52', 'NY Times Cooking', 'Bon Appétit', 'AllRecipes'].map(site => (
                    <span key={site} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-sans">
                      {site}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step: Fetching */}
          {step === 'fetching' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <IceCreamIdle className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <h3 className="font-sans font-medium text-slate-800 mb-2">Reading recipe...</h3>
              <p className="text-sm text-slate-500 font-sans mb-4">Extracting ingredients and converting measurements</p>
              <div className="space-y-2 text-sm text-slate-500 font-sans">
                <p className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Fetched page content
                </p>
                <p className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  Parsing ingredients...
                </p>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Warnings */}
              {parsedRecipe.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-sans font-medium">Review needed</p>
                      {parsedRecipe.warnings.map((w, i) => (
                        <p key={i} className="text-sm text-amber-700 font-sans">{w.message}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recipe Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-1.5">
                  Recipe Name
                </label>
                <input
                  type="text"
                  defaultValue={parsedRecipe.name}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Source: {parsedRecipe.source}
                </p>
              </div>

              {/* Type & Yield */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-sans mb-1.5">
                    Type
                  </label>
                  <select 
                    defaultValue={parsedRecipe.type}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>Ice Cream</option>
                    <option>Gelato</option>
                    <option>Sorbet</option>
                    <option>Sherbet</option>
                    <option>Frozen Yogurt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 font-sans mb-1.5 flex items-center gap-1">
                    Yield
                    {parsedRecipe.yieldConfidence !== 'high' && (
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      defaultValue={parsedRecipe.yield.grams}
                      className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 font-sans">g</span>
                  </div>
                </div>
              </div>

              {/* Ingredients Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('ingredients')}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition ${expandedSections.includes('ingredients') ? 'rotate-90' : ''}`} />
                    <span className="font-sans font-medium text-slate-800">Ingredients</span>
                    <span className="text-sm text-slate-500 font-sans">({parsedRecipe.ingredients.length})</span>
                  </div>
                  {parsedRecipe.ingredients.some(i => !i.matched || i.conversion.confidence === 'low') && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                      Needs review
                    </span>
                  )}
                </button>
                
                {expandedSections.includes('ingredients') && (
                  <div className="divide-y divide-slate-100">
                    {parsedRecipe.ingredients.map((ing, i) => (
                      <div key={i} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-sans font-medium text-slate-800">{ing.name}</span>
                              {!ing.matched && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
                              <span>Original: {ing.original}</span>
                              <span>→</span>
                              <span className="font-medium text-slate-700">{ing.amount}{ing.unit}</span>
                              {getConfidenceBadge(ing.conversion.confidence)}
                            </div>
                            {ing.conversion.note && (
                              <p className="text-xs text-slate-400 font-sans mt-1">{ing.conversion.note}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              defaultValue={ing.amount}
                              className="w-20 px-2 py-1.5 border border-slate-200 rounded text-sm font-sans text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-500 font-sans w-4">g</span>
                          </div>
                        </div>
                        
                        {!ing.matched && (
                          <div className="mt-3 p-2 bg-amber-50 rounded flex items-center justify-between">
                            <span className="text-xs text-amber-800 font-sans">Not in ingredient library</span>
                            <button className="text-xs text-blue-600 hover:text-blue-700 font-sans font-medium flex items-center gap-1">
                              <Plus className="w-3 h-3" />
                              Add to library
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Process Section */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('process')}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition ${expandedSections.includes('process') ? 'rotate-90' : ''}`} />
                    <span className="font-sans font-medium text-slate-800">Process Steps</span>
                    <span className="text-sm text-slate-500 font-sans">({parsedRecipe.process.length})</span>
                  </div>
                </button>
                
                {expandedSections.includes('process') && (
                  <div className="p-4 space-y-3">
                    {parsedRecipe.process.map((step) => (
                      <div key={step.step} className="flex gap-3">
                        <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0">
                          {step.step}
                        </span>
                        <p className="text-sm text-slate-600 font-sans">{step.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3">
          {step === 'input' && (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
              >
                Cancel
              </button>
              <button
                onClick={handleFetch}
                disabled={!url.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-lg transition font-sans flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Import Recipe
              </button>
            </>
          )}
          {step === 'fetching' && (
            <button
              onClick={() => setStep('input')}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
            >
              Cancel
            </button>
          )}
          {step === 'review' && (
            <>
              <button
                onClick={() => setStep('input')}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition font-sans"
              >
                Save Recipe
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
