
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dish, DietaryPreferences } from '../types';
import { Sparkles, Utensils, Leaf, Flame, WheatOff, Fish, MilkOff, RotateCcw, Info, HeartPulse, Activity, ShieldCheck, Flame as FlameIcon, AlertTriangle, CheckCircle2, Wine, BookOpen, Loader2, Share2, Heart, Globe } from 'lucide-react';

interface DishCardProps {
  dish: Dish;
  onGenerate: (id: string, name: string, description: string) => void;
  preferences?: DietaryPreferences; // Added preferences prop
  onGetRecipe: (dish: Dish) => void; // Added recipe handler
  isFavorite?: boolean;
  onToggleFavorite?: (dish: Dish) => void;
  onTranslate?: (dish: Dish) => void; // Added translation handler
  showTranslation?: boolean; // Show translated names
}

const FUNNY_COOKING_MESSAGES = [
  "Sprinkling digital parsley...",
  "Heating up the GPU oven...",
  "Cooking pixels al dente...",
  "Consulting the flavor elves...",
  "Melting virtual cheese...",
  "Styling for the 'Gram...",
  "Asking the Chef for the recipe...",
  "Adding extra yumminess...",
  "Sourcing organic bits and bytes...",
  "Polishing the silverware...",
  "Fluffing the soufflé..."
];

