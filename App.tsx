
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, Dish, AppMode, NutritionItem, DietaryPreferences, ChatMessage, HistorySession, RestaurantDetails, UserLanguagePreference } from './types';
import CameraView from './components/CameraView';
import DishCard from './components/DishCard';
import RestaurantCard from './components/RestaurantCard';
import NutritionCard from './components/NutritionCard';
import BillSplitter from './components/BillSplitter';
import DietarySettings from './components/DietarySettings';
import ChatInterface from './components/ChatInterface';
import HistoryView from './components/HistoryView';
import RecipeModal from './components/RecipeModal';
import LanguageSelector from './components/LanguageSelector';
import TranslationModal from './components/TranslationModal';
import { analyzeMenuImage, generateDishImage, analyzeNutritionImage, createMenuChat, generateRecipe } from './services/geminiService';
import { translateDish, detectMenuLanguage } from './services/translationService';
import * as analytics from './services/analyticsService';
import { Camera, ChefHat, RotateCcw, Upload, Search, Pizza, Coffee, UtensilsCrossed, RefreshCw, ArrowDown, Activity, Image as ImageIcon, UserCog, MessageCircle, History as HistoryIcon, Heart, Volume2, Square, Split, Languages } from 'lucide-react';
import { Chat, GenerateContentResponse } from '@google/genai';

