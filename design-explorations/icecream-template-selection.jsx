import React, { useState } from 'react';
import { X, Search, Star, BookOpen, ChevronRight, Plus } from 'lucide-react';

export default function TemplateSelectionModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState(['vanilla-gelato', 'chocolate-icecream']);

  const typeFilters = [
    { id: 'all', label: 'All' },
    { id: 'gelato', label: 'Gelato' },
    { id: 'icecream', label: 'Ice Cream' },
    { id: 'sorbet', label: 'Sorbet' },
    { id: 'frozenyogurt', label: 'Frozen Yogurt' },
  ];

  const typeColors = {
    'Gelato': 'bg-blue-50 text-blue-700',
    'Ice Cream': 'bg-amber-50 text-amber-700',
    'Sorbet': 'bg-pink-50 text-pink-700',
    'Frozen Yogurt': 'bg-emerald-50 text-emerald-700',
  };

  const systemTemplates = [
    { id: 'vanilla-gelato', name: 'Vanilla Gelato', type: 'Gelato', desc: 'Classic Italian-style base. Dense, creamy, 7% fat.', system: true },
    { id: 'chocolate-gelato', name: 'Chocolate Gelato', type: 'Gelato', desc: 'Rich cocoa with balanced sweetness.', system: true },
    { id: 'pistachio-gelato', name: 'Pistachio Gelato', type: 'Gelato', desc: 'Nutty and aromatic. Uses pistachio paste.', system: true },
    { id: 'stracciatella', name: 'Stracciatella', type: 'Gelato', desc: 'Fior di latte with chocolate shards.', system: true },
    { id: 'vanilla-icecream', name: 'Vanilla Ice Cream', type: 'Ice Cream', desc: 'American-style, egg-based custard. 14% fat.', system: true },
    { id: 'chocolate-icecream', name: 'Chocolate Ice Cream', type: 'Ice Cream', desc: 'Rich and creamy with Dutch cocoa.', system: true },
    { id: 'strawberry-icecream', name: 'Strawberry Ice Cream', type: 'Ice Cream', desc: 'Fresh strawberry puree, light pink.', system: true },
    { id: 'mango-sorbet', name: 'Mango Sorbet', type: 'Sorbet', desc: 'Dairy-free, vibrant tropical flavor.', system: true },
    { id: 'lemon-sorbet', name: 'Lemon Sorbet', type: 'Sorbet', desc: 'Bright and refreshing. Palate cleanser.', system: true },
    { id: 'raspberry-sorbet', name: 'Raspberry Sorbet', type: 'Sorbet', desc: 'Deep berry flavor, beautiful color.', system: true },
    { id: 'vanilla-frozenyogurt', name: 'Vanilla Frozen Yogurt', type: 'Frozen Yogurt', desc: 'Tangy and light. Lower fat option.', system: true },
  ];

  const userTemplates = [
    { id: 'user-goatcheese', name: 'Goat Cheese Base', type: 'Gelato', desc: 'My savory gelato starting point.', system: false },
    { id: 'user-honeylav', name: 'Honey Lavender', type: 'Ice Cream', desc: 'Floral and sweet, crowd favorite.', system: false },
  ];

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const allTemplates = [...userTemplates, ...systemTemplates];
  
  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || t.type.toLowerCase().replace(' ', '') === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const favoriteTemplates = filteredTemplates.filter(t => favorites.includes(t.id));
  const nonFavoriteUser = filteredTemplates.filter(t => !t.system && !favorites.includes(t.id));
  const nonFavoriteSystem = filteredTemplates.filter(t => t.system && !favorites.includes(t.id));

  const TemplateCard = ({ template }) => {
    const isFavorite = favorites.includes(template.id);
    
    return (
      <div 
        className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
      >
        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition ${
            isFavorite 
              ? 'text-amber-400 hover:text-amber-500' 
              : 'text-slate-300 hover:text-amber-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
        </button>

        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            template.system ? 'bg-slate-100' : 'bg-blue-50'
          }`}>
            <BookOpen className={`w-5 h-5 ${template.system ? 'text-slate-500' : 'text-blue-500'}`} />
          </div>
          
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-sans font-medium text-slate-800 truncate">{template.name}</h3>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${typeColors[template.type]}`}>
              {template.type}
            </span>
            <p className="text-sm text-slate-500 font-sans line-clamp-2">{template.desc}</p>
          </div>
        </div>

        {/* Hover arrow */}
        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition">
          <ChevronRight className="w-5 h-5 text-blue-500" />
        </div>
      </div>
    );
  };

  const SectionHeader = ({ children, count }) => (
    <div className="flex items-center gap-2 mb-3">
      <h3 className="font-sans font-medium text-slate-700 text-sm">{children}</h3>
      <span className="text-xs text-slate-400 font-sans">({count})</span>
    </div>
  );

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <button 
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-sans font-medium hover:bg-blue-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Recipe (Open Modal)
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
      <div className="fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-800">New Recipe</h2>
            <p className="text-sm text-slate-500 font-sans">Choose a template to start from</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type filters */}
            <div className="flex items-center gap-1">
              {typeFilters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-sans transition ${
                    activeFilter === filter.id
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Start from scratch option */}
          <div className="mb-8">
            <div 
              className="group relative bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-slate-400 hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-slate-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-sans font-medium text-slate-700">Start from scratch</h3>
                  <p className="text-sm text-slate-500 font-sans">Blank recipe — you'll set all values yourself</p>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition" />
              </div>
            </div>
          </div>

          {/* Favorites */}
          {favoriteTemplates.length > 0 && (
            <div className="mb-8">
              <SectionHeader count={favoriteTemplates.length}>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline mr-1" />
                Favorites
              </SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteTemplates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}

          {/* My Templates */}
          {nonFavoriteUser.length > 0 && (
            <div className="mb-8">
              <SectionHeader count={nonFavoriteUser.length}>My Templates</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonFavoriteUser.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}

          {/* System Templates */}
          {nonFavoriteSystem.length > 0 && (
            <div>
              <SectionHeader count={nonFavoriteSystem.length}>System Templates</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonFavoriteSystem.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-sans font-medium text-slate-700 mb-1">No templates found</h3>
              <p className="text-sm text-slate-500 font-sans">Try a different search or filter</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <p className="text-sm text-slate-500 font-sans">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition font-sans"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
