
import React from 'react';
import { DietaryPreferences } from '../types';
import { X, Check, ShieldAlert } from 'lucide-react';

interface DietarySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: DietaryPreferences;
  onUpdate: (prefs: DietaryPreferences) => void;
}

const DietarySettings: React.FC<DietarySettingsProps> = ({ isOpen, onClose, preferences, onUpdate }) => {
  if (!isOpen) return null;

  const toggle = (key: keyof DietaryPreferences) => {
    onUpdate({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-3 px-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/20 p-1.5 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Dietary Profile</h2>
              <p className="text-[10px] text-slate-400">Set safety warnings</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar">
          
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lifestyle & Diet</h3>
            
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between p-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                <span className="text-slate-300 text-sm font-medium">Vegan</span>
                <div 
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${preferences.isVegan ? 'bg-green-500 justify-end' : 'bg-slate-600 justify-start'}`}
                  onClick={() => toggle('isVegan')}
                >
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </label>

              <label className="flex items-center justify-between p-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                <span className="text-slate-300 text-sm font-medium">Vegetarian</span>
                <div 
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${preferences.isVegetarian ? 'bg-lime-500 justify-end' : 'bg-slate-600 justify-start'}`}
                  onClick={() => toggle('isVegetarian')}
                >
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </label>

              <label className="flex items-center justify-between p-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                <span className="text-slate-300 text-sm font-medium">Gluten-Free</span>
                <div 
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${preferences.isGlutenFree ? 'bg-amber-500 justify-end' : 'bg-slate-600 justify-start'}`}
                  onClick={() => toggle('isGlutenFree')}
                >
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </label>

               <label className="flex items-center justify-between p-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                <span className="text-slate-300 text-sm font-medium">Dairy-Free</span>
                <div 
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${preferences.isDairyFree ? 'bg-stone-400 justify-end' : 'bg-slate-600 justify-start'}`}
                  onClick={() => toggle('isDairyFree')}
                >
                   <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avoid Allergens</h3>
            
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between p-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                <span className="text-slate-300 text-sm font-medium">Peanuts / Tree Nuts</span>
                <div 
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${preferences.avoidPeanuts ? 'bg-red-500 border-red-500' : 'border-slate-500 bg-transparent'}`}
                  onClick={() => toggle('avoidPeanuts')}
                >
                   {preferences.avoidPeanuts && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </label>

              <label className="flex items-center justify-between p-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                <span className="text-slate-300 text-sm font-medium">Shellfish</span>
                <div 
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${preferences.avoidShellfish ? 'bg-red-500 border-red-500' : 'border-slate-500 bg-transparent'}`}
                  onClick={() => toggle('avoidShellfish')}
                >
                   {preferences.avoidShellfish && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 text-sm"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};

export default DietarySettings;
