import React, { useState } from 'react';
import { 
  Search, LayoutGrid, List, Star, MoreHorizontal, 
  ChevronDown, ChevronLeft, ChevronRight, Filter,
  Printer, Copy, Trash2, Download, Check, X,
  ArrowUpDown, Calendar, SlidersHorizontal
} from 'lucide-react';

export default function RecipesLibraryPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  const typeFilters = [
    { id: 'all', label: 'All Types' },
    { id: 'gelato', label: 'Gelato' },
    { id: 'icecream', label: 'Ice Cream' },
    { id: 'sorbet', label: 'Sorbet' },
    { id: 'frozenyogurt', label: 'Frozen Yogurt' },
  ];

  const ratingFilters = [
    { id: 'all', label: 'Any Rating' },
    { id: '5', label: '5 Stars' },
    { id: '4+', label: '4+ Stars' },
    { id: '3+', label: '3+ Stars' },
    { id: 'unrated', label: 'Unrated' },
  ];

  const sortOptions = [
    { id: 'date-desc', label: 'Newest first' },
    { id: 'date-asc', label: 'Oldest first' },
    { id: 'name-asc', label: 'Name (A-Z)' },
    { id: 'name-desc', label: 'Name (Z-A)' },
    { id: 'rating-desc', label: 'Highest rated' },
    { id: 'type', label: 'By type' },
  ];

  const typeColors = {
    'Gelato': 'bg-blue-50 text-blue-700',
    'Ice Cream': 'bg-amber-50 text-amber-700',
    'Sorbet': 'bg-pink-50 text-pink-700',
    'Frozen Yogurt': 'bg-emerald-50 text-emerald-700',
  };

  // Generate sample recipes
  const allRecipes = [
    { id: 1, name: 'Asian Pear Goat Cheese', type: 'Gelato', date: 'Jan 15, 2026', rating: null },
    { id: 2, name: 'Banana Cream Pie', type: 'Ice Cream', date: 'Jan 14, 2026', rating: 5 },
    { id: 3, name: 'Mexican Chocolate', type: 'Gelato', date: 'Jan 12, 2026', rating: 4 },
    { id: 4, name: 'Strawberry Balsamic', type: 'Sorbet', date: 'Jan 8, 2026', rating: 5 },
    { id: 5, name: 'Honey Lavender', type: 'Gelato', date: 'Jan 5, 2026', rating: 4 },
    { id: 6, name: 'Salted Caramel', type: 'Ice Cream', date: 'Dec 28, 2025', rating: 5 },
    { id: 7, name: 'Pistachio', type: 'Gelato', date: 'Dec 20, 2025', rating: 3 },
    { id: 8, name: 'Mint Chip', type: 'Ice Cream', date: 'Dec 15, 2025', rating: 4 },
    { id: 9, name: 'Mango Lassi', type: 'Frozen Yogurt', date: 'Dec 10, 2025', rating: 5 },
    { id: 10, name: 'Lemon Basil', type: 'Sorbet', date: 'Dec 5, 2025', rating: 4 },
    { id: 11, name: 'Brown Butter Pecan', type: 'Ice Cream', date: 'Nov 30, 2025', rating: 5 },
    { id: 12, name: 'Vanilla Bean', type: 'Gelato', date: 'Nov 25, 2025', rating: 4 },
    { id: 13, name: 'Dark Chocolate', type: 'Gelato', date: 'Nov 20, 2025', rating: 5 },
    { id: 14, name: 'Raspberry Ripple', type: 'Ice Cream', date: 'Nov 15, 2025', rating: 3 },
    { id: 15, name: 'Passion Fruit', type: 'Sorbet', date: 'Nov 10, 2025', rating: 4 },
    { id: 16, name: 'Stracciatella', type: 'Gelato', date: 'Nov 5, 2025', rating: 5 },
    { id: 17, name: 'Cookies and Cream', type: 'Ice Cream', date: 'Oct 30, 2025', rating: 4 },
    { id: 18, name: 'Blood Orange', type: 'Sorbet', date: 'Oct 25, 2025', rating: 4 },
    { id: 19, name: 'Peanut Butter Cup', type: 'Ice Cream', date: 'Oct 20, 2025', rating: 5 },
    { id: 20, name: 'Coconut', type: 'Gelato', date: 'Oct 15, 2025', rating: 3 },
    { id: 21, name: 'Blackberry Cabernet', type: 'Sorbet', date: 'Oct 10, 2025', rating: 4 },
    { id: 22, name: 'Coffee Toffee', type: 'Ice Cream', date: 'Oct 5, 2025', rating: 5 },
    { id: 23, name: 'Hazelnut', type: 'Gelato', date: 'Sep 30, 2025', rating: 4 },
    { id: 24, name: 'Blueberry Lavender', type: 'Frozen Yogurt', date: 'Sep 25, 2025', rating: null },
  ];

  // Filter and paginate
  const filteredRecipes = allRecipes; // In real app, apply filters here
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);
  const paginatedRecipes = filteredRecipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

  const toggleSelectRecipe = (id) => {
    setSelectedRecipes(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRecipes.length === paginatedRecipes.length) {
      setSelectedRecipes([]);
    } else {
      setSelectedRecipes(paginatedRecipes.map(r => r.id));
    }
  };

  const StarRating = ({ value, small = false }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star}
          className={`${small ? 'w-3 h-3' : 'w-4 h-4'} ${
            star <= value 
              ? 'fill-amber-400 text-amber-400' 
              : 'fill-transparent text-slate-300'
          }`} 
        />
      ))}
    </div>
  );

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
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans bg-slate-100 text-slate-800 font-medium">
            Recipes
          </button>
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50">
            Ingredients
          </button>
          <button className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50">
            Help
          </button>
        </nav>
        
        <button className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans">
          + New Recipe
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-slate-800">All Recipes</h1>
            <p className="text-sm text-slate-500 font-sans">{filteredRecipes.length} recipes in your library</p>
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
                placeholder="Search recipes..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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

            {/* Rating Filter */}
            <div className="relative">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {ratingFilters.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {sortOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex-1" />

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRecipes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4">
              <span className="text-sm text-slate-600 font-sans">
                {selectedRecipes.length} selected
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition font-sans">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition font-sans">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button 
                onClick={() => setSelectedRecipes([])}
                className="text-sm text-slate-500 hover:text-slate-700 font-sans ml-auto"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {paginatedRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition cursor-pointer group relative ${
                  selectedRecipes.includes(recipe.id) ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelectRecipe(recipe.id); }}
                  className={`absolute top-3 left-3 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                    selectedRecipes.includes(recipe.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-300 opacity-0 group-hover:opacity-100 hover:border-blue-400'
                  }`}
                >
                  {selectedRecipes.includes(recipe.id) && <Check className="w-3 h-3 text-white" />}
                </button>

                {/* Menu */}
                <button className="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded transition text-slate-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <div className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium font-sans ${typeColors[recipe.type]}`}>
                      {recipe.type}
                    </span>
                  </div>
                  <h3 className="font-serif font-medium text-slate-800 mb-1">{recipe.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-sans">{recipe.date}</span>
                    {recipe.rating ? <StarRating value={recipe.rating} small /> : <span className="text-xs text-slate-300">Unrated</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
            <table className="w-full text-sm font-sans">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                        selectedRecipes.length === paginatedRecipes.length && paginatedRecipes.length > 0
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-300 hover:border-blue-400'
                      }`}
                    >
                      {selectedRecipes.length === paginatedRecipes.length && paginatedRecipes.length > 0 && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-3 py-3 font-medium">Name</th>
                  <th className="text-left px-3 py-3 font-medium">Type</th>
                  <th className="text-left px-3 py-3 font-medium">Rating</th>
                  <th className="text-left px-3 py-3 font-medium">Date</th>
                  <th className="text-right px-5 py-3 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRecipes.map((recipe) => (
                  <tr 
                    key={recipe.id} 
                    className={`hover:bg-slate-50 transition cursor-pointer group ${
                      selectedRecipes.includes(recipe.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelectRecipe(recipe.id); }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                          selectedRecipes.includes(recipe.id)
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {selectedRecipes.includes(recipe.id) && <Check className="w-3 h-3 text-white" />}
                      </button>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800">{recipe.name}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[recipe.type]}`}>
                        {recipe.type}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {recipe.rating ? <StarRating value={recipe.rating} small /> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{recipe.date}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" title="Print">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-sans">
            Showing {(currentPage - 1) * recipesPerPage + 1}–{Math.min(currentPage * recipesPerPage, filteredRecipes.length)} of {filteredRecipes.length} recipes
          </p>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-sans transition ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