// --- Sub-component for the Funny Analyzing Screen ---
const AnalyzingScreen: React.FC<{ mode: AppMode }> = ({ mode }) => {
  const MENU_JOKES = [
    "Deciphering the Chef's secret scribbles...",
    "Consulting the Spirit of Gordon Ramsay...",
    "Translating 'Market Price' to your bank account...",
    "Locating the hidden calories (and hiding them)...",
    "Teaching the AI what 'Al Dente' actually means...",
    "Scanning for invisible onions...",
    "Determining if the cake is a lie..."
  ];

  const NUTRITION_JOKES = [
    "Counting atoms in your salad...",
    "Interviewing the vitamins...",
    "Calculating guilt factor...",
    "Checking if it's Keto, Paleo, or just Tasty...",
    "Scanning for superfoods...",
    "Measuring crunchiness levels...",
    "Estimating happiness per calorie..."
  ];

  const JOKES = mode === 'VISUALIZER' ? MENU_JOKES : NUTRITION_JOKES;
  const [joke, setJoke] = useState(JOKES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJoke(prev => {
        const currIdx = JOKES.indexOf(prev);
        return JOKES[(currIdx + 1) % JOKES.length];
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [JOKES]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 text-slate-800/50 animate-bounce duration-[3000ms]"><Pizza size={64} /></div>
      <div className="absolute bottom-1/4 right-1/4 text-slate-800/50 animate-bounce duration-[4000ms]"><Coffee size={48} /></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-10">
          <div className={`absolute inset-0 ${mode === 'VISUALIZER' ? 'bg-orange-500/20' : 'bg-emerald-500/20'} blur-3xl rounded-full animate-pulse`}></div>
          <div className="relative bg-slate-900 p-6 rounded-full border border-slate-800 shadow-2xl shadow-orange-900/20 animate-[spin_4s_linear_infinite]">
            <Search className={`w-16 h-16 ${mode === 'VISUALIZER' ? 'text-orange-500' : 'text-emerald-500'}`} />
          </div>
        </div>

        <h2 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${mode === 'VISUALIZER' ? 'from-orange-400 to-red-500' : 'from-emerald-400 to-cyan-500'} mb-6 tracking-tight animate-pulse`}>
          {mode === 'VISUALIZER' ? 'Analyzing Menu' : 'Analyzing Food'}
        </h2>

        <div className="h-16 flex items-center justify-center">
          <p className="text-xl text-slate-300 font-medium max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500" key={joke}>
            "{joke}"
          </p>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('VISUALIZER');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [nutritionItems, setNutritionItems] = useState<NutritionItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Bill Splitter State ---
  const [isBillSplitterOpen, setIsBillSplitterOpen] = useState(false);

  // --- Restaurant Details State ---
  const [restaurantDetails, setRestaurantDetails] = useState<RestaurantDetails | null>(null);

  // --- Dietary Preferences State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({
    isVegan: false,
    isVegetarian: false,
    isGlutenFree: false,
    isDairyFree: false,
    avoidPeanuts: false,
    avoidShellfish: false,
    customAllergies: []
  });

  // --- Chat State ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);

  // --- History State ---
  const [historySessions, setHistorySessions] = useState<HistorySession[]>([]);

  // --- Favorites State ---
  const [favorites, setFavorites] = useState<Dish[]>([]);

  // --- Recipe State ---
  const [selectedRecipeDish, setSelectedRecipeDish] = useState<Dish | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // --- TTS State ---
  const [isSpeaking, setIsSpeaking] = useState(false);

  // --- Translation State ---
  const [userLanguage, setUserLanguage] = useState<string>('en');
  const [showTranslations, setShowTranslations] = useState<boolean>(false);
  const [detectedMenuLanguage, setDetectedMenuLanguage] = useState<string | null>(null);
  const [selectedTranslationDish, setSelectedTranslationDish] = useState<Dish | null>(null);
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [showLanguageNotification, setShowLanguageNotification] = useState(false);

  useEffect(() => {
    // Initialize Google Analytics
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      analytics.initGA(gaId);
    }

    // Load history and prefs
    const savedPrefs = localStorage.getItem('menuviz_dietary_prefs');
    if (savedPrefs) {
      try {
        setDietaryPreferences(JSON.parse(savedPrefs));
      } catch (e) { console.error(e); }
    }

    const savedHistory = localStorage.getItem('menuviz_history');
    if (savedHistory) {
      try {
        setHistorySessions(JSON.parse(savedHistory));
      } catch (e) { console.error(e); }
    }

    const savedFavorites = localStorage.getItem('menuviz_favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) { console.error(e); }
    }

    // Load language preference
    const savedLanguage = localStorage.getItem('menuviz_language');
    if (savedLanguage) {
      setUserLanguage(savedLanguage);
    }

    // Cleanup speech on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleUpdatePreferences = (prefs: DietaryPreferences) => {
    setDietaryPreferences(prefs);
    localStorage.setItem('menuviz_dietary_prefs', JSON.stringify(prefs));
  };

  const handleToggleFavorite = (dish: Dish) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.name === dish.name);
      let newFavs;
      if (exists) {
        newFavs = prev.filter(f => f.name !== dish.name);
        // Track favorite removed
        analytics.trackFavorite({ action: 'removed', dishName: dish.name });
      } else {
        // Ensure we save a clean version of the dish without loading states
        const { isLoadingImage, isLoadingRecipe, ...cleanDish } = dish;
        newFavs = [...prev, { ...cleanDish, isLoadingImage: false, isLoadingRecipe: false }];
        // Track favorite added
        analytics.trackFavorite({ action: 'added', dishName: dish.name });
      }
      localStorage.setItem('menuviz_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const saveToHistory = (mode: AppMode, items: Dish[] | NutritionItem[]) => {
    const firstItemName = items.length > 0 ? items[0].name : 'Unknown';
    const summary = mode === 'VISUALIZER'
      ? `${firstItemName.substring(0, 20)}${items.length > 1 ? '...' : ''} Menu`
      : `${firstItemName.substring(0, 20)}${items.length > 1 ? '...' : ''} Scan`;

    const cleanItems = items.map(item => {
      if ('generatedImageUrl' in item) {
        const { generatedImageUrl, ...rest } = item as Dish;
        return { ...rest, isLoadingImage: false, isLoadingRecipe: false };
      }
      return item;
    });

    const newSession: HistorySession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode,
      items: cleanItems,
      summary
    };

    const updatedHistory = [newSession, ...historySessions];
    setHistorySessions(updatedHistory);

    try {
      localStorage.setItem('menuviz_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("History storage limit reached", e);
    }
  };

  const deleteHistorySession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historySessions.filter(s => s.id !== id);
    setHistorySessions(updated);
    localStorage.setItem('menuviz_history', JSON.stringify(updated));
  };

  const loadHistorySession = (session: HistorySession) => {
    setAppMode(session.mode);
    if (session.mode === 'VISUALIZER') {
      setDishes(session.items as Dish[]);
      chatSessionRef.current = createMenuChat(session.items as Dish[]);
      setChatMessages([]);
    } else {
      setNutritionItems(session.items as NutritionItem[]);
    }
    setAppState(AppState.RESULTS);
  };

  // --- Data Persistence for Refresh ---
  const [currentImageData, setCurrentImageData] = useState<{ base64: string, mimeType: string } | null>(null);

  // --- Queue System State ---
  const [generationQueue, setGenerationQueue] = useState<Dish[]>([]);
  const [processingCount, setProcessingCount] = useState(0);

  const MAX_CONCURRENCY = 6; // Increased from 3 for faster image loading

  // --- Pull to Refresh State ---
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const startCamera = () => {
    setAppState(AppState.CAMERA);
    setErrorMessage(null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const toggleMode = (mode: AppMode) => {
    if (appState === AppState.IDLE) {
      setAppMode(mode);
    }
  };

  // Function to handle single image generation
  const processImageGeneration = useCallback(async (dish: Dish) => {
    try {
      const imageUrl = await generateDishImage(dish.name, dish.description);
      setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, isLoadingImage: false, generatedImageUrl: imageUrl, generationFailed: false } : d));
    } catch (err) {
      console.error(`Generation failed for ${dish.name}`, err);
      setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, isLoadingImage: false, generationFailed: true } : d));
    } finally {
      setTimeout(() => {
        setProcessingCount(prev => prev - 1);
      }, 300);
    }
  }, []);

  // Queue Processor Effect
  useEffect(() => {
    if (generationQueue.length === 0 || processingCount >= MAX_CONCURRENCY) return;

    const nextDish = generationQueue[0];
    setGenerationQueue(prev => prev.slice(1));
    setProcessingCount(prev => prev + 1);
    processImageGeneration(nextDish);

  }, [generationQueue, processingCount, processImageGeneration]);


  const handleManualGenerate = useCallback((id: string, name: string, description: string) => {
    setDishes(prev => {
      const exists = prev.find(d => d.id === id);
      if (exists && exists.isLoadingImage) return prev;
      return prev.map(d => d.id === id ? { ...d, isLoadingImage: true, generationFailed: false } : d);
    });

    const existingDish = dishes.find(d => d.id === id);

    const dishToProcess: Dish = {
      id,
      name,
      description,
      isLoadingImage: true,
      tags: existingDish?.tags || [],
      nutrition: existingDish?.nutrition,
      pairing: existingDish?.pairing,
      price: existingDish?.price,
      convertedPrice: existingDish?.convertedPrice,
      originalName: existingDish?.originalName,
      recipe: existingDish?.recipe,
      generationFailed: false
    };
    setGenerationQueue(prev => {
      if (prev.some(d => d.id === id)) return prev;
      return [dishToProcess, ...prev];
    });
  }, [dishes]);

  // --- Recipe Handler ---
  const handleGetRecipe = async (dish: Dish) => {
    if (dish.recipe) {
      setSelectedRecipeDish(dish);
      setIsRecipeModalOpen(true);
      return;
    }

    // Set loading state
    setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, isLoadingRecipe: true } : d));

    try {
      const recipe = await generateRecipe(dish.name, dish.description);

      setDishes(prev => prev.map(d => {
        if (d.id === dish.id) {
          const updatedDish = { ...d, recipe, isLoadingRecipe: false };
          setSelectedRecipeDish(updatedDish);
          setIsRecipeModalOpen(true);
          // Track recipe generation
          analytics.trackRecipeGeneration({
            dishName: dish.name,
            difficulty: recipe.difficulty
          });
          return updatedDish;
        }
        return d;
      }));

    } catch (error) {
      console.error("Failed to get recipe", error);
      setDishes(prev => prev.map(d => d.id === dish.id ? { ...d, isLoadingRecipe: false } : d));
      // Track error
      analytics.trackError({
        errorType: 'recipe_generation_failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        context: dish.name
      });
    }
  };

  // --- Translation Handlers ---
  const handleLanguageChange = (languageCode: string) => {
    const previousLanguage = userLanguage;
    setUserLanguage(languageCode);
    localStorage.setItem('menuviz_language', languageCode);

    // Track language change
    analytics.trackLanguageChange({
      fromLanguage: previousLanguage,
      toLanguage: languageCode
    });

    // Automatically translate all dishes when language changes
    if (dishes.length > 0) {
      setShowTranslations(true);
      // Clear existing translations to force re-translation
      setDishes(prev => prev.map(d => ({ ...d, translation: undefined })));
      // Trigger translation for all dishes
      setTimeout(() => {
        handleTranslateAll();
      }, 100);
    }
  };

  const handleTranslateDish = async (dish: Dish, autoTranslate: boolean = false) => {
    // If already translated, just show the modal (only if not auto-translating)
    if (dish.translation && !autoTranslate) {
      setSelectedTranslationDish(dish);
      setIsTranslationModalOpen(true);
      return;
    }

    // Start translation
    setDishes(prev => prev.map(d =>
      d.id === dish.id ? { ...d, isLoadingTranslation: true } : d
    ));

    try {
      const translation = await translateDish(dish, userLanguage);
      setDishes(prev => prev.map(d =>
        d.id === dish.id ? { ...d, translation, isLoadingTranslation: false } : d
      ));

      // Track translation (only for manual translations, not auto)
      if (!autoTranslate) {
        analytics.trackTranslation({
          dishName: dish.name,
          fromLanguage: translation.detectedLanguage,
          toLanguage: userLanguage,
          autoTranslate: false
        });
      }

      // Only open modal if user clicked manually (not auto-translate)
      if (!autoTranslate) {
        setSelectedTranslationDish({ ...dish, translation });
        setIsTranslationModalOpen(true);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      setDishes(prev => prev.map(d =>
        d.id === dish.id ? { ...d, isLoadingTranslation: false } : d
      ));
      // Track error
      analytics.trackError({
        errorType: 'translation_failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        context: dish.name
      });
    }
  };

  const handleTranslateAll = async () => {
    setShowTranslations(true);

    for (const dish of dishes) {
      if (!dish.translation && !dish.isLoadingTranslation) {
        handleTranslateDish(dish, true); // Pass true for auto-translate
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  // Detect menu language when dishes are loaded
  useEffect(() => {
    if (dishes.length > 0 && appMode === 'VISUALIZER' && !detectedMenuLanguage) {
      detectMenuLanguage(dishes).then(lang => {
        if (lang && lang !== 'en' && lang !== userLanguage) {
          setDetectedMenuLanguage(lang);
          setShowLanguageNotification(true);
        }
      });
    }
  }, [dishes, appMode, detectedMenuLanguage, userLanguage]);

  const handleCapture = async (base64Image: string, mimeType: string = 'image/jpeg') => {
    setCurrentImageData({ base64: base64Image, mimeType });
    setAppState(AppState.ANALYZING);
    setGenerationQueue([]);
    setProcessingCount(0);

    try {
      if (appMode === 'VISUALIZER') {
        const analysisResult = await analyzeMenuImage(base64Image, mimeType);
        const rawDishes = analysisResult.dishes;
        const formattedDishes: Dish[] = rawDishes.map((d, index) => ({
          id: `dish-${index}-${Date.now()}`,
          name: d.name,
          originalName: d.originalName,
          description: d.description,
          tags: d.tags || [],
          nutrition: d.nutrition,
          pairing: d.pairing,
          price: d.price,
          convertedPrice: d.convertedPrice,
          isLoadingImage: false
        }));


        setDishes(formattedDishes);
        setRestaurantDetails({
          summary: analysisResult.restaurantName ? `Menu from ${analysisResult.restaurantName}` : "",
          rating: undefined,
          mapLink: analysisResult.restaurantLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(analysisResult.restaurantName + " " + analysisResult.restaurantLocation)}` : undefined
        });

        saveToHistory('VISUALIZER', formattedDishes);

        chatSessionRef.current = createMenuChat(formattedDishes);
        setChatMessages([]);

        // Track menu scan
        analytics.trackMenuScan({
          dishCount: formattedDishes.length,
          mode: 'visualizer',
          languageDetected: detectedMenuLanguage || undefined,
          restaurantName: analysisResult.restaurantName || undefined
        });

      } else {
        const rawNutrition = await analyzeNutritionImage(base64Image, mimeType);
        const formattedNutrition: NutritionItem[] = rawNutrition.map((d, index) => ({
          ...d,
          id: `nutri-${index}-${Date.now()}`
        }));
        setNutritionItems(formattedNutrition);
        saveToHistory('NUTRITION', formattedNutrition);

        // Track nutrition scan
        analytics.trackMenuScan({
          dishCount: formattedNutrition.length,
          mode: 'nutrition'
        });
      }

      setAppState(AppState.RESULTS);

    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to analyze. Please try again.");
      setAppState(AppState.ERROR);
      // Track error
      analytics.trackError({
        errorType: 'menu_analysis_failed',
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        context: appMode
      });
    }
  };

  const handleRefresh = async () => {
    if (!currentImageData) return;

    setIsRefreshing(true);
    setGenerationQueue([]);
    setProcessingCount(0);

    try {
      if (appMode === 'VISUALIZER') {
        const analysisResult = await analyzeMenuImage(currentImageData.base64, currentImageData.mimeType);
        const rawDishes = analysisResult.dishes;
        const formattedDishes: Dish[] = rawDishes.map((d, index) => ({
          id: `dish-${index}-${Date.now()}-refresh`,
          name: d.name,
          originalName: d.originalName,
          description: d.description,
          tags: d.tags || [],
          nutrition: d.nutrition,
          pairing: d.pairing,
          price: d.price,
          convertedPrice: d.convertedPrice,
          isLoadingImage: false
        }));

        setDishes(formattedDishes);
        setRestaurantDetails({
          summary: analysisResult.restaurantName ? `Menu from ${analysisResult.restaurantName}` : "",
          rating: undefined,
          mapLink: analysisResult.restaurantLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(analysisResult.restaurantName + " " + analysisResult.restaurantLocation)}` : undefined
        });
        chatSessionRef.current = createMenuChat(formattedDishes);
        setChatMessages([]);
      } else {
        const rawNutrition = await analyzeNutritionImage(currentImageData.base64, currentImageData.mimeType);
        const formattedNutrition: NutritionItem[] = rawNutrition.map((d, index) => ({
          ...d,
          id: `nutri-${index}-${Date.now()}-refresh`
        }));
        setNutritionItems(formattedNutrition);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  // --- Chat Logic ---
  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setIsChatTyping(true);

    // Track chat message sent
    analytics.trackChatInteraction({
      action: 'message_sent',
      messageCount: chatMessages.length + 1
    });

    try {
      const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: text });
      const responseText = result.text;
      setChatMessages(prev => [...prev, { role: 'model', text: responseText || "I'm sorry, I couldn't formulate a response." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the kitchen right now." }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // --- TTS Logic ---
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      let textToRead = "";
      if (appMode === 'VISUALIZER' && dishes.length > 0) {
        textToRead = "Here is the menu. " + dishes.map(d => `${d.name}, ${d.price ? d.price : ''}.`).join(' ');
      } else if (appMode === 'NUTRITION' && nutritionItems.length > 0) {
        textToRead = "Here is the nutrition analysis. " + nutritionItems.map(d => `${d.name}, ${d.calories}.`).join(' ');
      } else {
        textToRead = "There is nothing to read yet.";
      }

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // --- Pull to Refresh Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (appState !== AppState.RESULTS) return;
    if (window.scrollY <= 5) {
      setPullStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (appState !== AppState.RESULTS || pullStartY === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY;

    if (diff > 0 && window.scrollY <= 5) {
      setPullDistance(Math.min(diff * 0.4, 120));
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (appState !== AppState.RESULTS) return;
    if (pullDistance > 80 && !isRefreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
    setPullStartY(0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 1500;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, 0.8);
          const base64 = dataUrl.split(',')[1];
          handleCapture(base64, mimeType);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const resetApp = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setDishes([]);
    setNutritionItems([]);
    setGenerationQueue([]);
    setProcessingCount(0);
    setAppState(AppState.IDLE);
    setErrorMessage(null);
    setCurrentImageData(null);
    setChatMessages([]);
    chatSessionRef.current = null;
    setRestaurantDetails(null);
    setIsBillSplitterOpen(false);
  };

  // -- RENDER STATES --

  if (appState === AppState.CAMERA) {
    return <CameraView onCapture={(base64) => handleCapture(base64, 'image/jpeg')} onCancel={() => setAppState(AppState.IDLE)} />;
  }

  if (appState === AppState.ANALYZING) {
    return <AnalyzingScreen mode={appMode} />;
  }

  if (appState === AppState.ERROR) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="bg-red-500/10 p-6 rounded-full mb-6 animate-bounce">
          <UtensilsCrossed className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Oops! Kitchen Fire!</h2>
        <p className="text-slate-300 mb-8 max-w-xs mx-auto">{errorMessage || "Something went wrong."}</p>
        <button
          onClick={resetApp}
          className="bg-slate-100 text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-white transition-colors shadow-lg shadow-white/10"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (appState === AppState.HISTORY) {
    return (
      <HistoryView
        sessions={historySessions}
        onSelectSession={loadHistorySession}
        onDeleteSession={deleteHistorySession}
        onBack={() => setAppState(AppState.IDLE)}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-50 selection:bg-orange-500/30"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={scrollContainerRef}
    >
      <DietarySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={dietaryPreferences}
        onUpdate={handleUpdatePreferences}
      />

      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isTyping={isChatTyping}
      />

      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        dish={selectedRecipeDish}
      />

      <TranslationModal
        isOpen={isTranslationModalOpen}
        onClose={() => setIsTranslationModalOpen(false)}
        dish={selectedTranslationDish}
        targetLanguage={userLanguage}
      />

      <BillSplitter
        isOpen={isBillSplitterOpen}
        onClose={() => setIsBillSplitterOpen(false)}
        dishes={dishes}
      />

      {/* Language Detection Notification */}
      {showLanguageNotification && detectedMenuLanguage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-900/95 backdrop-blur-xl border border-blue-700 rounded-xl shadow-2xl p-4 max-w-md">
            <div className="flex items-start gap-3">
              <Languages className="w-5 h-5 text-blue-300 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-blue-100 font-medium mb-2">
                  Foreign menu detected! Would you like to translate to {userLanguage === 'en' ? 'English' : 'your language'}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleTranslateAll();
                      setShowLanguageNotification(false);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Translate All
                  </button>
                  <button
                    onClick={() => setShowLanguageNotification(false)}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowLanguageNotification(false)}
                className="text-blue-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col min-h-screen relative md:border-x border-slate-900/50 md:shadow-2xl">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 safe-top px-3 sm:px-4 md:px-6 py-3 md:py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer touch-feedback" onClick={resetApp}>
            <div className={`bg-gradient-to-tr ${appMode === 'VISUALIZER' ? 'from-orange-500 to-red-600' : 'from-emerald-500 to-cyan-600'} p-2 md:p-2.5 rounded-lg shadow-lg shadow-orange-500/20`}>
              <ChefHat className="w-6 h-6 md:w-6 md:h-6 text-white" />
            </div>
            <h1 className="text-xl md:text-xl font-bold tracking-tight text-white">MenuViz</h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
            {/* Language Selector - Only in RESULTS for VISUALIZER */}
            {appState === AppState.RESULTS && appMode === 'VISUALIZER' && (
              <LanguageSelector
                currentLanguage={userLanguage}
                onLanguageChange={handleLanguageChange}
              />
            )}

            {/* TTS Button - Only show in RESULTS */}
            {appState === AppState.RESULTS && (
              <>
                <button
                  onClick={toggleSpeech}
                  className={`touch-target p-2 sm:p-2.5 md:p-2 rounded-full transition-colors flex items-center justify-center ${isSpeaking ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'text-cyan-400 hover:text-white hover:bg-cyan-900/50'}`}
                  title="Read Menu Aloud"
                >
                  {isSpeaking ? <Square className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                {appMode === 'VISUALIZER' && (
                  <button
                    onClick={() => setIsBillSplitterOpen(true)}
                    className="touch-target p-2 sm:p-2.5 md:p-2 text-emerald-400 hover:text-white hover:bg-emerald-900/50 rounded-full transition-colors flex items-center justify-center"
                    title="Split Bill"
                  >
                    <Split className="w-5 h-5" />
                  </button>
                )}
              </>
            )}

            {/* Dietary Profile Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="touch-target p-2 sm:p-2.5 md:p-2 text-blue-400 hover:text-white hover:bg-blue-900/50 rounded-full transition-colors relative flex items-center justify-center"
              title="Dietary Profile"
            >
              <UserCog className="w-5 h-5" />
              {(dietaryPreferences.isVegan || dietaryPreferences.isVegetarian || dietaryPreferences.avoidPeanuts || dietaryPreferences.avoidShellfish || dietaryPreferences.isGlutenFree) && (
                <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900"></span>
              )}
            </button>

            {/* History Button - Only show on IDLE or RESULTS */}
            {(appState === AppState.IDLE || appState === AppState.RESULTS) && (
              <button
                onClick={() => setAppState(AppState.HISTORY)}
                className="touch-target p-2 sm:p-2.5 md:p-2 text-purple-400 hover:text-white hover:bg-purple-900/50 rounded-full transition-colors flex items-center justify-center"
                title="History"
              >
                <HistoryIcon className="w-5 h-5" />
              </button>
            )}

            {appState === AppState.RESULTS && (
              <>
                {appMode === 'VISUALIZER' && (
                  <div className="hidden lg:block text-xs font-mono text-slate-500 mx-2">
                    {processingCount > 0 ? `Cooking: ${processingCount} dishes...` : 'Ready'}
                  </div>
                )}
                <button
                  onClick={resetApp}
                  className="touch-target p-2 sm:p-2.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center"
                  title="Start Over"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Refresh Indicator */}
          <div
            className={`absolute top-full left-0 right-0 flex justify-center pointer-events-none transition-all duration-300 ease-out overflow-hidden ${pullDistance > 0 || isRefreshing ? 'opacity-100 translate-y-4' : 'opacity-0 -translate-y-4'}`}
            style={{ transform: `translateY(${isRefreshing ? 20 : pullDistance / 2}px)` }}
          >
            <div className="bg-slate-800 text-orange-500 p-2 rounded-full shadow-lg border border-slate-700 flex items-center justify-center w-10 h-10">
              {isRefreshing ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <ArrowDown className="w-6 h-6 transition-transform" style={{ transform: `rotate(${pullDistance * 2}deg)` }} />
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main
          className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col w-full transition-transform duration-200 ease-out"
          style={{ transform: isRefreshing ? 'translateY(20px)' : `translateY(${pullDistance / 3}px)` }}
        >

          {appState === AppState.IDLE && (
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 py-4 sm:py-6">

              <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 sm:space-y-4 max-w-lg w-full px-2">

                {/* Mode Toggle */}
                <div className="bg-slate-900/80 p-1 rounded-full inline-flex border border-slate-800">
                  <button
                    onClick={() => toggleMode('VISUALIZER')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all touch-feedback ${appMode === 'VISUALIZER' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline-block mr-1 sm:mr-1.5" />
                    Visualizer
                  </button>
                  <button
                    onClick={() => toggleMode('NUTRITION')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all touch-feedback ${appMode === 'NUTRITION' ? 'bg-emerald-900 text-emerald-300 shadow-lg border border-emerald-800/50' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline-block mr-1 sm:mr-1.5" />
                    Nutrition
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r leading-tight ${appMode === 'VISUALIZER' ? 'from-orange-400 via-red-500 to-purple-600' : 'from-emerald-400 via-teal-500 to-cyan-600'}`}>
                    {appMode === 'VISUALIZER' ? 'See what you eat.' : 'Know what you eat.'}
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                    {appMode === 'VISUALIZER'
                      ? 'Take a photo of any menu and let AI visualize it instantly.'
                      : 'Scan food to get instant calories, vitamins, and safety info.'}
                  </p>
                </div>

                {/* Desktop/Tablet Actions */}
                <div className="hidden md:flex gap-3 w-full pt-2">
                  <button
                    onClick={startCamera}
                    className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 touch-feedback text-sm ${appMode === 'VISUALIZER' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}`}
                  >
                    <Camera className="w-4 h-4" />
                    Scan {appMode === 'VISUALIZER' ? 'Menu' : 'Food'}
                  </button>
                  <button
                    onClick={triggerFileUpload}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 border border-slate-700 touch-feedback text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
              </div>

              {/* Visual Hero Element - Smaller */}
              <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-xs aspect-[3/4] group perspective-1000 mx-auto md:mx-0">
                <div className={`absolute -inset-1 bg-gradient-to-r rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 ${appMode === 'VISUALIZER' ? 'from-orange-600 to-purple-600' : 'from-emerald-600 to-cyan-600'}`}></div>
                <div className="relative h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl rotate-y-12 group-hover:rotate-0 transition-transform duration-700 ease-out">
                  <img
                    src={appMode === 'VISUALIZER'
                      ? "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80"
                      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                    alt="Hero"
                    className="w-full h-full object-cover opacity-60 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-3 sm:p-4 flex flex-col justify-end">
                    <div className="bg-slate-950/80 backdrop-blur-md p-2 sm:p-3 rounded-lg border border-slate-800">
                      <div className="flex gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                        {appMode === 'VISUALIZER' ? 'Analyzing...' : 'Scanning...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {appState === AppState.RESULTS && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-24 sm:pb-28 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 border-b border-slate-800 pb-3 md:pb-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-200">
                  {appMode === 'VISUALIZER'
                    ? `Found ${dishes.length} Dish${dishes.length !== 1 ? 'es' : ''}`
                    : `Analyzed ${nutritionItems.length} Item${nutritionItems.length !== 1 ? 's' : ''}`
                  }
                </h2>
                <span className="text-xs md:text-sm text-slate-500 bg-slate-900 px-2 md:px-3 py-1 rounded-full border border-slate-800">Gemini 2.5 Flash</span>
              </div>

              {appMode === 'VISUALIZER' && (
                <RestaurantCard
                  name={restaurantDetails?.summary?.replace("Menu from ", "") || ""}
                  details={restaurantDetails}
                  isLoading={false}
                />
              )}

              <div className="card-grid">
                {appMode === 'VISUALIZER' ? (
                  dishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      onGenerate={handleManualGenerate}
                      preferences={dietaryPreferences}
                      onGetRecipe={handleGetRecipe}
                      isFavorite={favorites.some(f => f.name === dish.name)}
                      onToggleFavorite={handleToggleFavorite}
                      onTranslate={handleTranslateDish}
                      showTranslation={showTranslations}
                    />
                  ))
                ) : (
                  nutritionItems.map((item) => (
                    <NutritionCard
                      key={item.id}
                      item={item}
                    />
                  ))
                )}
              </div>
            </div>
          )}

        </main>

        {/* Floating Chat Button (Visible only in RESULTS for Visualizer) */}
        {appState === AppState.RESULTS && appMode === 'VISUALIZER' && !isChatOpen && (
          <button
            onClick={() => {
              setIsChatOpen(true);
              analytics.trackChatInteraction({ action: 'opened' });
            }}
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 safe-bottom safe-right z-30 w-14 h-14 sm:w-16 sm:h-16 bg-orange-600 hover:bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-in zoom-in duration-300 touch-feedback"
            title="Chat with Chef"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </button>
        )}

        {/* Mobile Sticky Footer Actions - 50% smaller */}
        {appState === AppState.IDLE && (
          <div className="md:hidden sticky bottom-0 p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent z-20 safe-bottom">
            <div className="flex flex-col gap-2">
              <button
                onClick={startCamera}
                className={`w-full text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 touch-feedback ${appMode === 'VISUALIZER' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20'}`}
              >
                <Camera className="w-4 h-4" />
                Scan {appMode === 'VISUALIZER' ? 'Menu' : 'Food'}
              </button>

              <button
                onClick={triggerFileUpload}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 border border-slate-700 touch-feedback"
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
            </div>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

      </div>
    </div>
  );
};

export default App;