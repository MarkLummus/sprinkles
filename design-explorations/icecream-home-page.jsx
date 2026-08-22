import React, { useState } from 'react';
import { 
  X, Plus, Upload, Globe, Search, 
  LayoutGrid, List, Star, MoreHorizontal, Trash2, 
  Printer, ExternalLink, ChevronRight, Copy, Pencil
} from 'lucide-react';

// Custom icons
const ConeSend = ({ className = "w-5 h-5", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 8 L20 12 L4 16" />
  </svg>
);

// Icon components
const IceCreamIdle = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
  </svg>
);

const IceCreamReady = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
    <circle cx="4" cy="5" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="20" cy="6" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="0.5s" />
    </circle>
    <circle cx="3" cy="11" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1s" />
    </circle>
    <circle cx="21" cy="10" r="1" fill={color} stroke="none">
      <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin="1.5s" />
    </circle>
  </svg>
);

const IceCreamActive = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M8 10 L12 22 L16 10" />
    <g>
      <circle cx="6" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="0;6;6" dur="1.2s" repeatCount="indefinite" keyTimes="0;0.5;1" />
        <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" keyTimes="0;0.4;1" />
      </circle>
      <circle cx="18" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="0;7;7" dur="1s" repeatCount="indefinite" keyTimes="0;0.6;1" begin="0.3s" />
        <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.3s" />
      </circle>
      <circle cx="4" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="2;10;10" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.6s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.4;1" begin="0.6s" />
      </circle>
      <circle cx="20" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="1;9;9" dur="1.1s" repeatCount="indefinite" keyTimes="0;0.55;1" begin="0.15s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.1s" repeatCount="indefinite" keyTimes="0;0.45;1" begin="0.15s" />
      </circle>
      <circle cx="10" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="-2;4;4" dur="0.9s" repeatCount="indefinite" keyTimes="0;0.6;1" begin="0.45s" />
        <animate attributeName="opacity" values="0;1;0" dur="0.9s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.45s" />
      </circle>
      <circle cx="14" cy="0" r="1" fill={color} stroke="none">
        <animate attributeName="cy" values="-1;5;5" dur="1.3s" repeatCount="indefinite" keyTimes="0;0.5;1" begin="0.75s" />
        <animate attributeName="opacity" values="0;1;0" dur="1.3s" repeatCount="indefinite" keyTimes="0;0.4;1" begin="0.75s" />
      </circle>
    </g>
  </svg>
);

