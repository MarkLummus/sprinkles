import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, X, Check, ChevronDown, ChevronUp, Zap, Sparkles } from 'lucide-react';

export default function ValidationWithOptimize() {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [expandedMetric, setExpandedMetric] = useState('pac');
  const [demoState, setDemoState] = useState('errors'); // 'ok', 'warnings', 'errors'
  const [optimizeOpen, setOptimizeOpen] = useState(false);

  const states = {
    ok: {
      metrics: [
        { id: 'pac', name: 'PAC', value: 238, target: '230–250', status: 'ok' },
        { id: 'pod', name: 'POD', value: 118, target: '110–120', status: 'ok' },
        { id: 'fat', name: 'Fat', value: '7.2%', target: '4–8%', status: 'ok' },
        { id: 'sugar', name: 'Sugar', value: '22.5%', target: '21–24%', status: 'ok' },
        { id: 'msnf', name: 'MSNF', value: '9.1%', target: '7–11%', status: 'ok' },
        { id: 'solids', name: 'Solids', value: '38.8%', target: '36–42%', status: 'ok' },
      ],
    },
    warnings: {
      metrics: [
        { 
          id: 'pac', 
          name: 'PAC', 
          value: 255, 
          target: '230–250',
          status: 'warning',
          issue: {
            title: 'May be softer than expected',
            suggestion: 'Reduce dextrose or increase sucrose to lower PAC.'
          }
        },
        { 
          id: 'pod', 
          name: 'POD', 
          value: 128, 
          target: '110–120',
          status: 'warning',
          issue: {
            title: 'May taste sweeter than expected',
            suggestion: 'Reduce total sugars or swap sucrose for less-sweet alternatives.'
          }
        },
        { id: 'fat', name: 'Fat', value: '7.2%', target: '4–8%', status: 'ok' },
        { id: 'sugar', name: 'Sugar', value: '22.5%', target: '21–24%', status: 'ok' },
        { id: 'msnf', name: 'MSNF', value: '9.1%', target: '7–11%', status: 'ok' },
        { id: 'solids', name: 'Solids', value: '38.8%', target: '36–42%', status: 'ok' },
      ],
    },
    errors: {
      metrics: [
        { 
          id: 'pac', 
          name: 'PAC', 
          value: 310, 
          target: '230–250',
          status: 'error',
          issue: {
            title: 'Will likely not freeze properly',
            suggestion: 'Significantly reduce sugars, especially dextrose and invert sugar.'
          }
        },
        { id: 'pod', name: 'POD', value: 118, target: '110–120', status: 'ok' },
        { 
          id: 'fat', 
          name: 'Fat', 
          value: '2.1%', 
          target: '4–8%',
          status: 'error',
          issue: {
            title: 'Will lack creamy texture',
            suggestion: 'Add cream, butter, or egg yolks to reach at least 4% fat.'
          }
        },
        { 
          id: 'sugar', 
          name: 'Sugar', 
          value: '35%', 
          target: '21–24%',
          status: 'error',
          issue: {
            title: 'Will not freeze properly',
            suggestion: 'Reduce total sugars to 21-24% for gelato.'
          }
        },
        { id: 'msnf', name: 'MSNF', value: '9.1%', target: '7–11%', status: 'ok' },
        { id: 'solids', name: 'Solids', value: '38.8%', target: '36–42%', status: 'ok' },
      ],
    }
  };

  const current = states[demoState];
  const issues = current.metrics.filter(m => m.status !== 'ok');
  const errorCount = issues.filter(m => m.status === 'error').length;
  const warningCount = issues.filter(m => m.status === 'warning').length;
  const hasIssues = issues.length > 0;

  const toggleMetric = (id) => {
    setExpandedMetric(expandedMetric === id ? null : id);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-2xl text-slate-800 mb-2">Balance Card + Optimize</h1>
        <p className="text-slate-500 font-sans mb-6">Optimize always available — for issues or taste adjustments</p>

        {/* Demo Controls */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3 font-sans">Demo states:</p>
          <div className="flex gap-2">
            <button 
              onClick={() => { setDemoState('ok'); setBannerDismissed(false); setExpandedMetric(null); setOptimizeOpen(false); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans flex items-center gap-2 ${demoState === 'ok' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <Check className="w-4 h-4" />
              Balanced
            </button>
            <button 
              onClick={() => { setDemoState('warnings'); setBannerDismissed(false); setExpandedMetric('pac'); setOptimizeOpen(false); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans flex items-center gap-2 ${demoState === 'warnings' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <AlertTriangle className="w-4 h-4" />
              Warnings
            </button>
            <button 
              onClick={() => { setDemoState('errors'); setBannerDismissed(false); setExpandedMetric('pac'); setOptimizeOpen(false); }}
              className={`px-3 py-1.5 text-sm rounded-lg font-sans flex items-center gap-2 ${demoState === 'errors' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              <AlertCircle className="w-4 h-4" />
              Errors
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left: Balance Card */}
          <div>
            {/* Banner */}
            {hasIssues && !bannerDismissed && (
              <div className={`mb-4 rounded-xl border p-3 ${
                errorCount > 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {errorCount > 0 ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span className={`text-sm font-medium font-sans ${errorCount > 0 ? 'text-red-800' : 'text-amber-800'}`}>
                      {errorCount > 0 
                        ? `${errorCount} issue${errorCount > 1 ? 's' : ''} need attention`
                        : `${warningCount} warning${warningCount > 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                  <button 
                    onClick={() => setBannerDismissed(true)}
                    className={`p-1 rounded transition ${
                      errorCount > 0 
                        ? 'text-red-400 hover:text-red-600'
                        : 'text-amber-400 hover:text-amber-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Balance Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <h3 className="font-serif font-medium text-slate-800">Recipe Balance</h3>
              </div>
              
              <div className="divide-y divide-slate-100">
                {current.metrics.map(metric => {
                  const metricHasIssue = metric.status !== 'ok';
                  const isExpanded = expandedMetric === metric.id;
                  const isError = metric.status === 'error';
                  const isWarning = metric.status === 'warning';
                  
                  return (
                    <div 
                      key={metric.id}
                      className={`${
                        metricHasIssue ? 'cursor-pointer' : ''
                      } ${
                        isExpanded && isError ? 'bg-red-50' : 
                        isExpanded && isWarning ? 'bg-amber-50' : 
                        metricHasIssue ? 'hover:bg-slate-50' : ''
                      }`}
                      onClick={() => metricHasIssue && toggleMetric(metric.id)}
                    >
                      <div className="px-5 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 font-sans">{metric.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold font-sans ${
                              metric.status === 'ok' ? 'text-slate-700' :
                              isWarning ? 'text-amber-600' :
                              'text-red-600'
                            }`}>
                              {metric.value}
                            </span>
                            {metric.status === 'ok' && (
                              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Check className="w-3 h-3 text-emerald-600" />
                              </div>
                            )}
                            {isWarning && (
                              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                              </div>
                            )}
                            {isError && (
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-3 h-3 text-red-600" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {metricHasIssue && metric.issue && (
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs font-sans ${
                              isError ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              {metric.issue.title}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className={`w-3.5 h-3.5 ${isError ? 'text-red-400' : 'text-amber-400'}`} />
                            ) : (
                              <ChevronDown className={`w-3.5 h-3.5 ${isError ? 'text-red-400' : 'text-amber-400'}`} />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {metricHasIssue && isExpanded && metric.issue && (
                        <div className={`px-5 pb-3 ${
                          isError ? 'text-red-700' : 'text-amber-700'
                        }`}>
                          <div className={`text-xs font-sans p-2.5 rounded-lg ${
                            isError ? 'bg-red-100/70' : 'bg-amber-100/70'
                          }`}>
                            <span className="font-medium">Suggestion:</span> {metric.issue.suggestion}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Footer with Optimize - always visible */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-sans">
                    Target: Gelato
                  </span>
                  <button 
                    onClick={() => setOptimizeOpen(true)}
                    className={`text-xs font-sans font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                      hasIssues 
                        ? 'text-white bg-blue-500 hover:bg-blue-600'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Optimize
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Optimize Slideout Preview */}
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3 font-sans">Optimize slideout content:</p>
            
            {/* When there are issues */}
            {hasIssues && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-slate-800">Optimize Recipe</h3>
                      <p className="text-xs text-slate-500 font-sans">{issues.length} issue{issues.length > 1 ? 's' : ''} to fix</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-slate-600 font-sans mb-4">
                    Proposed changes to bring recipe into balance:
                  </p>
                  
                  {/* Preview of changes */}
                  <div className="space-y-2 mb-4">
                    {issues.map(issue => (
                      <div key={issue.id} className={`p-3 rounded-lg ${
                        issue.status === 'error' ? 'bg-red-50' : 'bg-amber-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium font-sans ${
                            issue.status === 'error' ? 'text-red-700' : 'text-amber-700'
                          }`}>
                            {issue.name}
                          </span>
                          <span className={`text-xs font-sans ${
                            issue.status === 'error' ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {issue.value} → target
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition font-sans">
                    Apply Fixes
                  </button>
                </div>
              </div>
            )}

            {/* When recipe is balanced */}
            {!hasIssues && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-slate-800">Adjust Recipe</h3>
                      <p className="text-xs text-slate-500 font-sans">Recipe is balanced — fine-tune to taste</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <p className="text-sm text-slate-600 font-sans mb-4">
                    What would you like to adjust?
                  </p>
                  
                  {/* Quick adjustments */}
                  <div className="space-y-2 mb-4">
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left">
                      <div>
                        <span className="text-sm font-medium text-slate-700 font-sans">Less sweet</span>
                        <p className="text-xs text-slate-500 font-sans">Lower perceived sweetness</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left">
                      <div>
                        <span className="text-sm font-medium text-slate-700 font-sans">More creamy</span>
                        <p className="text-xs text-slate-500 font-sans">Increase richness and mouthfeel</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left">
                      <div>
                        <span className="text-sm font-medium text-slate-700 font-sans">Softer texture</span>
                        <p className="text-xs text-slate-500 font-sans">Easier to scoop at serving temp</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left">
                      <div>
                        <span className="text-sm font-medium text-slate-700 font-sans">Firmer texture</span>
                        <p className="text-xs text-slate-500 font-sans">Holds shape better</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left">
                      <div>
                        <span className="text-sm font-medium text-slate-700 font-sans">Stronger flavor</span>
                        <p className="text-xs text-slate-500 font-sans">Increase flavor intensity</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 text-blue-600 hover:text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition font-sans">
                      <Sparkles className="w-4 h-4" />
                      Ask AI for suggestions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
