import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmationModal() {
  const [scenario, setScenario] = useState('single'); // 'single', 'multiple'
  const [isOpen, setIsOpen] = useState(true);

  const singleRecipe = { name: 'Asian Pear Goat Cheese', type: 'Gelato' };
  const multipleRecipes = [
    { id: 1, name: 'Asian Pear Goat Cheese', type: 'Gelato' },
    { id: 2, name: 'Banana Cream Pie', type: 'Ice Cream' },
    { id: 3, name: 'Mexican Chocolate', type: 'Gelato' },
    { id: 4, name: 'Strawberry Balsamic', type: 'Sorbet' },
    { id: 5, name: 'Honey Lavender', type: 'Gelato' },
  ];

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center gap-4">
        <button 
          onClick={() => { setScenario('single'); setIsOpen(true); }}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-sans text-sm hover:bg-slate-50"
        >
          Delete Single Recipe
        </button>
        <button 
          onClick={() => { setScenario('multiple'); setIsOpen(true); }}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-sans text-sm hover:bg-slate-50"
        >
          Delete Multiple (5)
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Dimmed background */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-lg font-semibold text-slate-800 mb-1">
                  {scenario === 'single' ? 'Delete recipe?' : `Delete ${multipleRecipes.length} recipes?`}
                </h2>
                <p className="text-sm text-slate-500 font-sans">
                  {scenario === 'single' 
                    ? <>Are you sure you want to delete <span className="font-medium text-slate-700">"{singleRecipe.name}"</span>? This action cannot be undone.</>
                    : <>Are you sure you want to delete these recipes? This action cannot be undone.</>
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Recipe preview (single) */}
          {scenario === 'single' && (
            <div className="mx-6 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <span className="text-lg">🍨</span>
                </div>
                <div>
                  <p className="font-sans font-medium text-slate-700 text-sm">{singleRecipe.name}</p>
                  <p className="text-xs text-slate-500 font-sans">{singleRecipe.type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recipe list (multiple) */}
          {scenario === 'multiple' && (
            <div className="mx-6 mb-4 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-200">
                {multipleRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🍨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-medium text-slate-700 text-sm truncate">{recipe.name}</p>
                      <p className="text-xs text-slate-500 font-sans">{recipe.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition font-sans flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
