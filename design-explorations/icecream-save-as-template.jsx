import React, { useState } from 'react';
import { ChevronDown, Save, BookOpen, X, Download } from 'lucide-react';

export default function SaveAsTemplateUI() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('Asian Pear Goat Cheese');
  const [templateDesc, setTemplateDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveAsTemplate = () => {
    setDropdownOpen(false);
    setModalOpen(true);
  };

  const handleConfirmSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        setModalOpen(false);
        setSaved(false);
        setTemplateName('Asian Pear Goat Cheese');
        setTemplateDesc('');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Save as Template</h1>
        <p className="text-slate-500 font-sans mb-8">Save dropdown with "Save as Template" option for recipe page</p>

        {/* Demo Context */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <p className="text-sm text-slate-500 font-sans mb-4">Recipe page header context:</p>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-slate-800">Asian Pear Goat Cheese</h2>
              <p className="text-sm text-slate-500 font-sans">Gelato • 1.00 L</p>
            </div>

            {/* Save Button with Dropdown */}
            <div className="relative">
              <div className="flex">
                <button 
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-l-lg transition font-sans flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg border-l border-blue-400 transition"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Save className="w-4 h-4 text-slate-400" />
                    Save
                  </button>
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans"
                    onClick={handleSaveAsTemplate}
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    Save as Template
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button 
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left font-sans"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    Export to File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-serif font-medium text-slate-800 mb-3">Interaction Flow</h3>
          <ol className="space-y-2 text-sm font-sans text-slate-600 list-decimal list-inside">
            <li>User clicks chevron on Save button to open dropdown</li>
            <li>User selects "Save as Template"</li>
            <li>Modal opens with pre-filled recipe name</li>
            <li>User optionally edits name and adds description</li>
            <li>User clicks "Save Template"</li>
            <li>Success state shows, modal closes</li>
            <li>Template appears in user's template library</li>
          </ol>
        </div>
      </div>

      {/* Save as Template Modal */}
      {modalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !saving && setModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-slate-800">
                      Save as Template
                    </h2>
                    <p className="text-sm text-slate-500 font-sans">
                      Create a reusable starting point
                    </p>
                  </div>
                </div>
                {!saving && !saved && (
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              {!saved ? (
                <div className="px-6 pb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 font-sans mb-1">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., My Vanilla Base"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={saving}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 font-sans mb-1">
                        Description <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={templateDesc}
                        onChange={(e) => setTemplateDesc(e.target.value)}
                        placeholder="What makes this template useful? When would you use it?"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        disabled={saving}
                      />
                    </div>

                    {/* Recipe Summary */}
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 font-sans uppercase tracking-wide mb-2">Recipe Details</p>
                      <div className="flex items-center gap-4 text-sm font-sans">
                        <span className="text-slate-700">Gelato</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-700">1.00 L</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-700">8 ingredients</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={() => setModalOpen(false)}
                      disabled={saving}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSave}
                      disabled={saving || !templateName.trim()}
                      className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 rounded-lg transition font-sans flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4" />
                          Save Template
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-6 pb-6">
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-serif font-medium text-slate-800 mb-1">Template Saved!</h3>
                    <p className="text-sm text-slate-500 font-sans">
                      "{templateName}" is now available in your template library.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
