
import React from 'react';
import { NutritionItem } from '../types';
import { Activity, ShieldCheck, Flame, Utensils, HeartPulse, Droplet } from 'lucide-react';

interface NutritionCardProps {
  item: NutritionItem;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ item }) => {
  return (
    <div className="bg-slate-800 rounded-lg md:rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col h-full transition-transform hover:scale-[1.01]">
      {/* Header */}
      <div className="bg-slate-900/50 p-3 sm:p-4 border-b border-slate-700">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-white font-serif tracking-wide">{item.name}</h3>
          <span className="bg-emerald-900/50 text-emerald-300 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full border border-emerald-700/50 uppercase shrink-0">
            {item.type}
          </span>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">{item.description}</p>
      </div>

      <div className="p-3 sm:p-4 flex-1 space-y-3 sm:space-y-4">

        {/* Calories */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-700/30 p-2.5 sm:p-3 rounded-lg border border-slate-700/50">
          <div className="bg-orange-500/20 p-1.5 sm:p-2 rounded-full shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-semibold tracking-wider">Energy</p>
            <p className="text-base sm:text-lg font-bold text-white">{item.calories}</p>
          </div>
        </div>

        {/* Macros */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Macronutrients</p>
            <p className="text-xs sm:text-sm text-slate-300 break-words">{item.macronutrients}</p>
          </div>
        </div>

        {/* Safety */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Safety / Allergens</p>
            <p className="text-xs sm:text-sm text-slate-300 break-words">{item.safety}</p>
          </div>
        </div>

        {/* Vitamins */}
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
            <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase">Vitamins & Minerals</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {item.vitamins.map((vit, idx) => (
              <span key={idx} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-slate-700 text-slate-300 text-[10px] sm:text-xs border border-slate-600">
                <Droplet className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 text-cyan-400 opacity-70" />
                {vit}
              </span>
            ))}
            {item.vitamins.length === 0 && <span className="text-slate-500 text-[10px] sm:text-xs italic">None detected</span>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NutritionCard;
