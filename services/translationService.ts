
import { GoogleGenAI, Type } from "@google/genai";
import { Dish, DishTranslation } from "../types";

const apiKey = "AIzaSyALsSIbodturBZ0mnpu1QVU_pTZTcnYDxM";
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Translation cache
const translationCache = new Map<string, DishTranslation>();

// Supported European languages (priority)
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

/**
 * Detects the language of a menu based on dish names
 */
export const detectMenuLanguage = async (dishes: Dish[]): Promise<string | null> => {
    if (dishes.length === 0) return null;

    try {
        const dishNames = dishes.slice(0, 5).map(d => d.originalName || d.name).join(', ');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [{
                    text: `Detect the language of these dish names: "${dishNames}". 
          Return ONLY the ISO 639-1 language code (e.g., 'fr' for French, 'es' for Spanish, 'en' for English).
          If multiple languages, return the most dominant one.
          If uncertain, return 'unknown'.`
                }]
            }
        });

        const languageCode = response.text?.trim().toLowerCase() || 'unknown';
        return languageCode !== 'unknown' ? languageCode : null;
    } catch (error) {
        console.error('Error detecting language:', error);
        return null;
    }
};

/**
 * Translates a dish with cultural context and pronunciation
 */
export const translateDish = async (
    dish: Dish,
    targetLanguage: string
): Promise<DishTranslation> => {
    const cacheKey = `${dish.name}_${targetLanguage}`;

    // Check cache first
    if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!;
    }

    try {
        const originalName = dish.originalName || dish.name;
        const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || 'English';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [{
                    text: `Translate and provide cultural context for this dish:
          
          Dish Name: "${originalName}"
          Description: "${dish.description}"
          
          Provide a JSON response with:
          1. "translatedName": Translation to ${targetLangName}
          2. "pronunciation": IPA phonetic notation
          3. "simplifiedPronunciation": Easy-to-read pronunciation (e.g., "es-car-GO")
          4. "culturalContext": 2-3 sentences about the dish's origin, cultural significance, and traditional preparation
          5. "ingredientExplanations": Array of 3-5 key ingredients with brief explanations of what they are and their role
          6. "originCountry": Country of origin
          7. "detectedLanguage": ISO 639-1 code of the original language (e.g., 'fr', 'es', 'it')
          
          Be informative but concise. Focus on interesting cultural facts.`
                }]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translatedName: { type: Type.STRING },
                        pronunciation: { type: Type.STRING },
                        simplifiedPronunciation: { type: Type.STRING },
                        culturalContext: { type: Type.STRING },
                        ingredientExplanations: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        originCountry: { type: Type.STRING },
                        detectedLanguage: { type: Type.STRING }
                    },
                    required: ['translatedName', 'pronunciation', 'simplifiedPronunciation', 'culturalContext', 'ingredientExplanations', 'originCountry', 'detectedLanguage']
                }
            }
        });

        if (!response.text) {
            throw new Error("No response from translation service");
        }

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const translation = JSON.parse(jsonStr) as DishTranslation;

        // Cache the translation
        translationCache.set(cacheKey, translation);

        // Also cache to localStorage for persistence
        try {
            const storedCache = JSON.parse(localStorage.getItem('menuviz_translations') || '{}');
            storedCache[cacheKey] = translation;
            localStorage.setItem('menuviz_translations', JSON.stringify(storedCache));
        } catch (e) {
            console.warn('Failed to cache translation to localStorage:', e);
        }

        return translation;
    } catch (error) {
        console.error('Error translating dish:', error);
        throw error;
    }
};

/**
 * Batch translate multiple dishes
 */
export const translateMultipleDishes = async (
    dishes: Dish[],
    targetLanguage: string,
    onProgress?: (completed: number, total: number) => void
): Promise<Map<string, DishTranslation>> => {
    const results = new Map<string, DishTranslation>();

    for (let i = 0; i < dishes.length; i++) {
        try {
            const translation = await translateDish(dishes[i], targetLanguage);
            results.set(dishes[i].id, translation);

            if (onProgress) {
                onProgress(i + 1, dishes.length);
            }
        } catch (error) {
            console.error(`Failed to translate dish ${dishes[i].name}:`, error);
        }
    }

    return results;
};

/**
 * Load cached translations from localStorage
 */
export const loadCachedTranslations = (): void => {
    try {
        const storedCache = JSON.parse(localStorage.getItem('menuviz_translations') || '{}');
        Object.entries(storedCache).forEach(([key, value]) => {
            translationCache.set(key, value as DishTranslation);
        });
    } catch (e) {
        console.warn('Failed to load cached translations:', e);
    }
};

/**
 * Get available languages
 */
export const getAvailableLanguages = () => SUPPORTED_LANGUAGES;

// Load cache on module initialization
loadCachedTranslations();