export default function HomePage() {
  const [viewMode, setViewMode] = useState('cards');
  const [chatOpen, setChatOpen] = useState(false);
  const [aiState, setAiState] = useState('idle'); // 'idle', 'ready', 'active'
  const [chatInput, setChatInput] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleOpenChat = () => {
    setChatOpen(true);
    setAiState('ready');
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setAiState('idle');
  };

  const handleSend = () => {
    if (chatInput.trim()) {
      setAiState('active');
      setChatInput('');
      setTimeout(() => setAiState('ready'), 3000);
    }
  };
  
  const recentRecipes = [
    { id: 1, name: 'Asian Pear Goat Cheese', type: 'Gelato', category: 'Fruity', date: 'Jan 15, 2026', rating: null },
    { id: 2, name: 'Banana Cream Pie', type: 'Ice Cream', category: 'Creamy', date: 'Jan 14, 2026', rating: 5 },
    { id: 3, name: 'Mexican Chocolate', type: 'Gelato', category: 'Chocolate', date: 'Jan 12, 2026', rating: 4 },
    { id: 4, name: 'Strawberry Balsamic', type: 'Sorbetto', category: 'Fruity', date: 'Jan 8, 2026', rating: 5 },
    { id: 5, name: 'Honey Lavender', type: 'Gelato', category: 'Floral', date: 'Jan 5, 2026', rating: 4 },
    { id: 6, name: 'Salted Caramel', type: 'Ice Cream', category: 'Caramel', date: 'Dec 28, 2025', rating: 5 },
    { id: 7, name: 'Pistachio', type: 'Gelato', category: 'Nutty', date: 'Dec 20, 2025', rating: 3 },
    { id: 8, name: 'Mint Chip', type: 'Ice Cream', category: 'Mint', date: 'Dec 15, 2025', rating: 4 },
    { id: 9, name: 'Mango Lassi', type: 'Sorbetto', category: 'Fruity', date: 'Dec 10, 2025', rating: 5 },
    { id: 10, name: 'Lemon Basil', type: 'Sorbetto', category: 'Herbal', date: 'Dec 5, 2025', rating: 4 },
  ];
  
  const totalRecipeCount = 24; // Total in library (shown in "View all" link)

  const suggestedRecipes = [
    { title: 'Mulled Wine Gelato', source: 'Serious Eats', reason: 'Seasonal • Similar to your fruity gelatos' },
    { title: 'Brown Butter Pecan', source: 'Salt & Straw Blog', reason: 'Trending • Matches your nutty favorites' },
  ];

  const typeColors = {
    'Gelato': 'bg-blue-50 text-blue-700',
    'Ice Cream': 'bg-amber-50 text-amber-700',
    'Sorbetto': 'bg-pink-50 text-pink-700',
  };

  const StarRating = ({ value, onChange, readonly = false }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition`}
        >
          <Star 
            className={`w-4 h-4 ${
              star <= value 
                ? 'fill-amber-400 text-amber-400' 
                : 'fill-transparent text-slate-300'
            }`} 
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🍨</span>
          </div>
          <span className="font-serif font-semibold text-slate-800 text-lg">Sprinkles</span>
        </div>
        
        <nav className="hidden md:flex gap-1">
          {['Ingredients', 'Tools', 'Help'].map(item => (
            <button 
              key={item} 
              className="px-4 py-2 text-sm rounded-lg transition font-sans text-slate-600 hover:bg-slate-50"
            >
              {item}
            </button>
          ))}
        </nav>
        
        <div className="flex items-center gap-2">
          <button className="hidden sm:block px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition font-sans">
            Sign In
          </button>
          <button className="px-3 md:px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Recipe</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Feedback Prompt */}
        {feedbackOpen && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 mb-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex flex-col sm:flex-row items-start gap-4">
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
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition font-sans">
                        Save Feedback
                      </button>
                      <button 
                        onClick={handleOpenChat}
                        className="px-4 py-2 text-sm text-violet-600 hover:bg-violet-50 rounded-lg transition font-sans flex items-center justify-center gap-1.5"
                      >
                        <IceCreamIdle className="w-4 h-4" />
                        Help me improve it
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setFeedbackOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition text-left group">
            <div className="w-10 h-10 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mb-3 transition">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-sans font-medium text-slate-800">New Recipe</h3>
            <p className="text-sm text-slate-500 font-sans mt-0.5">Start from scratch</p>
          </button>
          
          <button className="bg-white rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/50 p-4 hover:border-blue-300 hover:shadow-md transition text-left group">
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mb-3 transition">
              <IceCreamIdle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-sans font-medium text-slate-800">Continue Editing</h3>
            <p className="text-sm text-slate-500 font-sans mt-0.5 truncate">Asian Pear Goat Cheese</p>
          </button>
          
          <button className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition text-left group">
            <div className="w-10 h-10 bg-slate-50 group-hover:bg-slate-100 rounded-lg flex items-center justify-center mb-3 transition">
              <Upload className="w-5 h-5 text-slate-600" />
            </div>
            <h3 className="font-sans font-medium text-slate-800">Import from File</h3>
            <p className="text-sm text-slate-500 font-sans mt-0.5">Load a saved recipe</p>
          </button>
          
          <button className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition text-left group">
            <div className="w-10 h-10 bg-violet-50 group-hover:bg-violet-100 rounded-lg flex items-center justify-center mb-3 transition">
              <Globe className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-sans font-medium text-slate-800">Import from Web</h3>
            <p className="text-sm text-slate-500 font-sans mt-0.5">Convert any online recipe</p>
          </button>
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif font-medium text-slate-800">Suggested for You</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-sans">Manage sources</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedRecipes.map((recipe, i) => (
              <div key={i} className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 p-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IceCreamIdle className="w-4 h-4 text-violet-500" />
                    <span className="text-xs text-violet-600 font-sans font-medium">{recipe.source}</span>
                  </div>
                  <h3 className="font-sans font-medium text-slate-800">{recipe.title}</h3>
                  <p className="text-sm text-slate-500 font-sans mt-0.5">{recipe.reason}</p>
                </div>
                <button className="p-2 hover:bg-white/50 rounded-lg transition text-violet-600">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recipes */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="font-serif font-medium text-slate-800 text-lg">Recent Recipes</h2>
              <span className="text-sm text-slate-400 font-sans hidden sm:inline">Showing 10 of {totalRecipeCount}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:flex-none">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
                <button 
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition ${viewMode === 'cards' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {recentRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition cursor-pointer group relative"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium font-sans ${typeColors[recipe.type]}`}>
                        {recipe.type}
                      </span>
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === recipe.id ? null : recipe.id); }}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded transition text-slate-400"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === recipe.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans">
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans">
                              <Copy className="w-4 h-4 text-slate-400" />
                              Duplicate
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans">
                              <Printer className="w-4 h-4 text-slate-400" />
                              Print
                            </button>
                            <div className="border-t border-slate-100 my-1" />
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-sans">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-serif font-medium text-slate-800 mb-1">{recipe.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-sans">{recipe.date}</span>
                      {recipe.rating && <StarRating value={recipe.rating} readonly />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-sans font-medium flex items-center gap-1 mx-auto">
                  View all {totalRecipeCount} recipes
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
                <table className="w-full text-sm font-sans">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3 font-medium">Name</th>
                      <th className="text-left px-3 py-3 font-medium">Type</th>
                      <th className="text-left px-3 py-3 font-medium">Category</th>
                      <th className="text-left px-3 py-3 font-medium">Rating</th>
                      <th className="text-left px-3 py-3 font-medium">Date</th>
                      <th className="text-right px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRecipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-slate-50 transition cursor-pointer group">
                        <td className="px-5 py-3 font-medium text-slate-800">{recipe.name}</td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[recipe.type]}`}>
                            {recipe.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-500">{recipe.category}</td>
                        <td className="px-3 py-3">
                          {recipe.rating ? <StarRating value={recipe.rating} readonly /> : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-3 py-3 text-slate-500">{recipe.date}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
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
              <div className="text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-sans font-medium flex items-center gap-1 mx-auto">
                  View all {totalRecipeCount} recipes
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* Chat Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white border-l border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              {aiState === 'active' ? (
                <IceCreamActive className="w-5 h-5 text-white" />
              ) : (
                <IceCreamReady className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-serif font-medium text-slate-800">Recipe Assistant</h3>
              <p className="text-xs text-slate-400 font-sans">
                {aiState === 'active' ? 'Sprinkling...' : 'Ready to help'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleCloseChat}
            className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5">
          {aiState !== 'active' && (
            <>
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IceCreamReady className="w-6 h-6 text-violet-500" />
                </div>
                <h4 className="font-sans font-medium text-slate-700 mb-1">How can I help?</h4>
                <p className="text-sm text-slate-500 font-sans">Ask me to brainstorm flavors, improve a recipe, or explain techniques.</p>
              </div>
              
              <div className="space-y-2">
                {[
                  'Help me create a holiday gelato',
                  'Why was my last batch too icy?',
                  'Suggest flavor pairings for goat cheese',
                ].map((prompt, i) => (
                  <button key={i} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-600 font-sans transition">
                    {prompt}
                  </button>
                ))}
              </div>
            </>
          )}
          
          {/* Sprinkling indicator */}
          {aiState === 'active' && (
            <div className="flex justify-start pt-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                <IceCreamActive className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                <p className="text-sm text-slate-500 font-sans">Sprinkling...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about ice cream..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={aiState === 'active'}
            />
            <button 
              onClick={handleSend}
              disabled={aiState === 'active'}
              className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl transition"
            >
              <ConeSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* FAB */}
      {!chatOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
        >
          <IceCreamIdle className="w-7 h-7 text-white" />
        </button>
      )}
    </div>
  );
}
