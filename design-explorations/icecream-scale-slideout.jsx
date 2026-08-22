import React, { useState } from 'react';
import { X, ArrowRight, Scale } from 'lucide-react';

export default function ScaleSlideout() {
  const [scaleOpen, setScaleOpen] = useState(true);
  const [scaleMode, setScaleMode] = useState('yield'); // 'yield' or 'ingredient'
  const [targetYield, setTargetYield] = useState('2.00');
  const [selectedIngredient, setSelectedIngredient] = useState('milk');
  const [targetAmount, setTargetAmount] = useState('1000');
  
  const currentYield = 1.00; // Liters
  const scaleFactor = scaleMode === 'yield' 
    ? parseFloat(targetYield) / currentYield 
    : parseFloat(targetAmount) / 500; // 500 is current milk amount

  const ingredients = [
    { id: 'milk', name: 'Whole Milk 3.5%', amount: 500, category: 'Base' },
    { id: 'cream', name: 'Heavy Cream 35%', amount: 150, category: 'Fat' },
    { id: 'sucrose', name: 'Sucrose', amount: 130, category: 'Sweetener' },
    { id: 'dextrose', name: 'Dextrose', amount: 30, category: 'Sweetener' },
    { id: 'smp', name: 'Skim Milk Powder', amount: 40, category: 'Base' },
    { id: 'vanilla', name: 'Vanilla Extract', amount: 8, category: 'Flavor' },
    { id: 'stabilizer', name: 'Stabilizer Blend', amount: 5, category: 'Stabilizer' },
  ];

  const categoryColors = {
    'Base': 'bg-slate-100 text-slate-600',
    'Fat': 'bg-amber-50 text-amber-700',
    'Sweetener': 'bg-yellow-50 text-yellow-700',
    'Flavor': 'bg-blue-50 text-blue-700',
    'Stabilizer': 'bg-emerald-50 text-emerald-700',
  };

  const getScaledAmount = (amount, ingredientId) => {
    if (scaleMode === 'ingredient' && ingredientId === selectedIngredient) {
      return parseFloat(targetAmount);
    }
    return Math.round(amount * scaleFactor);
  };

  const totalCurrent = ingredients.reduce((sum, i) => sum + i.amount, 0);
  const totalScaled = ingredients.reduce((sum, i) => sum + getScaledAmount(i.amount, i.id), 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Preview */}
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Scale Slideout</h1>
        <p className="text-slate-500 font-sans mb-8">Scale recipe by total yield or by fixing one ingredient</p>

        {/* Trigger Button Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-600 font-sans">From header actions:</span>
            <button 
              onClick={() => setScaleOpen(true)}
              className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition font-sans flex items-center gap-2 border border-slate-200"
            >
              <Scale className="w-4 h-4" />
              Scale
            </button>
          </div>
        </div>
      </div>

      {/* Scale Slideout */}
      <div 
        className={`fixed top-0 right-0 h-full w-[440px] bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          scaleOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-serif font-semibold text-slate-800 text-lg">Scale Recipe</h2>
              <p className="text-xs text-slate-500 font-sans">Adjust all ingredients proportionally</p>
            </div>
          </div>
          <button 
            onClick={() => setScaleOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Mode Toggle */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setScaleMode('yield')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition font-sans ${
                  scaleMode === 'yield'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                By Yield
              </button>
              <button
                onClick={() => setScaleMode('ingredient')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition font-sans ${
                  scaleMode === 'ingredient'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                By Ingredient
              </button>
            </div>
          </div>

          {/* Scale Input */}
          <div className="p-6 border-b border-slate-100">
            {scaleMode === 'yield' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-3">
                  Target Yield
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-400 font-sans">
                    <span className="text-lg font-medium text-slate-300">{currentYield.toFixed(2)}</span>
                    <span className="text-sm">L</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={targetYield}
                      onChange={(e) => setTargetYield(e.target.value)}
                      className="w-24 px-3 py-2 text-lg font-medium text-slate-800 border-2 border-blue-500 rounded-lg focus:outline-none font-sans text-right"
                    />
                    <select className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-sans focus:outline-none focus:border-blue-500">
                      <option>L</option>
                      <option>qt</option>
                      <option>gal</option>
                    </select>
                  </div>
                </div>
                
                {/* Quick Scale Buttons */}
                <div className="flex gap-2 mt-4">
                  {['0.5×', '1.5×', '2×', '3×'].map((factor) => (
                    <button
                      key={factor}
                      onClick={() => setTargetYield((currentYield * parseFloat(factor)).toFixed(2))}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-3">
                  Fix Ingredient Amount
                </label>
                
                {/* Ingredient Selector */}
                <select
                  value={selectedIngredient}
                  onChange={(e) => {
                    setSelectedIngredient(e.target.value);
                    const ing = ingredients.find(i => i.id === e.target.value);
                    if (ing) setTargetAmount(String(ing.amount * 2)); // Default to 2x
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-sans focus:outline-none focus:border-blue-500 mb-4"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                  ))}
                </select>

                {/* Amount Input */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-slate-400 font-sans">
                    <span className="text-lg font-medium text-slate-300">
                      {ingredients.find(i => i.id === selectedIngredient)?.amount}
                    </span>
                    <span className="text-sm">g</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-24 px-3 py-2 text-lg font-medium text-slate-800 border-2 border-blue-500 rounded-lg focus:outline-none font-sans text-right"
                    />
                    <span className="text-slate-500 font-sans">g</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-sans mt-3">
                  All other ingredients will scale proportionally
                </p>
              </div>
            )}
          </div>

          {/* Scale Factor Display */}
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 font-sans">Scale Factor</span>
              <span className="text-2xl font-bold text-blue-600 font-sans">
                {scaleFactor.toFixed(2)}×
              </span>
            </div>
          </div>

          {/* Ingredient Preview */}
          <div className="p-6">
            <h3 className="text-sm font-medium text-slate-700 font-sans mb-3">Preview Changes</h3>
            <div className="space-y-2">
              {ingredients.map((ing) => {
                const newAmount = getScaledAmount(ing.amount, ing.id);
                const isFixed = scaleMode === 'ingredient' && ing.id === selectedIngredient;
                
                return (
                  <div 
                    key={ing.id} 
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      isFixed ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-sans ${isFixed ? 'text-blue-700 font-medium' : 'text-slate-700'}`}>
                        {ing.name}
                      </span>
                      {isFixed && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-sans">
                          Fixed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-sans">
                      <span className="text-slate-400">{ing.amount}g</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className={`font-medium ${isFixed ? 'text-blue-600' : 'text-slate-700'}`}>
                        {newAmount}g
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-700 font-sans">Total</span>
              <div className="flex items-center gap-2 text-sm font-sans">
                <span className="text-slate-400">{totalCurrent}g</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <span className="font-medium text-slate-700">{totalScaled}g</span>
              </div>
            </div>

            {/* New Yield */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-slate-700 font-sans">New Yield</span>
              <span className="font-medium text-slate-700 font-sans">
                {(currentYield * scaleFactor).toFixed(2)} L
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-3">
            <button 
              onClick={() => setScaleOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition font-sans"
            >
              Cancel
            </button>
            <button 
              onClick={() => setScaleOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition font-sans"
            >
              Apply Scale
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {scaleOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setScaleOpen(false)}
        />
      )}
    </div>
  );
}
