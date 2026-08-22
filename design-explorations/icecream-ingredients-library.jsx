import React, { useState } from 'react';
import { 
  Search, Plus, MoreHorizontal, Copy, Trash2, Pencil,
  ChevronDown, X, Check, AlertCircle, ExternalLink
} from 'lucide-react';

// AI Icon
const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

export default function IngredientsLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  
  // User settings (from onboarding)
  const [showStabilizer] = useState(true); // Would come from user preferences
  const [showEmulsifier] = useState(false);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'sweetener', label: 'Sweeteners' },
    { id: 'fat', label: 'Fats' },
    { id: 'stabilizer', label: 'Stabilizers' },
    { id: 'emulsifier', label: 'Emulsifiers' },
    { id: 'flavor', label: 'Flavors' },
    { id: 'other', label: 'Other' },
  ];

  const categoryColors = {
    'Dairy': 'bg-blue-50 text-blue-700',
    'Sweetener': 'bg-amber-50 text-amber-700',
    'Fat': 'bg-yellow-50 text-yellow-700',
    'Stabilizer': 'bg-emerald-50 text-emerald-700',
    'Emulsifier': 'bg-purple-50 text-purple-700',
    'Flavor': 'bg-pink-50 text-pink-700',
    'Other': 'bg-slate-100 text-slate-600',
  };

  // Sample ingredients data
  const ingredients = [
    { id: 1, name: 'Whole Milk', category: 'Dairy', water: 87.7, sugar: 4.8, fat: 3.7, msnf: 8.6, solids: 12.3, pac: 9.6, pod: 48, stabilizer: 0, emulsifier: 0, kcal: 61, density: 1.03, system: true },
    { id: 2, name: 'Heavy Cream (36%)', category: 'Dairy', water: 57.7, sugar: 2.8, fat: 36, msnf: 5.5, solids: 42.3, pac: 5.6, pod: 28, stabilizer: 0, emulsifier: 0, kcal: 340, density: 1.01, system: true },
    { id: 3, name: 'Skim Milk Powder', category: 'Dairy', water: 3.2, sugar: 52.0, fat: 0.8, msnf: 96.0, solids: 96.8, pac: 104, pod: 520, stabilizer: 0, emulsifier: 0, kcal: 362, density: 0.55, system: true },
    { id: 4, name: 'Sucrose', category: 'Sweetener', water: 0, sugar: 100, fat: 0, msnf: 0, solids: 100, pac: 100, pod: 100, stabilizer: 0, emulsifier: 0, kcal: 400, density: 0.85, system: true },
    { id: 5, name: 'Dextrose', category: 'Sweetener', water: 0, sugar: 100, fat: 0, msnf: 0, solids: 100, pac: 180, pod: 70, stabilizer: 0, emulsifier: 0, kcal: 360, density: 0.80, system: true },
    { id: 6, name: 'Invert Sugar', category: 'Sweetener', water: 22, sugar: 78, fat: 0, msnf: 0, solids: 78, pac: 190, pod: 130, stabilizer: 0, emulsifier: 0, kcal: 310, density: 1.40, system: true },
    { id: 7, name: 'Glucose Syrup DE40', category: 'Sweetener', water: 20, sugar: 80, fat: 0, msnf: 0, solids: 80, pac: 90, pod: 50, stabilizer: 0, emulsifier: 0, kcal: 320, density: 1.38, system: true },
    { id: 8, name: 'Egg Yolk', category: 'Fat', water: 52.3, sugar: 0.6, fat: 26.5, msnf: 0, solids: 47.7, pac: 1.2, pod: 6, stabilizer: 0, emulsifier: 8, kcal: 322, density: 1.03, system: true },
    { id: 9, name: 'Cocoa Butter', category: 'Fat', water: 0, sugar: 0, fat: 100, msnf: 0, solids: 100, pac: 0, pod: 0, stabilizer: 0, emulsifier: 0, kcal: 884, density: 0.91, system: true },
    { id: 10, name: 'Locust Bean Gum', category: 'Stabilizer', water: 10, sugar: 0, fat: 0, msnf: 0, solids: 90, pac: 0, pod: 0, stabilizer: 100, emulsifier: 0, kcal: 0, density: 0.50, system: true },
    { id: 11, name: 'Guar Gum', category: 'Stabilizer', water: 10, sugar: 0, fat: 0, msnf: 0, solids: 90, pac: 0, pod: 0, stabilizer: 100, emulsifier: 0, kcal: 0, density: 0.50, system: true },
    { id: 12, name: 'Vanilla Extract', category: 'Flavor', water: 53, sugar: 13, fat: 0, msnf: 0, solids: 47, pac: 26, pod: 0, stabilizer: 0, emulsifier: 0, kcal: 288, density: 1.03, system: true },
    { id: 13, name: 'Freeze-dried Mango', category: 'Flavor', water: 3, sugar: 58, fat: 0.4, msnf: 0, solids: 97, pac: 116, pod: 80, stabilizer: 0, emulsifier: 0, kcal: 380, density: 0.25, system: false },
  ];

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || ing.category.toLowerCase() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteClick = (ingredient) => {
    setIngredientToDelete(ingredient);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCellClick = (id, field) => {
    setEditingCell({ id, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const EditableCell = ({ ingredient, field, value, type = 'number' }) => {
    const isEditing = editingCell?.id === ingredient.id && editingCell?.field === field;
    
    if (isEditing) {
      return (
        <input
          type={type}
          defaultValue={value}
          autoFocus
          onBlur={handleCellBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleCellBlur()}
          className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded focus:outline-none bg-white"
        />
      );
    }
    
    return (
      <span 
        onClick={() => handleCellClick(ingredient.id, field)}
        className="cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded -mx-1"
      >
        {value}
      </span>
    );
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
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50">
            Home
          </button>
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50">
            Recipes
          </button>
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50">
            Templates
          </button>
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans bg-slate-100 text-slate-800 font-medium">
            Ingredients
          </button>
        </nav>
        
        <button 
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Ingredient
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-slate-800">Ingredients Library</h1>
            <p className="text-sm text-slate-500 font-sans">{ingredients.length} ingredients ({ingredients.filter(i => !i.system).length} custom)</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredients..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Ingredients Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium sticky left-0 bg-slate-50 z-10 min-w-[180px]">Name</th>
                  <th className="text-left px-3 py-3 font-medium min-w-[100px]">Category</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[70px]">Water %</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[70px]">Sugar %</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[70px]">Fat %</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[70px]">MSNF %</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[70px]">Solids %</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[60px]">PAC</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[60px]">POD</th>
                  {showStabilizer && <th className="text-right px-3 py-3 font-medium min-w-[70px]">Stab %</th>}
                  {showEmulsifier && <th className="text-right px-3 py-3 font-medium min-w-[70px]">Emul %</th>}
                  <th className="text-right px-3 py-3 font-medium min-w-[70px]">Density</th>
                  <th className="text-right px-3 py-3 font-medium min-w-[60px]">kcal</th>
                  <th className="text-right px-4 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-slate-50 transition group">
                    <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{ingredient.name}</span>
                        {!ingredient.system && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">Custom</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[ingredient.category]}`}>
                        {ingredient.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="water" value={ingredient.water} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="sugar" value={ingredient.sugar} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="fat" value={ingredient.fat} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="msnf" value={ingredient.msnf} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="solids" value={ingredient.solids} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="pac" value={ingredient.pac} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="pod" value={ingredient.pod} />
                    </td>
                    {showStabilizer && (
                      <td className="px-3 py-3 text-right text-slate-600">
                        <EditableCell ingredient={ingredient} field="stabilizer" value={ingredient.stabilizer} />
                      </td>
                    )}
                    {showEmulsifier && (
                      <td className="px-3 py-3 text-right text-slate-600">
                        <EditableCell ingredient={ingredient} field="emulsifier" value={ingredient.emulsifier} />
                      </td>
                    )}
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="density" value={ingredient.density} />
                    </td>
                    <td className="px-3 py-3 text-right text-slate-600">
                      <EditableCell ingredient={ingredient} field="kcal" value={ingredient.kcal} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === ingredient.id ? null : ingredient.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === ingredient.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans">
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans">
                              <Copy className="w-4 h-4 text-slate-400" />
                              Duplicate
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button 
                              onClick={() => handleDeleteClick(ingredient)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-sans"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredIngredients.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-sans font-medium text-slate-700 mb-1">No ingredients found</h3>
            <p className="text-sm text-slate-500 font-sans">Try a different search or filter</p>
          </div>
        )}
      </main>

      {/* Add Ingredient Modal */}
      {addModalOpen && <AddIngredientSlideout onClose={() => setAddModalOpen(false)} />}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && ingredientToDelete && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif text-lg font-semibold text-slate-800 mb-1">
                      Delete ingredient?
                    </h2>
                    <p className="text-sm text-slate-500 font-sans">
                      Are you sure you want to delete <span className="font-medium text-slate-700">"{ingredientToDelete.name}"</span>? 
                      {ingredientToDelete.system && " This is a system ingredient and will be restored on next update."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex items-center gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition font-sans flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Add Ingredient Slideout with AI Lookup
function AddIngredientSlideout({ onClose }) {
  const [step, setStep] = useState('input'); // 'input', 'searching', 'results', 'form'
  const [ingredientName, setIngredientName] = useState('');
  const [lookupSource, setLookupSource] = useState('ai'); // 'ai', 'usda'
  const [selectedResult, setSelectedResult] = useState(null);

  // Simulated AI results
  const aiResults = [
    { 
      source: 'USDA', 
      name: 'Mangos, dried (freeze-dried)', 
      confidence: 'high',
      data: { water: 3, sugar: 58, fat: 0.4, msnf: 0, solids: 97, pac: 116, pod: 80, kcal: 380 }
    },
    { 
      source: 'Manufacturer', 
      name: 'Freeze-dried Mango Powder (generic)', 
      confidence: 'medium',
      data: { water: 2.5, sugar: 60, fat: 0.5, msnf: 0, solids: 97.5, pac: 120, pod: 82, kcal: 385 }
    },
  ];

  const handleSearch = () => {
    setStep('searching');
    setTimeout(() => setStep('results'), 1500);
  };

  const handleUseResult = (result) => {
    setSelectedResult(result);
    setStep('form');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      />
      
      {/* Slideout Panel */}
      <div className="fixed top-0 right-0 h-full w-[480px] bg-white border-l border-slate-200 shadow-xl z-40 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-slate-800">Add Ingredient</h2>
            <p className="text-sm text-slate-500 font-sans">Search for data or enter manually</p>
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
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  placeholder="e.g., Freeze-dried mango"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-2">
                  Lookup Source
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setLookupSource('ai')}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      lookupSource === 'ai' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IceCreamIdle className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-slate-800">AI Search</span>
                      <span className="px-1.5 py-0.5 bg-violet-100 text-violet-700 text-xs rounded font-medium">Recommended</span>
                    </div>
                    <p className="text-sm text-slate-500">Searches USDA, manufacturers, and food science databases</p>
                  </button>
                  <button
                    onClick={() => setLookupSource('usda')}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      lookupSource === 'usda' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-800">USDA Only</span>
                    </div>
                    <p className="text-sm text-slate-500">Search USDA FoodData Central database</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
                >
                  Skip — Enter Manually
                </button>
                <button
                  onClick={handleSearch}
                  disabled={!ingredientName.trim()}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-lg transition font-sans flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Step: Searching */}
          {step === 'searching' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <IceCreamIdle className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <h3 className="font-sans font-medium text-slate-800 mb-1">Searching for "{ingredientName}"</h3>
              <p className="text-sm text-slate-500 font-sans">Checking USDA, manufacturer data, and food science sources...</p>
            </div>
          )}

          {/* Step: Results */}
          {step === 'results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600 font-sans">
                  Found {aiResults.length} results for "{ingredientName}"
                </p>
                <button 
                  onClick={() => setStep('input')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-sans"
                >
                  Search again
                </button>
              </div>

              <div className="space-y-3">
                {aiResults.map((result, i) => (
                  <div 
                    key={i}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => handleUseResult(result)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-sans font-medium text-slate-800">{result.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-sans">Source: {result.source}</span>
                          <span className={`px-1.5 py-0.5 text-xs rounded ${
                            result.confidence === 'high' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {result.confidence === 'high' ? 'High confidence' : 'Medium confidence'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs font-sans">
                      <div className="bg-white border border-slate-100 rounded p-2">
                        <span className="text-slate-500">Sugar</span>
                        <p className="font-medium text-slate-700">{result.data.sugar}%</p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded p-2">
                        <span className="text-slate-500">Fat</span>
                        <p className="font-medium text-slate-700">{result.data.fat}%</p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded p-2">
                        <span className="text-slate-500">PAC</span>
                        <p className="font-medium text-slate-700">{result.data.pac}</p>
                      </div>
                      <div className="bg-white border border-slate-100 rounded p-2">
                        <span className="text-slate-500">POD</span>
                        <p className="font-medium text-slate-700">{result.data.pod}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('form')}
                className="w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition font-sans"
              >
                None of these — enter manually
              </button>
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <div className="space-y-5">
              {selectedResult && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-sm text-emerald-800 font-sans">
                    Pre-filled from {selectedResult.source}. Review and adjust as needed.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedResult?.name || ingredientName}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-1.5">
                  Category
                </label>
                <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Flavor</option>
                  <option>Dairy</option>
                  <option>Sweetener</option>
                  <option>Fat</option>
                  <option>Stabilizer</option>
                  <option>Emulsifier</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-3">
                  Nutritional Data
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Water %', field: 'water' },
                    { label: 'Sugar %', field: 'sugar' },
                    { label: 'Fat %', field: 'fat' },
                    { label: 'MSNF %', field: 'msnf' },
                    { label: 'Solids %', field: 'solids' },
                    { label: 'kcal /100g', field: 'kcal' },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-slate-500 font-sans mb-1">
                        {label}
                      </label>
                      <input
                        type="number"
                        defaultValue={selectedResult?.data?.[field] || ''}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 font-sans mb-3">
                  Ice Cream Properties
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 font-sans mb-1">
                      PAC
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedResult?.data?.pac || ''}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 font-sans mb-1">
                      POD
                    </label>
                    <input
                      type="number"
                      defaultValue={selectedResult?.data?.pod || ''}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 font-sans mb-1">
                      Density (g/mL)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={selectedResult?.data?.density || ''}
                      placeholder="1.00"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Used for volume→weight conversion when importing recipes</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-sans">
                  PAC and POD values may need adjustment based on your specific ingredient form. Check manufacturer data or food science references for accuracy.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center gap-3">
          {step === 'form' ? (
            <>
              <button
                onClick={() => selectedResult ? setStep('results') : setStep('input')}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition font-sans"
              >
                Add Ingredient
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-sans"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
}
