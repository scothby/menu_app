
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Dish, NutritionItem, Recipe, MenuAnalysisResult, RestaurantDetails } from "../types";

// Hardcoded API key (temporary solution)
const apiKey = "AIzaSyALsSIbodturBZ0mnpu1QVU_pTZTcnYDxM";

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// --- Image Caching System ---
// In-memory cache for the current session (fastest access)
const memoryCache = new Map<string, string>();

// Helper to generate a standardized cache key from dish name
const getCacheKey = (name: string) => `menuviz_cache_${name.toLowerCase().trim().replace(/\s+/g, '_')}`;

/**
 * Analyzes a menu image to extract dish names, descriptions, tags, nutrition, pairing, pricing
 * AND Restaurant Metadata.
 */
export const analyzeMenuImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<MenuAnalysisResult> => {
  try {
    const modelId = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Analyze this restaurant menu image. 
                   1. **Restaurant Name Extraction**: Look at the top of the page, logos, or footers. Identify the name of the establishment. If you are unsure, give your best guess based on the largest header text.
                   2. **Location**: Look for addresses, city names, or phone area codes to identify the location.
                   3. **Dish Extraction**: Identify all menu items.
                   
                   Return a JSON object containing:
                   - 'restaurantName': String (e.g. "Luigi's Trattoria") or null.
                   - 'restaurantLocation': String (e.g. "New York, NY") or null.
                   - 'dishes': An array of dish objects.
                   
                   For each dish, provide:
                   1. 'name': The name of the dish in ENGLISH (Translated).
                   2. 'originalName': The name of the dish exactly as it appears on the menu (Native Language).
                   3. 'description': A visual description (under 20 words).
                   4. 'tags': A list of dietary tags (Vegan, Gluten-Free, Spicy, Contains Nuts, etc.).
                   5. 'nutrition': Detailed nutrition estimate:
                      - calories: total calories (e.g., "450 cal")
                      - macronutrients: "Protein: Xg, Carbs: Xg, Fat: Xg"
                      - vitamins: array of key vitamins/nutrients
                      - safety: dietary warnings or confirmations
                      - allergens: array of common allergens (Gluten, Dairy, Nuts, Shellfish, Eggs, Soy, Fish)
                      - fiber: fiber content (e.g., "8g" or "High")
                      - sugar: total sugar (e.g., "12g" or "5g added")
                      - sodium: sodium/salt content (e.g., "850mg" or "High")
                      - servingSize: typical serving size (e.g., "350g" or "1 plate")
                   6. 'pairing': A short recommended drink pairing.
                   7. 'price': The price listed on the menu with currency symbol.
                   8. 'convertedPrice': If not USD, provide approx conversion to USD.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            restaurantName: { type: Type.STRING, nullable: true },
            restaurantLocation: { type: Type.STRING, nullable: true },
            dishes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  originalName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  nutrition: {
                    type: Type.OBJECT,
                    properties: {
                      calories: { type: Type.STRING },
                      macronutrients: { type: Type.STRING },
                      vitamins: { type: Type.ARRAY, items: { type: Type.STRING } },
                      safety: { type: Type.STRING },
                      allergens: { type: Type.ARRAY, items: { type: Type.STRING } },
                      fiber: { type: Type.STRING },
                      sugar: { type: Type.STRING },
                      sodium: { type: Type.STRING },
                      servingSize: { type: Type.STRING }
                    },
                    required: ['calories', 'macronutrients', 'vitamins', 'safety']
                  },
                  pairing: { type: Type.STRING },
                  price: { type: Type.STRING },
                  convertedPrice: { type: Type.STRING }
                },
                required: ['name', 'description', 'tags', 'nutrition', 'pairing']
              }
            }
          },
          required: ['dishes']
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    let jsonStr = response.text.trim();
    // Cleanup potential markdown
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(jsonStr) as MenuAnalysisResult;
    return data;

  } catch (error) {
    console.error("Error analyzing menu:", error);
    console.error("API Key present:", !!apiKey);
    console.error("API Key length:", apiKey?.length);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
};

