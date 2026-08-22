import React, { useState } from 'react';
import { GripVertical, ArrowUpDown, Check } from 'lucide-react';

export default function IngredientDragDrop() {
  const [dragState, setDragState] = useState('normal'); // 'normal', 'dragging', 'dropping'
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState(null);

  const ingredients = [
    { id: 1, name: 'Whole Milk 3.5%', category: 'Base', categoryColor: 'bg-slate-100 text-slate-600', amount: '500g' },
    { id: 2, name: 'Heavy Cream 35%', category: 'Fat', categoryColor: 'bg-amber-50 text-amber-700', amount: '150g' },
    { id: 3, name: 'Fresh Goat Cheese', category: 'Fat', categoryColor: 'bg-amber-50 text-amber-700', amount: '120g' },
    { id: 4, name: 'Sucrose', category: 'Sweetener', categoryColor: 'bg-yellow-50 text-yellow-700', amount: '95g' },
    { id: 5, name: 'Dextrose', category: 'Sweetener', categoryColor: 'bg-yellow-50 text-yellow-700', amount: '55g' },
    { id: 6, name: 'Skim Milk Powder', category: 'Base', categoryColor: 'bg-slate-100 text-slate-600', amount: '40g' },
    { id: 7, name: 'Freeze-dried Asian Pear', category: 'Flavor', categoryColor: 'bg-blue-50 text-blue-700', amount: '35g' },
    { id: 8, name: 'Stabilizer Blend', category: 'Stabilizer', categoryColor: 'bg-emerald-50 text-emerald-700', amount: '5g' },
  ];

  const sortOptions = [
    { id: 'manual', label: 'Manual order' },
    { id: 'category', label: 'By category' },
    { id: 'alpha', label: 'Alphabetical' },
    { id: 'amount-desc', label: 'Amount (high to low)' },
    { id: 'amount-asc', label: 'Amount (low to high)' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Ingredient Drag & Drop</h1>
        <p className="text-slate-500 font-sans mb-6">Drag handle to reorder. Sort menu for automatic ordering.</p>

        {/* Demo Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3 font-sans">Demo states:</p>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={() => { setDragState('normal'); setDraggedIndex(null); setDropIndex(null); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${dragState === 'normal' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Normal
            </button>
            <button 
              onClick={() => { setDragState('dragging'); setDraggedIndex(3); setDropIndex(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans ${dragState === 'dragging' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Dragging (row 4 → position 2)
            </button>
          </div>
        </div>

        {/* Ingredients Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-serif font-medium text-slate-800">Ingredients</h2>
            
            {/* Sort Menu */}
            <div className="relative">
              <button 
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition font-sans"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>
              
              {sortMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => { setCurrentSort(option.id); setSortMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans"
                    >
                      <span>{option.label}</span>
                      {currentSort === option.id && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <table className="w-full text-sm font-sans">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="w-10"></th>
                <th className="text-left px-3 py-3 font-medium">Name</th>
                <th className="text-left px-3 py-3 font-medium w-24">Category</th>
                <th className="text-right px-5 py-3 font-medium w-20">Amount</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {ingredients.map((row, index) => {
                const isDragged = dragState === 'dragging' && draggedIndex === index;
                const showDropIndicatorAbove = dragState === 'dragging' && dropIndex === index;
                
                return (
                  <React.Fragment key={row.id}>
                    {/* Drop indicator line */}
                    {showDropIndicatorAbove && (
                      <tr>
                        <td colSpan={4} className="p-0">
                          <div className="h-0.5 bg-blue-500 mx-3 rounded-full" />
                        </td>
                      </tr>
                    )}
                    
                    {/* Regular row */}
                    <tr 
                      className={`border-t border-slate-100 transition group ${
                        isDragged ? 'opacity-40 bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Drag Handle */}
                      <td className="pl-3 py-3">
                        <div className={`w-6 h-6 flex items-center justify-center rounded cursor-grab active:cursor-grabbing ${
                          isDragged ? 'text-slate-300' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                        }`}>
                          <GripVertical className="w-4 h-4" />
                        </div>
                      </td>
                      
                      {/* Name */}
                      <td className="px-3 py-3">{row.name}</td>
                      
                      {/* Category */}
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.categoryColor}`}>
                          {row.category}
                        </span>
                      </td>
                      
                      {/* Amount */}
                      <td className="px-5 py-3 text-right font-medium text-slate-600">{row.amount}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
              
              {/* Empty row for adding */}
              <tr className="border-t border-slate-100">
                <td className="pl-3 py-3">
                  <div className="w-6 h-6" />
                </td>
                <td className="px-3 py-3 text-slate-400">Add ingredient...</td>
                <td className="px-3 py-3"><span className="text-slate-300">—</span></td>
                <td className="px-5 py-3 text-right text-slate-300">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ghost Row - appears when dragging */}
        {dragState === 'dragging' && draggedIndex !== null && (
          <div 
            className="fixed pointer-events-none"
            style={{ 
              top: '300px', 
              left: '50%', 
              transform: 'translateX(-50%) rotate(1deg)',
              width: '500px',
            }}
          >
            <div className="bg-white border-2 border-blue-500 rounded-lg shadow-xl px-4 py-3 flex items-center gap-4">
              <GripVertical className="w-4 h-4 text-blue-400" />
              <span className="font-sans text-sm font-medium text-slate-700">
                {ingredients[draggedIndex].name}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${ingredients[draggedIndex].categoryColor}`}>
                {ingredients[draggedIndex].category}
              </span>
              <span className="ml-auto font-sans text-sm font-medium text-slate-600">
                {ingredients[draggedIndex].amount}
              </span>
            </div>
          </div>
        )}

        {/* Interaction Guide */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-serif font-medium text-slate-800 mb-4">Interaction Guide</h3>
          <div className="space-y-4 text-sm font-sans">
            <div>
              <p className="font-medium text-slate-700 mb-2">Drag to reorder:</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Grab the handle (⋮⋮) on the left</li>
                <li>• Drag up or down</li>
                <li>• Blue line shows where row will drop</li>
                <li>• Release to confirm position</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium text-slate-700 mb-2">Sort automatically:</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Click "Sort" button</li>
                <li>• Choose: Category, Alphabetical, Amount</li>
                <li>• Manual dragging clears auto-sort</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-slate-700 mb-2">Touch (tablet):</p>
              <ul className="space-y-1 text-slate-600 ml-4">
                <li>• Long-press handle to start drag</li>
                <li>• Drag with finger</li>
                <li>• Lift to drop</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
