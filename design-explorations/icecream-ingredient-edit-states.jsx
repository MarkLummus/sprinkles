import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

// Ingredient row edit states demo
export default function IngredientEditStates() {
  const [activeRow, setActiveRow] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const ingredients = [
    { id: 1, name: 'Whole Milk 3.5%', category: 'Base', amount: 500 },
    { id: 2, name: 'Heavy Cream 35%', category: 'Fat', amount: 150 },
    { id: 3, name: 'Sucrose', category: 'Sweetener', amount: 130 },
    { id: 4, name: 'Dextrose', category: 'Sweetener', amount: 30 },
    { id: 'new', name: '', category: '', amount: '' }, // Always present empty row
  ];
  
  const ingredientLibrary = [
    { name: 'Whole Milk 3.5%', category: 'Base' },
    { name: 'Whole Milk 3.0%', category: 'Base' },
    { name: 'Skim Milk', category: 'Base' },
    { name: 'Heavy Cream 35%', category: 'Fat' },
    { name: 'Heavy Cream 40%', category: 'Fat' },
    { name: 'Butter', category: 'Fat' },
    { name: 'Sucrose', category: 'Sweetener' },
    { name: 'Dextrose', category: 'Sweetener' },
    { name: 'Invert Sugar', category: 'Sweetener' },
    { name: 'Honey', category: 'Sweetener' },
  ];
  
  const filteredIngredients = ingredientLibrary.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColors = {
    'Base': 'bg-slate-100 text-slate-600',
    'Fat': 'bg-amber-50 text-amber-700',
    'Sweetener': 'bg-yellow-50 text-yellow-700',
    'Flavor': 'bg-blue-50 text-blue-700',
    'Stabilizer': 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Ingredient Edit States</h1>
        <p className="text-slate-500 font-sans mb-8">Keyboard-driven editing. Tab between rows, arrows to navigate/adjust.</p>
        
        {/* Demo Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3 font-sans">View states:</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => { setActiveRow(null); setActiveField(null); setDropdownOpen(false); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${!activeRow ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Normal
            </button>
            <button 
              onClick={() => { setActiveRow(1); setActiveField('name'); setDropdownOpen(false); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${activeRow === 1 && activeField === 'name' && !dropdownOpen ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Name Focused
            </button>
            <button 
              onClick={() => { setActiveRow(1); setActiveField('name'); setDropdownOpen(true); setHighlightedIndex(2); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${activeRow === 1 && dropdownOpen ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Name + Dropdown (↑↓)
            </button>
            <button 
              onClick={() => { setActiveRow(2); setActiveField('amount'); setDropdownOpen(false); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${activeRow === 2 && activeField === 'amount' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Amount Focused
            </button>
            <button 
              onClick={() => { setActiveRow('new'); setActiveField('name'); setDropdownOpen(false); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${activeRow === 'new' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Empty Row Active
            </button>
          </div>
        </div>

        {/* Ingredients Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-serif font-medium text-slate-800">Ingredients</h2>
          </div>
          
          <table className="w-full text-sm font-sans">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium w-[280px]">Name</th>
                <th className="text-left px-3 py-3 font-medium w-[100px]">Category</th>
                <th className="text-right px-5 py-3 font-medium w-[120px]">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {ingredients.map((row) => {
                const isActive = activeRow === row.id;
                const isEmptyRow = row.id === 'new';
                
                return (
                  <tr 
                    key={row.id} 
                    className={`border-t border-slate-100 transition ${
                      isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Name Cell */}
                    <td className="px-5 py-2 relative">
                      {isActive && activeField === 'name' ? (
                        <div className="relative">
                          <div className="flex items-center px-3 py-1.5 bg-white border-2 border-blue-500 rounded-lg">
                            <input
                              type="text"
                              value={isEmptyRow ? searchQuery : row.name}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder={isEmptyRow ? "Type to search..." : ""}
                              className="flex-1 outline-none bg-transparent"
                              autoFocus
                            />
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          </div>
                          
                          {/* Dropdown - shows on arrow key press */}
                          {dropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                              <div className="max-h-48 overflow-y-auto">
                                {filteredIngredients.map((ing, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                                      i === highlightedIndex 
                                        ? 'bg-blue-500 text-white' 
                                        : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className={i === highlightedIndex ? 'text-white' : 'text-slate-700'}>
                                      {ing.name}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      i === highlightedIndex 
                                        ? 'bg-blue-400 text-white' 
                                        : categoryColors[ing.category]
                                    }`}>
                                      {ing.category}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`block px-3 py-1.5 rounded-lg ${
                          isEmptyRow ? 'text-slate-400' : ''
                        }`}>
                          {isEmptyRow ? 'Add ingredient...' : row.name}
                        </span>
                      )}
                    </td>
                    
                    {/* Category Cell - Read only, derived */}
                    <td className="px-3 py-2">
                      {row.category ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[row.category]}`}>
                          {row.category}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    
                    {/* Amount Cell */}
                    <td className="px-5 py-2 text-right">
                      {isActive && activeField === 'amount' ? (
                        <div className="inline-flex items-center">
                          <input
                            type="text"
                            defaultValue={row.amount || '100'}
                            className="w-20 px-2 py-1 text-right font-medium border-2 border-blue-500 rounded-lg focus:outline-none bg-white"
                            autoFocus
                          />
                          <span className="text-slate-400 text-xs ml-1.5">g</span>
                        </div>
                      ) : (
                        <span className={`font-medium ${isEmptyRow ? 'text-slate-300' : 'text-slate-600'}`}>
                          {isEmptyRow ? '—' : `${row.amount}g`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Keyboard hints */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-sans">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-slate-500 font-medium">Name field:</span>
                <span className="ml-2"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] ml-0.5">↓</kbd> show list / move selection</span>
                <span className="ml-3"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Enter</kbd> select → amount</span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-slate-500 font-medium">Amount field:</span>
                <span className="ml-2"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑</kbd><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] ml-0.5">↓</kbd> ±1g</span>
                <span className="ml-3"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Enter</kbd> / <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">Tab</kbd> next row</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interaction Flow */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-serif font-medium text-slate-800 mb-4">Interaction Flow</h3>
          <div className="space-y-4 text-sm font-sans">
            <div>
              <p className="font-medium text-slate-700 mb-2">Name field active:</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Type to filter ingredients</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">↓</kbd> opens dropdown and moves highlighted row</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Enter</kbd> selects highlighted ingredient, moves focus to amount (selected)</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Esc</kbd> closes dropdown, keeps current value</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-2">Amount field active:</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Type to replace value (not append)</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">↓</kbd> increments/decrements by 1g</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Tab</kbd> confirms and moves to next row's name field</li>
                <li>• <kbd className="px-1 py-0.5 bg-slate-100 rounded text-xs">Shift+Tab</kbd> moves back to name field</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-2">Empty row:</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Always present at bottom — no separate "add" button</li>
                <li>• Tab from last ingredient lands here</li>
                <li>• Selecting an ingredient creates the row, new empty row appears below</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
