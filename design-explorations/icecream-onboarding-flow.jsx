import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, X } from 'lucide-react';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [selections, setSelections] = useState({
    types: [],
    experience: null,
    equipment: [],
    pasteurization: null,
    sugarVariety: null,
    sugars: [],
    hasStabilizers: null,
    stabilizers: [],
    hasEmulsifiers: null,
    emulsifiers: [],
    eggPreference: null,
    sweetness: null,
  });

  const totalSteps = 5;

  const toggleSelection = (field, value) => {
    setSelections(prev => {
      const current = prev[field];
      if (Array.isArray(current)) {
        return {
          ...prev,
          [field]: current.includes(value) 
            ? current.filter(v => v !== value)
            : [...current, value]
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const setSelection = (field, value) => {
    setSelections(prev => ({ ...prev, [field]: value }));
  };

  // Options data
  const iceTypes = [
    { id: 'gelato', label: 'Gelato', emoji: '🇮🇹', desc: 'Italian-style, dense & intense' },
    { id: 'icecream', label: 'Ice Cream', emoji: '🍨', desc: 'American-style, rich & creamy' },
    { id: 'sorbet', label: 'Sorbet', emoji: '🍧', desc: 'Dairy-free, fruit-forward' },
    { id: 'frozenyogurt', label: 'Frozen Yogurt', emoji: '🥛', desc: 'Tangy, lighter' },
    { id: 'sherbet', label: 'Sherbet', emoji: '🍊', desc: 'Fruity with a little dairy' },
  ];

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner', desc: "I'm just getting started" },
    { id: 'intermediate', label: 'Intermediate', desc: "I've made a few batches" },
    { id: 'advanced', label: 'Advanced', desc: 'I understand balancing and formulation' },
  ];

  const equipmentOptions = [
    { id: 'homefreezer', label: 'Home freezer only', desc: 'No churn / still-freeze method', category: 'freezing' },
    { id: 'homemaker', label: 'Home ice cream maker', desc: 'Cuisinart, KitchenAid, etc.', category: 'freezing' },
    { id: 'compressor', label: 'Compressor machine', desc: 'Breville, Lello, Musso', category: 'freezing' },
    { id: 'batch', label: 'Batch freezer', desc: 'Commercial / prosumer', category: 'freezing' },
  ];

  const pasteurizationOptions = [
    { id: 'none', label: 'No pasteurization', desc: 'Use already-pasteurized ingredients' },
    { id: 'stovetop', label: 'Stovetop', desc: 'Heat to 85°C in a pot' },
    { id: 'immersion', label: 'Immersion circulator', desc: 'Sous vide / Anova, Joule, etc.' },
    { id: 'commercial', label: 'Commercial pasteurizer', desc: 'Dedicated pasteurization equipment' },
  ];

  const sugarOptions = [
    { id: 'sucrose', label: 'Sucrose (white sugar)', common: true },
    { id: 'dextrose', label: 'Dextrose', common: true },
    { id: 'invert', label: 'Invert sugar / Trimoline', common: false },
    { id: 'trehalose', label: 'Trehalose', common: false },
    { id: 'glucose', label: 'Glucose syrup / DE40', common: false },
    { id: 'honey', label: 'Honey', common: true },
    { id: 'maple', label: 'Maple syrup', common: true },
  ];

  const stabilizerOptions = [
    { id: 'locustbean', label: 'Locust bean gum (LBG)' },
    { id: 'guar', label: 'Guar gum' },
    { id: 'carrageenan', label: 'Carrageenan' },
    { id: 'xanthan', label: 'Xanthan gum' },
    { id: 'gelatin', label: 'Gelatin' },
    { id: 'blend', label: 'Commercial blend (Cremodan, etc.)' },
  ];

  const emulsifierOptions = [
    { id: 'eggyolk', label: 'Egg yolks' },
    { id: 'lecithin', label: 'Soy or sunflower lecithin' },
    { id: 'monodi', label: 'Mono/diglycerides' },
    { id: 'blend', label: 'Commercial blend' },
  ];

  const OptionButton = ({ selected, onClick, children, className = '' }) => (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition text-left ${
        selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-slate-200 hover:border-slate-300 bg-white'
      } ${className}`}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      {children}
    </button>
  );

  const ChoicePill = ({ selected, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border-2 transition font-sans text-sm ${
        selected 
          ? 'border-blue-500 bg-blue-50 text-blue-700' 
          : 'border-slate-200 hover:border-slate-300 text-slate-600'
      }`}
    >
      {children}
    </button>
  );

  const CheckboxItem = ({ checked, onClick, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg border transition text-left w-full ${
        checked 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
        checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="font-sans text-sm text-slate-700">{children}</span>
    </button>
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🍨</span>
          </div>
          <span className="font-serif font-semibold text-slate-800 text-lg">Sprinkles</span>
        </div>
        
        <button className="text-sm text-slate-500 hover:text-slate-700 font-sans">
          Skip for now
        </button>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-slate-100 px-6 py-3">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 font-sans">Step {step} of {totalSteps}</span>
            <span className="text-xs text-slate-400 font-sans">{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-xl">
          
          {/* Step 1: Types */}
          {step === 1 && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-2">
                What do you want to make?
              </h1>
              <p className="text-slate-500 font-sans mb-8">
                Select all that interest you. This helps us suggest the right recipes.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {iceTypes.map(type => (
                  <OptionButton
                    key={type.id}
                    selected={selections.types.includes(type.id)}
                    onClick={() => toggleSelection('types', type.id)}
                  >
                    <div className="text-2xl mb-2">{type.emoji}</div>
                    <div className="font-sans font-medium text-slate-800">{type.label}</div>
                    <div className="text-xs text-slate-500 font-sans">{type.desc}</div>
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-2">
                What's your experience level?
              </h1>
              <p className="text-slate-500 font-sans mb-8">
                We'll adjust recipe complexity and explanations to match.
              </p>
              
              <div className="space-y-3">
                {experienceLevels.map(level => (
                  <OptionButton
                    key={level.id}
                    selected={selections.experience === level.id}
                    onClick={() => setSelection('experience', level.id)}
                    className="w-full"
                  >
                    <div className="font-sans font-medium text-slate-800">{level.label}</div>
                    <div className="text-sm text-slate-500 font-sans">{level.desc}</div>
                  </OptionButton>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Equipment */}
          {step === 3 && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-2">
                What equipment do you have?
              </h1>
              <p className="text-slate-500 font-sans mb-8">
                This affects process steps and overrun targets.
              </p>
              
              <div className="space-y-6">
                {/* Freezing equipment */}
                <div>
                  <h3 className="font-sans font-medium text-slate-700 mb-3">Freezing</h3>
                  <div className="space-y-3">
                    {equipmentOptions.map(equip => (
                      <OptionButton
                        key={equip.id}
                        selected={selections.equipment.includes(equip.id)}
                        onClick={() => toggleSelection('equipment', equip.id)}
                        className="w-full"
                      >
                        <div className="font-sans font-medium text-slate-800">{equip.label}</div>
                        <div className="text-sm text-slate-500 font-sans">{equip.desc}</div>
                      </OptionButton>
                    ))}
                  </div>
                </div>

                {/* Pasteurization */}
                <div>
                  <h3 className="font-sans font-medium text-slate-700 mb-3">Pasteurization</h3>
                  <div className="space-y-3">
                    {pasteurizationOptions.map(option => (
                      <OptionButton
                        key={option.id}
                        selected={selections.pasteurization === option.id}
                        onClick={() => setSelection('pasteurization', option.id)}
                        className="w-full"
                      >
                        <div className="font-sans font-medium text-slate-800">{option.label}</div>
                        <div className="text-sm text-slate-500 font-sans">{option.desc}</div>
                      </OptionButton>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pantry */}
          {step === 4 && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-2">
                What's in your pantry?
              </h1>
              <p className="text-slate-500 font-sans mb-8">
                We'll tailor recipes to ingredients you have access to.
              </p>
              
              <div className="space-y-6">
                {/* Sugars */}
                <div>
                  <h3 className="font-sans font-medium text-slate-700 mb-3">Sugars</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <ChoicePill
                      selected={selections.sugarVariety === 'single'}
                      onClick={() => setSelection('sugarVariety', 'single')}
                    >
                      Just white sugar
                    </ChoicePill>
                    <ChoicePill
                      selected={selections.sugarVariety === 'multiple'}
                      onClick={() => setSelection('sugarVariety', 'multiple')}
                    >
                      Multiple types
                    </ChoicePill>
                  </div>
                  
                  {selections.sugarVariety === 'multiple' && (
                    <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-xl">
                      {sugarOptions.map(sugar => (
                        <CheckboxItem
                          key={sugar.id}
                          checked={selections.sugars.includes(sugar.id)}
                          onClick={() => toggleSelection('sugars', sugar.id)}
                        >
                          {sugar.label}
                        </CheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stabilizers */}
                <div>
                  <h3 className="font-sans font-medium text-slate-700 mb-3">Stabilizers</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <ChoicePill
                      selected={selections.hasStabilizers === false}
                      onClick={() => setSelection('hasStabilizers', false)}
                    >
                      None
                    </ChoicePill>
                    <ChoicePill
                      selected={selections.hasStabilizers === true}
                      onClick={() => setSelection('hasStabilizers', true)}
                    >
                      Yes, I have some
                    </ChoicePill>
                  </div>
                  
                  {selections.hasStabilizers && (
                    <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-xl">
                      {stabilizerOptions.map(stab => (
                        <CheckboxItem
                          key={stab.id}
                          checked={selections.stabilizers.includes(stab.id)}
                          onClick={() => toggleSelection('stabilizers', stab.id)}
                        >
                          {stab.label}
                        </CheckboxItem>
                      ))}
                    </div>
                  )}
                </div>

                {/* Emulsifiers */}
                <div>
                  <h3 className="font-sans font-medium text-slate-700 mb-3">Emulsifiers</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <ChoicePill
                      selected={selections.hasEmulsifiers === false}
                      onClick={() => setSelection('hasEmulsifiers', false)}
                    >
                      None
                    </ChoicePill>
                    <ChoicePill
                      selected={selections.hasEmulsifiers === true}
                      onClick={() => setSelection('hasEmulsifiers', true)}
                    >
                      Yes, I have some
                    </ChoicePill>
                  </div>
                  
                  {selections.hasEmulsifiers && (
                    <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-xl">
                      {emulsifierOptions.map(emul => (
                        <CheckboxItem
                          key={emul.id}
                          checked={selections.emulsifiers.includes(emul.id)}
                          onClick={() => toggleSelection('emulsifiers', emul.id)}
                        >
                          {emul.label}
                        </CheckboxItem>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Taste Preferences */}
          {step === 5 && (
            <div>
              <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-2">
                Taste & style preferences
              </h1>
              <p className="text-slate-500 font-sans mb-8">
                These will be your defaults. You can always adjust per recipe.
              </p>
              
              <div className="space-y-6">
                {/* Egg preference */}
                <div>
                  <h3 className="font-sans font-medium text-slate-700 mb-3">Egg preference</h3>
                  <div className="flex flex-wrap gap-2">
                    <ChoicePill
                      selected={selections.eggPreference === 'prefer'}
                      onClick={() => setSelection('eggPreference', 'prefer')}
                    >
                      Prefer egg-based
                    </ChoicePill>
                    <ChoicePill
                      selected={selections.eggPreference === 'avoid'}
                      onClick={() => setSelection('eggPreference', 'avoid')}
                    >
                      Prefer no eggs
                    </ChoicePill>
                    <ChoicePill
                      selected={selections.eggPreference === 'none'}
                      onClick={() => setSelection('eggPreference', 'none')}
                    >
                      No preference
                    </ChoicePill>
                  </div>
                </div>

                {/* Sweetness */}
                <div>
                  <h3 className="font-sans font-medium text-slate-700 mb-3">Sweetness level</h3>
                  <div className="flex flex-wrap gap-2">
                    <ChoicePill
                      selected={selections.sweetness === 'less'}
                      onClick={() => setSelection('sweetness', 'less')}
                    >
                      Less sweet
                    </ChoicePill>
                    <ChoicePill
                      selected={selections.sweetness === 'standard'}
                      onClick={() => setSelection('sweetness', 'standard')}
                    >
                      Standard
                    </ChoicePill>
                    <ChoicePill
                      selected={selections.sweetness === 'sweeter'}
                      onClick={() => setSelection('sweetness', 'sweeter')}
                    >
                      Sweeter
                    </ChoicePill>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-sans font-medium text-blue-800 mb-2">You're all set!</h3>
                  <p className="text-sm text-blue-700 font-sans">
                    We'll use these preferences to customize your recipes. You can change them anytime in Settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || completed}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-sans ${
              step === 1 || completed
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={() => {
              if (step < totalSteps) {
                setStep(step + 1);
              } else {
                setCompleted(true);
              }
            }}
            disabled={completed}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition font-sans font-medium ${
              completed 
                ? 'bg-emerald-500 text-white cursor-default'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {completed ? (
              <>
                <Check className="w-4 h-4" />
                Redirecting...
              </>
            ) : step === totalSteps ? (
              'Get Started'
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </footer>

      {/* Completion Overlay */}
      {completed && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="text-4xl">🍨</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-2">
              You're all set!
            </h1>
            <p className="text-slate-500 font-sans mb-6">
              Taking you to your dashboard...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
