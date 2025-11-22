
export type AppMode = 'VISUALIZER' | 'NUTRITION';

export interface NutritionInfo {
  calories: string;
  macronutrients: string;
  vitamins: string[];
  safety: string;

  // Phase 1 Enhancements
  allergens?: string[];
  fiber?: string;
  sugar?: string;
  sodium?: string;
  servingSize?: string;
}

export interface DietaryPreferences {
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  avoidPeanuts: boolean;
  avoidShellfish: boolean;
  customAllergies: string[];
}

export interface Recipe {
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  shoppingList: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface DishTranslation {
  translatedName: string;
  pronunciation: string; // IPA format
  simplifiedPronunciation: string; // Easy to read (e.g., "SOO-shee")
  culturalContext: string;
  ingredientExplanations: string[];
  originCountry: string;
  detectedLanguage: string; // ISO code of original language
}

export interface UserLanguagePreference {
  preferredLanguage: string; // ISO code: 'en', 'fr', 'es', 'de', etc.
  showPronunciation: boolean;
  showCulturalContext: boolean;
  autoTranslate: boolean;
}

export interface Dish {
  id: string;
  name: string;
  originalName?: string; // Native language name (e.g. "Escargots")
  description: string;
  tags: string[];
  pairing?: string; // AI Sommelier suggestion
  price?: string; // Original price (e.g. "€15")
  convertedPrice?: string; // AI Estimated conversion (e.g. "~$16")
  nutrition?: NutritionInfo;
  recipe?: Recipe; // Generated recipe
  isLoadingRecipe?: boolean; // Loading state for recipe generation
  generatedImageUrl?: string;
  isLoadingImage: boolean;
  generationFailed?: boolean;
  translation?: DishTranslation; // Translation data
  isLoadingTranslation?: boolean; // Loading state for translation
}

export interface NutritionItem {
  id: string;
  name: string;
  type: string;
  calories: string;
  safety: string;
  vitamins: string[];
  macronutrients: string;
  description: string;
}

export interface HistorySession {
  id: string;
  timestamp: number;
  mode: AppMode;
  items: Dish[] | NutritionItem[];
  summary: string; // E.g., "Italian Menu - 12 items"
}

export enum AppState {
  IDLE = 'IDLE',
  CAMERA = 'CAMERA',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY'
}

export interface AnalysisResult {
  rawText: string;
  dishes: Dish[];
}

export interface MenuAnalysisResult {
  restaurantName: string | null;
  restaurantLocation: string | null;
  dishes: {
    name: string;
    originalName?: string;
    description: string;
    tags: string[];
    nutrition?: NutritionInfo;
    pairing?: string;
    price?: string;
    convertedPrice?: string;
  }[];
}

export interface RestaurantDetails {
  summary: string;
  rating?: number;
  mapLink?: string;
  sourceUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}