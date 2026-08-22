import React, { useState } from 'react';
import { 
  Search, Star, BookOpen, ChevronDown, Plus,
  MoreHorizontal, Pencil, Trash2, Copy, X, Check
} from 'lucide-react';

export default function TemplateLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all'); // 'all', 'user', 'system'
  const [favorites, setFavorites] = useState(['vanilla-gelato-simple', 'user-goatcheese']);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const typeFilters = [
    { id: 'all', label: 'All Types' },
    { id: 'gelato', label: 'Gelato' },
    { id: 'icecream', label: 'Ice Cream' },
    { id: 'premium', label: 'Premium' },
    { id: 'superpremium', label: 'Super Premium' },
    { id: 'sorbet', label: 'Sorbet' },
    { id: 'sherbet', label: 'Sherbet' },
    { id: 'frozenyogurt', label: 'Frozen Yogurt' },
  ];

  const sourceFilters = [
    { id: 'all', label: 'All Templates' },
    { id: 'user', label: 'My Templates' },
    { id: 'system', label: 'System Templates' },
  ];

  const typeColors = {
    'Gelato': 'bg-blue-50 text-blue-700',
    'Ice Cream': 'bg-amber-50 text-amber-700',
    'Premium': 'bg-amber-50 text-amber-700',
    'Super Premium': 'bg-amber-50 text-amber-700',
    'Sorbet': 'bg-pink-50 text-pink-700',
    'Sherbet': 'bg-orange-50 text-orange-700',
    'Frozen Yogurt': 'bg-emerald-50 text-emerald-700',
  };

  // System templates - Simple & Advanced for each type
  const systemTemplates = [
    // Gelato (no egg)
    { id: 'vanilla-gelato-simple', name: 'Vanilla Gelato', variant: 'Simple', type: 'Gelato', desc: 'No egg, single sugar. Classic Italian base.', system: true },
    { id: 'vanilla-gelato-advanced', name: 'Vanilla Gelato', variant: 'Advanced', type: 'Gelato', desc: 'No egg, multiple sugars, stabilizer. Professional quality.', system: true },
    // Ice Cream - Custard (egg)
    { id: 'vanilla-custard-simple', name: 'Vanilla Custard', variant: 'Simple', type: 'Ice Cream', desc: 'Egg custard, single sugar. Rich French-style base.', system: true },
    { id: 'vanilla-custard-advanced', name: 'Vanilla Custard', variant: 'Advanced', type: 'Ice Cream', desc: 'Egg custard, multiple sugars, stabilizer. Premium texture.', system: true },
    // Ice Cream - Philly (no egg)
    { id: 'vanilla-philly-simple', name: 'Vanilla Philly-Style', variant: 'Simple', type: 'Ice Cream', desc: 'No egg, single sugar. Light, bright flavors.', system: true },
    { id: 'vanilla-philly-advanced', name: 'Vanilla Philly-Style', variant: 'Advanced', type: 'Ice Cream', desc: 'No egg, multiple sugars, stabilizer. Great for fruit flavors.', system: true },
    // Premium (egg)
    { id: 'vanilla-premium-simple', name: 'Vanilla Premium', variant: 'Simple', type: 'Premium', desc: 'Egg custard, high fat, single sugar.', system: true },
    { id: 'vanilla-premium-advanced', name: 'Vanilla Premium', variant: 'Advanced', type: 'Premium', desc: 'Egg custard, high fat, multiple sugars, stabilizer.', system: true },
    // Super Premium (egg)
    { id: 'vanilla-superpremium-simple', name: 'Vanilla Super Premium', variant: 'Simple', type: 'Super Premium', desc: 'Egg custard, extra high fat, single sugar.', system: true },
    { id: 'vanilla-superpremium-advanced', name: 'Vanilla Super Premium', variant: 'Advanced', type: 'Super Premium', desc: 'Egg custard, extra high fat, multiple sugars, stabilizer.', system: true },
    // Sorbet (no egg, no dairy)
    { id: 'fruit-sorbet-simple', name: 'Fruit Sorbet', variant: 'Simple', type: 'Sorbet', desc: 'Single sugar, no stabilizer. Bright fruit flavor.', system: true },
    { id: 'fruit-sorbet-advanced', name: 'Fruit Sorbet', variant: 'Advanced', type: 'Sorbet', desc: 'Multiple sugars, stabilizer. Smooth scoopable texture.', system: true },
    // Sherbet (no egg, low dairy)
    { id: 'fruit-sherbet-simple', name: 'Fruit Sherbet', variant: 'Simple', type: 'Sherbet', desc: 'Low dairy, single sugar. Fruity and refreshing.', system: true },
    { id: 'fruit-sherbet-advanced', name: 'Fruit Sherbet', variant: 'Advanced', type: 'Sherbet', desc: 'Low dairy, multiple sugars, stabilizer.', system: true },
    // Frozen Yogurt (no egg)
    { id: 'vanilla-froyo-simple', name: 'Vanilla Frozen Yogurt', variant: 'Simple', type: 'Frozen Yogurt', desc: 'Tangy yogurt base, single sugar.', system: true },
    { id: 'vanilla-froyo-advanced', name: 'Vanilla Frozen Yogurt', variant: 'Advanced', type: 'Frozen Yogurt', desc: 'Yogurt base, multiple sugars, stabilizer.', system: true },
  ];

  const userTemplates = [
    { id: 'user-goatcheese', name: 'Goat Cheese Base', variant: null, type: 'Gelato', desc: 'My savory gelato starting point. Tangy and creamy.', system: false },
    { id: 'user-honeylav', name: 'Honey Lavender', variant: null, type: 'Ice Cream', desc: 'Floral and sweet, crowd favorite at parties.', system: false },
    { id: 'user-mangochili', name: 'Mango Chili', variant: null, type: 'Sorbet', desc: 'Spicy-sweet combo. Great palate cleanser.', system: false },
  ];

  const allTemplates = [...userTemplates, ...systemTemplates];

  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t.type.toLowerCase().replace(' ', '') === filterType;
    const matchesSource = filterSource === 'all' || 
                          (filterSource === 'user' && !t.system) ||
                          (filterSource === 'system' && t.system);
    return matchesSearch && matchesType && matchesSource;
  });

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const favoriteTemplates = filteredTemplates.filter(t => favorites.includes(t.id));
  const nonFavorites = filteredTemplates.filter(t => !favorites.includes(t.id));

  const TemplateCard = ({ template }) => {
    const isFavorite = favorites.includes(template.id);
    const isMenuOpen = openMenuId === template.id;
    
    return (
      <div className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition">
        {/* Favorite button */}
        <button
          onClick={() => toggleFavorite(template.id)}
          className={`absolute top-3 right-10 p-1.5 rounded-lg transition ${
            isFavorite 
              ? 'text-amber-400 hover:text-amber-500' 
              : 'text-slate-300 hover:text-amber-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Menu button */}
        <div className="absolute top-3 right-3">
          <button 
            onClick={() => setOpenMenuId(isMenuOpen ? null : template.id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans">
                <Copy className="w-4 h-4 text-slate-400" />
                Use Template
              </button>
              {!template.system && (
                <>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans">
                    <Pencil className="w-4 h-4 text-slate-400" />
                    Edit
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button 
                    onClick={() => handleDeleteClick(template)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-sans"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 pr-16">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            template.system ? 'bg-slate-100' : 'bg-blue-50'
          }`}>
            <BookOpen className={`w-5 h-5 ${template.system ? 'text-slate-500' : 'text-blue-500'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-sans font-medium text-slate-800">{template.name}</h3>
              {template.variant && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  template.variant === 'Simple' 
                    ? 'bg-slate-100 text-slate-600' 
                    : 'bg-violet-100 text-violet-700'
                }`}>
                  {template.variant}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[template.type]}`}>
                {template.type}
              </span>
              {template.system && (
                <span className="text-xs text-slate-400 font-sans">System</span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-sans line-clamp-2">{template.desc}</p>
          </div>
        </div>
      </div>
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
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans bg-slate-100 text-slate-800 font-medium">
            Templates
          </button>
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50">
            Ingredients
          </button>
        </nav>
        
        <button className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Recipe
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-slate-800">Templates</h1>
            <p className="text-sm text-slate-500 font-sans">{allTemplates.length} templates ({userTemplates.length} yours, {systemTemplates.length} system)</p>
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
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Source Filter */}
            <div className="relative">
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {sourceFilters.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {typeFilters.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        {favoriteTemplates.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h2 className="font-sans font-medium text-slate-700 text-sm">Favorites</h2>
              <span className="text-xs text-slate-400 font-sans">({favoriteTemplates.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteTemplates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-sans font-medium text-slate-700 text-sm">
              {filterSource === 'user' ? 'My Templates' : filterSource === 'system' ? 'System Templates' : 'All Templates'}
            </h2>
            <span className="text-xs text-slate-400 font-sans">({nonFavorites.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nonFavorites.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-sans font-medium text-slate-700 mb-1">No templates found</h3>
            <p className="text-sm text-slate-500 font-sans">Try a different search or filter</p>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && templateToDelete && (
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
                      Delete template?
                    </h2>
                    <p className="text-sm text-slate-500 font-sans">
                      Are you sure you want to delete <span className="font-medium text-slate-700">"{templateToDelete.name}"</span>? This action cannot be undone.
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
