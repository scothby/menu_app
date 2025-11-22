
import React from 'react';
import { Recipe, Dish } from '../types';
import { X, Clock, ChefHat, ShoppingCart, List, Utensils } from 'lucide-react';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: Dish | null;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose, dish }) => {
  if (!isOpen || !dish || !dish.recipe) return null;
  const { recipe } = dish;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl md:max-w-3xl shadow-2xl flex flex-col h-full sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300 safe-bottom">

        {/* Header */}
        <div className="relative safe-top">
          {dish.generatedImageUrl && (
            <div className="absolute inset-0 h-24 sm:h-32 overflow-hidden">
              <img src={dish.generatedImageUrl} className="w-full h-full object-cover opacity-30 blur-sm" alt="" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/0 to-slate-900" />
            </div>
          )}
          <div className="relative p-4 sm:p-6 border-b border-slate-800 bg-slate-950/30 flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${recipe.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                    recipe.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                  }`}>
                  {recipe.difficulty}
                </span>
                <span className="text-slate-400 text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {recipe.prepTime} + {recipe.cookTime}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif truncate">{dish.name}</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5 sm:mt-1 italic">"Make it yourself at home!"</p>
            </div>
            <button onClick={onClose} className="touch-target p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 custom-scrollbar">

          {/* Ingredients & Shopping List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-bold text-orange-400 mb-3 sm:mb-4">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5" /> Ingredients
              </h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="text-slate-300 text-xs sm:text-sm flex items-start gap-1.5 sm:gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-1.5 shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 p-3 sm:p-4 rounded-xl border border-slate-700/50 h-fit">
              <h3 className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-md font-bold text-emerald-400 mb-2 sm:mb-3">
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Shopping List
              </h3>
              <ul className="space-y-1 sm:space-y-1.5">
                {recipe.shoppingList.map((item, idx) => (
                  <li key={idx} className="text-slate-400 text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border border-slate-600 rounded-sm shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-bold text-blue-400 mb-3 sm:mb-4">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" /> Instructions
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-2.5 sm:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 rounded-full flex items-center justify-center text-blue-400 text-sm sm:text-base font-bold border border-slate-700">
                    {idx + 1}
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1 sm:pt-1.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