const getTagStyle = (tag: string) => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('vegan')) return { bg: 'bg-green-900/50', text: 'text-green-300', border: 'border-green-700/50', icon: <Leaf className="w-3 h-3 mr-1" /> };
  if (lowerTag.includes('vegetarian')) return { bg: 'bg-lime-900/50', text: 'text-lime-300', border: 'border-lime-700/50', icon: <Leaf className="w-3 h-3 mr-1" /> };
  if (lowerTag.includes('spicy') || lowerTag.includes('hot')) return { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-700/50', icon: <Flame className="w-3 h-3 mr-1" /> };
  if (lowerTag.includes('gluten')) return { bg: 'bg-amber-900/50', text: 'text-amber-300', border: 'border-amber-700/50', icon: <WheatOff className="w-3 h-3 mr-1" /> };
  if (lowerTag.includes('seafood') || lowerTag.includes('fish') || lowerTag.includes('shellfish')) return { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-700/50', icon: <Fish className="w-3 h-3 mr-1" /> };
  if (lowerTag.includes('dairy')) return { bg: 'bg-stone-700/50', text: 'text-stone-300', border: 'border-stone-500/50', icon: <MilkOff className="w-3 h-3 mr-1" /> };

  return { bg: 'bg-slate-700/50', text: 'text-slate-300', border: 'border-slate-600/50', icon: null };
};

const DishCard: React.FC<DishCardProps> = ({ dish, onGenerate, preferences, onGetRecipe, isFavorite, onToggleFavorite, onTranslate, showTranslation }) => {
  const [loadingMessage, setLoadingMessage] = useState(FUNNY_COOKING_MESSAGES[0]);
  const [imageError, setImageError] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  // Calculate Safety Status
  const safetyStatus = useMemo(() => {
    if (!preferences) return { status: 'neutral', message: '' };

    const issues: string[] = [];
    const allTags = dish.tags.map(t => t.toLowerCase());

    // Strict Checks based on tags
    if (preferences.isVegan) {
      if (allTags.some(t => t.includes('meat') || t.includes('animal') || t.includes('dairy') || t.includes('cheese') || t.includes('egg'))) {
        issues.push("Not Vegan");
      }
    }

    if (preferences.isVegetarian) {
      if (allTags.some(t => t.includes('meat') || t.includes('fish') || t.includes('chicken') || t.includes('beef') || t.includes('pork'))) {
        issues.push("Not Vegetarian");
      }
    }

    if (preferences.isGlutenFree) {
      if (allTags.some(t => t.includes('gluten') || t.includes('bread') || t.includes('pasta') && !t.includes('gluten-free'))) {
        issues.push("Contains Gluten");
      }
    }

    if (preferences.isDairyFree) {
      if (allTags.some(t => t.includes('dairy') || t.includes('cheese') || t.includes('milk') || t.includes('cream') && !t.includes('dairy-free'))) {
        issues.push("Contains Dairy");
      }
    }

    if (preferences.avoidPeanuts) {
      if (allTags.some(t => t.includes('peanut') || t.includes('nut'))) {
        issues.push("Contains Nuts");
      }
    }

    if (preferences.avoidShellfish) {
      if (allTags.some(t => t.includes('shellfish') || t.includes('crab') || t.includes('lobster') || t.includes('shrimp'))) {
        issues.push("Contains Shellfish");
      }
    }

    if (issues.length > 0) {
      return { status: 'unsafe', message: issues.join(', ') };
    }

    // Check for "Safe" confirmation matches
    const safeMatches = [];
    if (preferences.isVegan && allTags.some(t => t === 'vegan')) safeMatches.push('Vegan');
    if (preferences.isGlutenFree && allTags.some(t => t.includes('gluten-free'))) safeMatches.push('GF');

    if (safeMatches.length > 0) {
      return { status: 'safe', message: 'Fits your profile' };
    }

    return { status: 'neutral', message: '' };

  }, [dish.tags, preferences]);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !dish.generatedImageUrl && !dish.isLoadingImage && !hasTriggeredRef.current && !dish.generationFailed) {
          hasTriggeredRef.current = true;
          onGenerate(dish.id, dish.name, dish.description);
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [dish.id, dish.generatedImageUrl, dish.isLoadingImage, dish.generationFailed, onGenerate]);

  useEffect(() => {
    if (!dish.isLoadingImage) return;
    setLoadingMessage(FUNNY_COOKING_MESSAGES[Math.floor(Math.random() * FUNNY_COOKING_MESSAGES.length)]);
    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIdx = FUNNY_COOKING_MESSAGES.indexOf(prev);
        const nextIdx = (currentIdx + 1) % FUNNY_COOKING_MESSAGES.length;
        return FUNNY_COOKING_MESSAGES[nextIdx];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [dish.isLoadingImage]);

  const handleImageError = () => setImageError(true);
  const isError = imageError || dish.generationFailed;

  // --- Share Logic ---
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dish.generatedImageUrl) return;

    setIsSharing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = dish.generatedImageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Set Canvas Size (16:9 Image + Footer)
      const width = 1280;
      const height = 720 + 180; // Image height + Footer
      canvas.width = width;
      canvas.height = height;

      if (!ctx) return;

      // Draw Background
      ctx.fillStyle = '#0f172a'; // Slate 950
      ctx.fillRect(0, 0, width, height);

      // Draw Image
      ctx.drawImage(img, 0, 0, 1280, 720);

      // Draw Gradient Overlay on Image Bottom
      const gradient = ctx.createLinearGradient(0, 500, 0, 720);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 500, 1280, 220);

      // Text Settings
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.textAlign = 'left';

      // Dish Name
      ctx.fillText(dish.name, 40, 780);

      // Original Name
      if (dish.originalName && dish.originalName !== dish.name) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 32px Inter, sans-serif';
        ctx.fillText(dish.originalName, 40, 830);
      }

      // Branding
      ctx.fillStyle = '#f97316'; // Orange 500
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText("Discovered with MenuViz", 1240, 860);

      // Calories Badge
      if (dish.nutrition?.calories) {
        ctx.fillStyle = '#1e293b'; // Slate 800
        ctx.beginPath();
        ctx.roundRect(40, 850, 200, 40, 20);
        ctx.fill();

        ctx.fillStyle = '#fbbf24'; // Amber 400
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(dish.nutrition.calories, 140, 878);
      }

      // Convert to Blob and Share
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `menuviz-${dish.name.replace(/\s+/g, '-').toLowerCase()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Check out ${dish.name}`,
            text: `I found this amazing dish using MenuViz!`,
          });
        } else {
          // Fallback to download
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `menuviz-${dish.name}.png`;
          link.click();
        }
      }, 'image/png');

    } catch (error) {
      console.error("Share failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div ref={cardRef} className="bg-slate-800 rounded-lg md:rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col transform transition-all duration-300 hover:shadow-2xl hover:border-slate-600 group/card h-full">

      <div
        className="relative aspect-dish-mobile w-full [perspective:1000px] cursor-pointer group/flip"
        onClick={() => {
          if (dish.generatedImageUrl && !isError && !dish.isLoadingImage) setIsFlipped(!isFlipped);
        }}
      >
        <div className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-slate-900 flex items-center justify-center overflow-hidden">
            {dish.isLoadingImage ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 sm:p-4 bg-slate-900/90 backdrop-blur-sm">
                <div className="relative mb-2 sm:mb-3">
                  <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 animate-pulse"></div>
                  <Utensils className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400 animate-bounce" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-orange-300 animate-pulse px-2">{loadingMessage}</span>
              </div>
            ) : dish.generatedImageUrl && !isError ? (
              <>
                <img src={dish.generatedImageUrl} alt={dish.name} onError={handleImageError} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                {/* Dietary Warning Overlay on Image */}
                {safetyStatus.status === 'unsafe' && (
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-600/90 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-sm flex items-center gap-0.5 sm:gap-1 shadow-lg animate-pulse z-10">
                    <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden xs:inline">{safetyStatus.message.split(',')[0]}</span>
                    <span className="xs:hidden">!</span>
                  </div>
                )}
                {safetyStatus.status === 'safe' && (
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-emerald-600/90 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-sm flex items-center gap-0.5 sm:gap-1 shadow-lg z-10">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden xs:inline">Safe</span>
                    <span className="xs:hidden">✓</span>
                  </div>
                )}

                {/* Share Button Overlay - Only show when not flipped */}
                {!isFlipped && (
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="touch-target absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-slate-900/60 hover:bg-slate-800 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95 z-20 disabled:opacity-50 shadow-lg"
                    title="Share Card"
                  >
                    {isSharing ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                )}

                <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/50 text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full backdrop-blur-sm opacity-0 group-hover/flip:opacity-100 transition-opacity flex items-center gap-0.5 sm:gap-1">
                  <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Flip for Info</span>
                  <span className="sm:hidden">Flip</span>
                </div>
              </>
            ) : (
              <div className="text-slate-600 flex flex-col items-center p-4">
                <Utensils className="w-8 h-8 sm:w-10 sm:h-10 opacity-30 mb-2" />
                <span className="text-[10px] sm:text-xs opacity-50">{isError ? "Generation failed" : "Ready to cook"}</span>
              </div>
            )}
          </div>

          {/* BACK */}
          <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] bg-slate-900 border-b border-slate-800 p-2 sm:p-2.5 overflow-y-auto custom-scrollbar">
            <div className="space-y-1.5 py-1">
              <h4 className="text-orange-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">Nutrition</h4>
              {dish.nutrition ? (
                <>
                  {/* Calories + Serving Size */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <FlameIcon className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="text-white font-bold text-[11px]">{dish.nutrition.calories}</span>
                    </div>
                    {dish.nutrition.servingSize && (
                      <span className="text-[8px] text-slate-500 truncate">per {dish.nutrition.servingSize}</span>
                    )}
                  </div>

                  {/* Macronutrients */}
                  <div className="flex items-start gap-1">
                    <Activity className="w-3 h-3 text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-slate-300 text-[9px] leading-tight break-words">{dish.nutrition.macronutrients}</span>
                  </div>

                  {/* Fiber, Sugar, Sodium - Compact Grid */}
                  {(dish.nutrition.fiber || dish.nutrition.sugar || dish.nutrition.sodium) && (
                    <div className="grid grid-cols-3 gap-1 py-1 bg-slate-800/30 rounded px-1">
                      {dish.nutrition.fiber && (
                        <div className="text-center">
                          <div className="text-[8px] text-slate-500">Fiber</div>
                          <div className="text-[9px] font-semibold text-green-400">{dish.nutrition.fiber}</div>
                        </div>
                      )}
                      {dish.nutrition.sugar && (
                        <div className="text-center">
                          <div className="text-[8px] text-slate-500">Sugar</div>
                          <div className="text-[9px] font-semibold text-pink-400">{dish.nutrition.sugar}</div>
                        </div>
                      )}
                      {dish.nutrition.sodium && (
                        <div className="text-center">
                          <div className="text-[8px] text-slate-500">Sodium</div>
                          <div className="text-[9px] font-semibold text-amber-400">{dish.nutrition.sodium}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vitamins */}
                  <div className="flex items-start gap-1">
                    <HeartPulse className="w-3 h-3 text-pink-400 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-0.5">
                      {dish.nutrition.vitamins.map((v, i) => (
                        <span key={i} className="text-[8px] bg-slate-800 border border-slate-700 px-1 py-0.5 rounded text-slate-400">{v}</span>
                      ))}
                      {dish.nutrition.vitamins.length === 0 && <span className="text-slate-500 text-[9px]">None detected</span>}
                    </div>
                  </div>

                  {/* Allergens - Highlighted Warning */}
                  {dish.nutrition.allergens && dish.nutrition.allergens.length > 0 && (
                    <div className="bg-red-900/20 border border-red-700/50 p-1 rounded">
                      <div className="flex items-start gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-red-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[8px] font-bold text-red-300 uppercase tracking-wide">Allergens</div>
                          <div className="text-[9px] text-red-200 leading-tight break-words">{dish.nutrition.allergens.join(', ')}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Safety */}
                  <div className="flex items-start gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-slate-400 text-[8px] italic leading-tight break-words">{dish.nutrition.safety}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 text-[9px]">Nutrition data unavailable.</div>
              )}

              <div className="text-center text-[8px] text-slate-600 pt-0.5">* AI Estimate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-4 flex flex-col flex-grow relative z-10 bg-slate-800">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-white font-serif tracking-wide leading-tight break-words">
              {showTranslation && dish.translation ? dish.translation.translatedName : dish.name}
            </h3>
            {dish.originalName && dish.originalName !== dish.name && (
              <p className="text-[10px] md:text-xs text-slate-500 italic mt-0.5 font-medium truncate">{dish.originalName}</p>
            )}
            {/* Show translation below if available */}
            {showTranslation && dish.translation && (
              <p className="text-[10px] md:text-xs text-blue-400 italic mt-0.5 font-medium truncate">
                {dish.translation.translatedName !== dish.name && `→ ${dish.translation.translatedName}`}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end shrink-0 gap-1">
            {/* Translation Button */}
            {onTranslate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTranslate(dish);
                }}
                disabled={dish.isLoadingTranslation}
                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition-all disabled:opacity-50 ${dish.translation
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                  }`}
                title={dish.translation ? "View cultural context" : "Translate dish"}
              >
                {dish.isLoadingTranslation ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="hidden sm:inline">Loading...</span>
                  </span>
                ) : (
                  'Cultural'
                )}
              </button>
            )}

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(dish);
                }}
                className="text-slate-400 hover:text-pink-500 transition-colors p-1 -mr-1"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-pink-500 text-pink-500' : ''}`} />
              </button>
            )}

            {/* Safety Icon */}
            {safetyStatus.status === 'unsafe' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {safetyStatus.status === 'safe' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}

            {/* Price */}
            {dish.price && (
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-emerald-400">{dish.price}</span>
                {dish.convertedPrice && (
                  <span className="text-[10px] text-slate-500">{dish.convertedPrice}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {dish.tags && dish.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 mt-1.5">
            {dish.tags.map((tag, idx) => {
              const style = getTagStyle(tag);
              return (
                <span key={idx} className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
                  {style.icon}
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        <p className="text-xs md:text-sm text-slate-400 mb-2.5 sm:mb-3 line-clamp-2 md:line-clamp-3 leading-relaxed">{dish.description}</p>

        {/* Pairing Section on Front */}
        {dish.pairing && (
          <div className="mb-2 flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 sm:py-1.5 bg-rose-900/10 border border-rose-900/20 rounded-lg">
            <Wine className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-400 shrink-0" />
            <p className="text-[10px] md:text-xs text-rose-200/90 font-medium line-clamp-1">
              <span className="opacity-70 mr-0.5 sm:mr-1">Pair:</span>
              {dish.pairing}
            </p>
          </div>
        )}

        <div className="mt-auto space-y-1.5">
          {/* Action Buttons */}
          {(!dish.generatedImageUrl || isError) && !dish.isLoadingImage && (
            <button
              onClick={() => {
                setImageError(false);
                hasTriggeredRef.current = true;
                onGenerate(dish.id, dish.name, dish.description);
              }}
              className="touch-target w-full py-2 sm:py-2.5 px-3 bg-slate-700 hover:bg-orange-600 text-slate-200 hover:text-white text-xs md:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-orange-500/20 active:scale-95"
            >
              {isError ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {isError ? "Retry" : "Visualize Dish"}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onGetRecipe(dish);
            }}
            disabled={dish.isLoadingRecipe}
            className="touch-target w-full py-2 sm:py-2.5 px-3 bg-emerald-900/30 border border-emerald-800 hover:bg-emerald-800/50 text-emerald-200 text-xs md:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {dish.isLoadingRecipe ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
            {dish.isLoadingRecipe ? "Writing Recipe..." : "Cook It Yourself"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DishCard;