/**
 * Uses Google Maps Grounding to find real-world details about the restaurant.
 */
export const getRestaurantDetails = async (name: string, location?: string): Promise<RestaurantDetails> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const query = location ? `${name} in ${location}` : name;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{
          text: `Find the restaurant "${query}" on Google Maps. 
                         Provide a short detective report summary (max 3 sentences) about its reputation, cuisine style, and star rating. 
                         Do NOT use markdown.` }]
      },
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text || "No details found.";

    // Extract grounding metadata if available
    let mapLink = '';
    let sourceUrl = '';

    // Check grounding chunks for the map link
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      // Look for the first map link
      const mapChunk = chunks.find(c => c.web?.uri?.includes('maps.google') || c.web?.uri?.includes('google.com/maps'));
      if (mapChunk && mapChunk.web) {
        mapLink = mapChunk.web.uri || '';
      }
    }

    // Simple regex to extract rating if mentioned in text (e.g. "4.5 stars")
    const ratingMatch = text.match(/(\d+(\.\d)?)\s*stars?/i);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

    return {
      summary: text,
      rating,
      mapLink,
      sourceUrl
    };

  } catch (error) {
    console.error("Error finding restaurant:", error);
    return { summary: "Could not retrieve restaurant details." };
  }
};

/**
 * Analyzes a photo of food or a menu with pictures to provide nutritional information.
 */
export const analyzeNutritionImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<Omit<NutritionItem, 'id'>[]> => {
  try {
    const modelId = 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Analyze this image. It contains either a photo of food or a menu item with a picture.
                   Identify the distinct food items visible.
                   For each item, return a JSON object with:
                   1. 'name': Name of the dish.
                   2. 'type': The cuisine type (e.g., "Italian", "Fast Food", "Dessert").
                   3. 'calories': Estimated calories per serving (e.g., "450 kcal").
                   4. 'safety': Food safety assessment regarding allergens or dietary warnings (e.g., "Contains Nuts", "Raw Fish", "Generally Safe").
                   5. 'vitamins': A list of key vitamins present (e.g., ["Vitamin A", "Vitamin C"]).
                   6. 'macronutrients': A concise string summary of macros (e.g., "High Protein, Low Carb").
                   7. 'description': A short description of what is analyzed.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              calories: { type: Type.STRING },
              safety: { type: Type.STRING },
              vitamins: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              macronutrients: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['name', 'type', 'calories', 'safety', 'vitamins', 'macronutrients', 'description']
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(jsonStr);
    return data;
  } catch (error) {
    console.error("Error analyzing nutrition:", error);
    throw error;
  }
};

/**
 * Generates an image of a specific dish using Pollinations.ai (free, no API key needed).
 * Implements Caching to reuse images for the same dish name.
 */
