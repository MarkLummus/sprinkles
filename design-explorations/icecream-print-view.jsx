import React, { useState } from 'react';

export default function RecipePrintView() {
  const [showBatchLog, setShowBatchLog] = useState(false);
  
  const recipe = {
    name: 'Asian Pear & Goat Cheese Gelato',
    type: 'Gelato',
    yield: '1.00 L',
    calories: '142 kcal/100g',
    date: 'January 18, 2026',
    servingTemp: '-14°C',
    hardness: '70%',
    overrun: '25%',
  };

  const balance = {
    pac: 234,
    pod: 118,
    fat: '7.2%',
    sugar: '22.5%',
    msnf: '9.1%',
    solids: '38.8%',
  };

  const ingredients = [
    { name: 'Whole Milk 3.5%', amount: '500g' },
    { name: 'Heavy Cream 35%', amount: '150g' },
    { name: 'Fresh Goat Cheese', amount: '120g' },
    { name: 'Sucrose', amount: '95g' },
    { name: 'Dextrose', amount: '55g' },
    { name: 'Skim Milk Powder', amount: '40g' },
    { name: 'Freeze-dried Asian Pear', amount: '35g' },
    { name: 'Stabilizer Blend', amount: '5g' },
  ];

  const steps = [
    { text: 'Combine milk, cream, and goat cheese in a saucepan. Heat to 40°C, whisking until cheese is incorporated.', time: '5 min', temp: '40°C' },
    { text: 'Whisk in sugars, milk powder, and stabilizer until fully dissolved.', time: null, temp: null },
    { text: 'Pasteurize: bring to 85°C and hold for 2 minutes, stirring constantly.', time: '10 min', temp: '85°C' },
    { text: 'Strain through fine mesh, then cool in ice bath to 4°C. Refrigerate overnight to age.', time: '12 hr', temp: '4°C' },
    { text: 'Add freeze-dried Asian pear to base. Churn in batch freezer to 25% overrun.', time: '20 min', temp: '-5°C' },
    { text: 'Transfer to containers and harden in blast freezer.', time: '4 hr', temp: '-35°C' },
  ];

  const notes = 'First batch was slightly too sweet. Next time reduce sucrose by 10g. Pairs well with almond biscotti.';

  const totalWeight = '1,000g';

  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-slate-500 font-sans mb-2">Print preview (Cmd/Ctrl + P to print)</p>
        
        {/* Print Options */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 flex items-center gap-6">
          <span className="text-sm font-medium text-slate-700 font-sans">Print options:</span>
          <label className="flex items-center gap-2 text-sm text-slate-600 font-sans cursor-pointer">
            <input 
              type="checkbox" 
              checked={showBatchLog}
              onChange={(e) => setShowBatchLog(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-500"
            />
            Include Batch Log
          </label>
        </div>
        
        {/* Print Page */}
        <div className="bg-white shadow-lg" style={{ 
          width: '8.5in', 
          minHeight: '11in', 
          padding: '0.75in',
          paddingBottom: '1in', /* Extra space for footer */
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '11pt',
          lineHeight: '1.4',
          color: '#1e293b',
          position: 'relative',
        }}>
          
          {/* Header */}
          <div style={{ 
            borderBottom: '2px solid #1e293b', 
            paddingBottom: '12pt',
            marginBottom: '16pt',
          }}>
            <h1 style={{ 
              fontSize: '20pt', 
              fontWeight: '600', 
              margin: '0 0 4pt 0',
              fontFamily: 'Georgia, serif',
            }}>
              {recipe.name}
            </h1>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '10pt',
              color: '#64748b',
            }}>
              <div style={{ display: 'flex', gap: '16pt' }}>
                <span>{recipe.type}</span>
                <span>•</span>
                <span>{recipe.yield}</span>
                <span>•</span>
                <span>{recipe.calories}</span>
              </div>
              <span>{recipe.date}</span>
            </div>
          </div>

          {/* Top Row: Ingredients (left) + Balance/Serving (right) */}
          <div style={{ display: 'flex', gap: '24pt', marginBottom: '20pt' }}>
            
            {/* Left - Ingredients */}
            <div style={{ flex: '1' }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: '600', 
                textTransform: 'uppercase',
                letterSpacing: '0.5pt',
                marginBottom: '8pt',
                color: '#475569',
              }}>
                Ingredients
              </h2>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {ingredients.map((ing, i) => (
                    <tr key={i} style={{ 
                      borderBottom: '1px solid #e2e8f0',
                    }}>
                      <td style={{ padding: '6pt 0', width: '16pt' }}>
                        <div style={{ 
                          width: '10pt', 
                          height: '10pt', 
                          border: '1.5pt solid #cbd5e1',
                          borderRadius: '2pt',
                        }} />
                      </td>
                      <td style={{ padding: '6pt 0', fontSize: '10pt' }}>{ing.name}</td>
                      <td style={{ 
                        padding: '6pt 0', 
                        textAlign: 'right',
                        fontWeight: '500',
                        fontSize: '10pt',
                      }}>
                        {ing.amount}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: '600' }}>
                    <td style={{ padding: '8pt 0 0 0' }}></td>
                    <td style={{ padding: '8pt 0 0 0', fontSize: '10pt' }}>Total</td>
                    <td style={{ padding: '8pt 0 0 0', textAlign: 'right', fontSize: '10pt' }}>{totalWeight}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right - Balance + Serving */}
            <div style={{ width: '180pt' }}>
              {/* Balance Summary */}
              <div style={{ 
                padding: '10pt',
                backgroundColor: '#f8fafc',
                borderRadius: '4pt',
                marginBottom: '12pt',
              }}>
                <h3 style={{ 
                  fontSize: '9pt', 
                  fontWeight: '600', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5pt',
                  marginBottom: '6pt',
                  color: '#475569',
                }}>
                  Balance
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr',
                  gap: '4pt 12pt',
                  fontSize: '9pt',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>PAC</span>
                    <span style={{ fontWeight: '500' }}>{balance.pac}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>POD</span>
                    <span style={{ fontWeight: '500' }}>{balance.pod}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Fat</span>
                    <span style={{ fontWeight: '500' }}>{balance.fat}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Sugar</span>
                    <span style={{ fontWeight: '500' }}>{balance.sugar}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>MSNF</span>
                    <span style={{ fontWeight: '500' }}>{balance.msnf}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Solids</span>
                    <span style={{ fontWeight: '500' }}>{balance.solids}</span>
                  </div>
                </div>
              </div>

              {/* Serving Parameters */}
              <div style={{ 
                padding: '10pt',
                backgroundColor: '#f8fafc',
                borderRadius: '4pt',
              }}>
                <h3 style={{ 
                  fontSize: '9pt', 
                  fontWeight: '600', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5pt',
                  marginBottom: '6pt',
                  color: '#475569',
                }}>
                  Serving
                </h3>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9pt',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#64748b' }}>Temp</div>
                    <div style={{ fontWeight: '600', fontSize: '11pt' }}>{recipe.servingTemp}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#64748b' }}>Hardness</div>
                    <div style={{ fontWeight: '600', fontSize: '11pt' }}>{recipe.hardness}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#64748b' }}>Overrun</div>
                    <div style={{ fontWeight: '600', fontSize: '11pt' }}>{recipe.overrun}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process - Full Width, Single Column */}
          <div style={{ marginBottom: '20pt' }}>
            <h2 style={{ 
              fontSize: '11pt', 
              fontWeight: '600', 
              textTransform: 'uppercase',
              letterSpacing: '0.5pt',
              marginBottom: '8pt',
              color: '#475569',
            }}>
              Process
            </h2>
            
            <div>
              {steps.map((step, i) => (
                <div key={i} style={{ 
                  fontSize: '10pt',
                  marginBottom: '8pt',
                }}>
                  <div style={{ display: 'flex', gap: '6pt' }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: '#475569',
                      flexShrink: 0,
                      width: '14pt',
                    }}>{i + 1}.</span>
                    <div style={{ flex: 1 }}>
                      <div>
                        {step.text}
                        {(step.time || step.temp) && (
                          <span style={{ 
                            marginLeft: '6pt',
                            fontSize: '9pt',
                            color: '#64748b',
                          }}>
                            {step.temp && <span style={{ 
                              backgroundColor: '#e0f2fe',
                              padding: '1pt 4pt',
                              borderRadius: '2pt',
                              marginRight: '4pt',
                            }}>{step.temp}</span>}
                            {step.time && <span style={{ 
                              backgroundColor: '#f1f5f9',
                              padding: '1pt 4pt',
                              borderRadius: '2pt',
                            }}>{step.time}</span>}
                          </span>
                        )}
                      </div>
                      {/* Space for handwritten notes */}
                      <div style={{ 
                        marginTop: '4pt',
                        height: '14pt',
                        borderBottom: '1px dotted #cbd5e1',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Batch Log - Optional */}
          {showBatchLog && (
            <div style={{ marginBottom: '20pt' }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: '600', 
                textTransform: 'uppercase',
                letterSpacing: '0.5pt',
                marginBottom: '8pt',
                color: '#475569',
              }}>
                Batch Log
              </h2>
              <div style={{ 
                display: 'flex',
                gap: '16pt',
                fontSize: '9pt',
                marginBottom: '10pt',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                  <div style={{ 
                    width: '10pt', 
                    height: '10pt', 
                    border: '1.5pt solid #cbd5e1',
                    borderRadius: '2pt',
                  }} />
                  <span>Weighed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                  <div style={{ 
                    width: '10pt', 
                    height: '10pt', 
                    border: '1.5pt solid #cbd5e1',
                    borderRadius: '2pt',
                  }} />
                  <span>Pasteurized</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                  <div style={{ 
                    width: '10pt', 
                    height: '10pt', 
                    border: '1.5pt solid #cbd5e1',
                    borderRadius: '2pt',
                  }} />
                  <span>Aged</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                  <div style={{ 
                    width: '10pt', 
                    height: '10pt', 
                    border: '1.5pt solid #cbd5e1',
                    borderRadius: '2pt',
                  }} />
                  <span>Churned</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                  <div style={{ 
                    width: '10pt', 
                    height: '10pt', 
                    border: '1.5pt solid #cbd5e1',
                    borderRadius: '2pt',
                  }} />
                  <span>Hardened</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4pt' }}>
                  <div style={{ 
                    width: '10pt', 
                    height: '10pt', 
                    border: '1.5pt solid #cbd5e1',
                    borderRadius: '2pt',
                  }} />
                  <span>Approved</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes - Last section with lines for capturing notes */}
          <div>
            <h2 style={{ 
              fontSize: '11pt', 
              fontWeight: '600', 
              textTransform: 'uppercase',
              letterSpacing: '0.5pt',
              marginBottom: '8pt',
              color: '#475569',
            }}>
              Notes
            </h2>
            
            {/* Existing notes */}
            {notes && (
              <p style={{ 
                fontSize: '10pt',
                color: '#475569',
                fontStyle: 'italic',
                margin: '0 0 12pt 0',
                padding: '8pt',
                backgroundColor: '#fefce8',
                borderRadius: '4pt',
                borderLeft: '3pt solid #facc15',
              }}>
                {notes}
              </p>
            )}
            
            {/* Lines for additional notes */}
            <div style={{ 
              height: '20pt',
              borderBottom: '1px solid #e2e8f0',
            }} />
            <div style={{ 
              height: '20pt',
              borderBottom: '1px solid #e2e8f0',
            }} />
            <div style={{ 
              height: '20pt',
              borderBottom: '1px solid #e2e8f0',
            }} />
            <div style={{ 
              height: '20pt',
              borderBottom: '1px solid #e2e8f0',
            }} />
          </div>

          {/* Footer */}
          <div style={{ 
            position: 'absolute',
            bottom: '0.5in',
            left: '0.75in',
            right: '0.75in',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '8pt',
            fontSize: '8pt',
            color: '#94a3b8',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>Generated by Sprinkles</span>
            <span>sprinkles.app</span>
          </div>
        </div>
      </div>
      
      {/* Print Styles Note */}
      <div className="max-w-3xl mx-auto mt-6 p-4 bg-slate-200 rounded-lg">
        <p className="text-sm text-slate-600 font-sans">
          <strong>Print styles:</strong> Use <code>@media print</code> to hide the preview wrapper, 
          remove shadows, and ensure proper page breaks. The actual implementation would trigger 
          <code>window.print()</code> with these styles applied.
        </p>
      </div>
    </div>
  );
}
