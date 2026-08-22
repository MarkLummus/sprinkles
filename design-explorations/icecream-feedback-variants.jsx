import React, { useState } from 'react';
import { X, Star, ChevronRight, Check } from 'lucide-react';

// Icon component
const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

export default function FeedbackPromptVariants() {
  const [variant, setVariant] = useState('pending'); // 'pending', 'completed', 'multiple'
  const [rating, setRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState(null);

  const pendingRecipes = [
    { id: 1, name: 'Asian Pear Goat Cheese', type: 'Gelato', daysAgo: 2 },
    { id: 2, name: 'Banana Cream Pie', type: 'Ice Cream', daysAgo: 5 },
    { id: 3, name: 'Mexican Chocolate', type: 'Gelato', daysAgo: 7 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Feedback Prompt Variants</h1>
        <p className="text-slate-500 font-sans mb-6">Different states for the feedback prompt on home page</p>

        {/* Variant Selector */}
        <div className="flex gap-2 mb-8">
          <button 
            onClick={() => setVariant('pending')}
            className={`px-4 py-2 text-sm rounded-lg font-sans ${variant === 'pending' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            Single Pending
          </button>
          <button 
            onClick={() => setVariant('completed')}
            className={`px-4 py-2 text-sm rounded-lg font-sans ${variant === 'completed' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setVariant('multiple')}
            className={`px-4 py-2 text-sm rounded-lg font-sans ${variant === 'multiple' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
          >
            Multiple Pending
          </button>
        </div>

        {/* Single Pending Feedback */}
        {variant === 'pending' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                  🍨
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-medium text-slate-800">
                    How did Asian Pear Goat Cheese turn out?
                  </h3>
                  <p className="text-sm text-slate-500 font-sans mt-0.5">
                    Made 2 days ago • Your feedback helps improve future batches
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 font-sans">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="cursor-pointer hover:scale-110 transition"
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                star <= rating 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'fill-transparent text-slate-300 hover:text-amber-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="Any notes? (texture, flavor, what you'd change...)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans">
                        Save Feedback
                      </button>
                      <button className="px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition font-sans flex items-center gap-1.5">
                        <IceCreamIdle className="w-4 h-4" />
                        Help me improve it
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Completed Feedback */}
        {variant === 'completed' && (
          <div className="bg-white rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-serif font-medium text-slate-800">
                    Thanks for your feedback!
                  </h3>
                  <p className="text-sm text-slate-500 font-sans mt-0.5">
                    Your notes on <span className="font-medium text-slate-700">Asian Pear Goat Cheese</span> have been saved.
                  </p>
                </div>
              </div>
              <button className="p-1 hover:bg-emerald-100 rounded text-slate-400 hover:text-slate-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Multiple Pending Feedback */}
        {variant === 'multiple' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🍓</span>
                </div>
                <div>
                  <h3 className="font-serif font-medium text-slate-800">
                    {pendingRecipes.length} batches need feedback
                  </h3>
                  <p className="text-sm text-slate-500 font-sans mt-0.5">
                    Rate your recent batches to help improve future recipes
                  </p>
                </div>
              </div>
              <button className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipe List */}
            <div className="space-y-2">
              {pendingRecipes.map((recipe) => (
                <div key={recipe.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Collapsed Row */}
                  <button
                    onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🍨</span>
                      </div>
                      <div>
                        <p className="font-sans font-medium text-slate-700 text-sm">{recipe.name}</p>
                        <p className="text-xs text-slate-500 font-sans">{recipe.type} • {recipe.daysAgo} days ago</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition ${expandedRecipe === recipe.id ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Expanded Feedback Form */}
                  {expandedRecipe === recipe.id && (
                    <div className="border-t border-slate-200 p-4 bg-slate-50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600 font-sans">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                className="cursor-pointer hover:scale-110 transition"
                              >
                                <Star className="w-5 h-5 fill-transparent text-slate-300 hover:text-amber-300" />
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <textarea
                          placeholder="Any notes? (texture, flavor, what you'd change...)"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={2}
                        />
                        
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans">
                            Save
                          </button>
                          <button className="px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-200 rounded-lg transition font-sans">
                            Skip
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Skip All */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
              <button className="text-sm text-slate-500 hover:text-slate-700 font-sans">
                Dismiss all
              </button>
            </div>
          </div>
        )}

        {/* Usage Notes */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-serif font-medium text-slate-800 mb-3">Variant Usage</h3>
          <div className="space-y-3 text-sm font-sans">
            <div>
              <p className="font-medium text-slate-700">Single Pending</p>
              <p className="text-slate-500">Show when there's 1 recent batch without feedback (within 7 days)</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Completed</p>
              <p className="text-slate-500">Brief confirmation after submitting feedback. Auto-dismiss after 5 seconds or on click.</p>
            </div>
            <div>
              <p className="font-medium text-slate-700">Multiple Pending</p>
              <p className="text-slate-500">Show when 2+ batches need feedback. Collapsible list with individual forms. "Dismiss all" to hide.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