export const generateDishImage = async (dishName: string, dishDescription: string): Promise<string> => {
  const cacheKey = getCacheKey(dishName);

  // 1. Check In-Memory Cache (Fastest)
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Check LocalStorage Cache (Persistent)
  try {
    const stored = localStorage.getItem(cacheKey);
    if (stored) {
      memoryCache.set(cacheKey, stored); // Sync to memory
      return stored;
    }
  } catch (e) {
    console.warn("Failed to access localStorage", e);
  }

  // 3. Generate Image via Pollinations.ai (Cache Miss)
  try {
    const prompt = `professional food photography of ${dishName}, ${dishDescription}, high resolution, restaurant style, appetizing, detailed`;
    const encodedPrompt = encodeURIComponent(prompt);

    // Use Pollinations.ai image generation API (free, no auth required)
    // Using 'turbo' model for faster generation and 768x768 for speed
    const seed = Math.abs(dishName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&model=turbo&seed=${seed}&nologo=true&enhance=true`;

    // 4. Save to Caches
    memoryCache.set(cacheKey, imageUrl);

    try {
      localStorage.setItem(cacheKey, imageUrl);
    } catch (e) {
      // Handle Quota Exceeded by clearing old MenuViz cache items
      console.warn("LocalStorage quota exceeded. Clearing old cache...");
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('menuviz_cache_')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem(cacheKey, imageUrl);
      } catch (retryErr) {
        console.warn("Could not save to localStorage even after cleanup. Using memory cache only.");
      }
    }

    return imageUrl;

  } catch (error) {
    console.error("Error generating dish image:", error);
    throw error;
  }
};

/**
 * Generates a recipe for a specific dish.
 */
export const generateRecipe = async (dishName: string, description: string): Promise<Recipe> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            text: `Create a detailed home cooking recipe for "${dishName}". 
                   Context: ${description}.
                   Return a JSON object with:
                   1. 'ingredients': Array of strings (quantities and items).
                   2. 'instructions': Array of strings (step by step).
                   3. 'prepTime': string (e.g. "15 mins").
                   4. 'cookTime': string (e.g. "20 mins").
                   5. 'shoppingList': Array of strings (concise items for grocery list).
                   6. 'difficulty': "Easy", "Medium", or "Hard".`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
          },
          required: ['ingredients', 'instructions', 'prepTime', 'cookTime', 'shoppingList', 'difficulty']
        }
      }
    });

    if (!response.text) throw new Error("No recipe generated");

    return JSON.parse(response.text) as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

/**
 * Initializes a chat session with Gemini using the menu data as context.
 */
export const createMenuChat = (dishes: Dish[]): Chat => {
  const dishContext = dishes.map(d =>
    `- ${d.name} (${d.originalName || d.name}): ${d.price || 'N/A'}. ${d.description}. Tags: ${d.tags.join(', ')}. Pairing: ${d.pairing || 'None'}. Calories: ${d.nutrition?.calories || 'Unknown'}.`
  ).join('\n');

  const systemInstruction = `You are a knowledgeable Restaurant Concierge helping customers understand the menu.
  
  LANGUAGE RULES - CRITICAL:
  1. ALWAYS respond in the SAME LANGUAGE as the user's message
  2. If the user writes in French, respond in French
  3. If the user writes in English, respond in English
  4. If the user writes in Spanish, respond in Spanish
  5. If the user switches languages mid-conversation, IMMEDIATELY switch to that new language
  6. Detect the language from the user's most recent message and use that language for your response
  7. NEVER respond in a different language than the user's current message
  
  STRICT RULES - YOU MUST FOLLOW THESE:
  1. ONLY answer questions about the dishes listed in the menu below
  2. NEVER suggest or recommend dishes that are NOT in this menu
  3. NEVER say you will "contact the chef" or "ask the kitchen" - you have all the information you need
  4. If asked about something not on the menu, politely say "That item is not available on this menu. I can only help you with the dishes listed here." (in the user's language)
  5. If you don't have specific information about a menu item, say "I don't have that specific detail, but here's what I know about this dish..." (in the user's language)
  
  MENU DATA:
${dishContext}

  Your role is to:
  - Answer questions about these specific dishes
  - Recommend from ONLY these dishes based on preferences (spicy, dietary needs, pairings, etc.)
  - Provide information about flavors, ingredients, and pairings for these dishes
  - Help customers choose between dishes on THIS menu
  
  FORMATTING RULES:
  1. Use HTML tags: <p class="mb-2"> for paragraphs, <ul> and <li> for lists
  2. Wrap dish names and pairings in <span class="font-bold text-emerald-400"> to make them bold and green
  3. Keep answers concise, helpful, and enthusiastic
  4. Do NOT use Markdown. Only HTML.
  
  Remember: 
  - You can ONLY discuss the dishes in the menu above. Never invent or suggest dishes not listed.
  - ALWAYS respond in the same language as the user's message.
  - If the user switches languages, you switch too.`;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};
