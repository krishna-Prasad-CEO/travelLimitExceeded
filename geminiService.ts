
import { GoogleGenAI, Type } from "@google/genai";
import { TripPlan, PhotoAnalysis, TripAlternative } from "./types";

const SYSTEM_INSTRUCTION = `You are a friendly and helpful travel guide. 
Your goal is to create simple, easy-to-understand travel plans. 
Use everyday English. Talk like a friend helping another friend.
Never use complex words like "synthesize", "trajectory", "optimized", "constraints", or "curated".
Keep every sentence short (under 15 words). 
Focus on being helpful, clear, and kind. 
Never return images or image queries.`;

/**
 * Robust retry mechanism with exponential backoff for handling 5xx errors and transient Rpc/XHR failures.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRetryable = 
        error.status === 500 || 
        error.status === 503 || 
        error.status === 504 ||
        error.message?.includes('xhr error') ||
        error.message?.includes('Rpc failed');

      if (i < maxRetries && isRetryable) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`API call failed (Attempt ${i + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }
  throw lastError;
}

export const analyzePhotoForTrip = async (base64Data: string): Promise<PhotoAnalysis> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    };
    const textPart = {
      text: "Identify this location and describe its travel vibe and best visiting season. Be brief and friendly.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            location: { type: Type.STRING },
            country: { type: Type.STRING },
            bestSeason: { type: Type.STRING },
            vibe: { type: Type.STRING },
          },
          required: ["location", "country", "bestSeason", "vibe"],
        },
      },
    });

    if (!response.text) throw new Error("Could not analyze the photo.");
    return JSON.parse(response.text);
  });
};

export const generateTripPlan = async (
  budget: string,
  days: string,
  startingCity: string,
  intent?: string,
  photoContext?: string
): Promise<TripPlan> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let userPrompt = `I need help planning a trip. 
      Here is what I know so far:
      - User Intent/Prompt: "${intent || 'I want to travel.'}"
      ${startingCity ? `- Starting from: ${startingCity}` : ''}
      ${days ? `- Duration: ${days}` : ''}
      ${budget ? `- Budget: ${budget}` : ''}
      ${photoContext ? `- Inspired by: ${photoContext}` : ''}

      Instructions:
      1. Look at the "User Intent/Prompt" above. Extract the starting city, budget, and number of days if mentioned.
      2. If any piece is missing, make a helpful guess based on the vibe.
      3. Make a friendly day-by-day plan. 
      4. For every activity, transport, and hotel, explain why in one short, friendly sentence.
      Example: "This hotel is close to the beach and fits your budget."
      Example: "This saves time and avoids a long drive."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: userPrompt }] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            budgetRange: { type: Type.STRING },
            vibe: { type: Type.STRING },
            bestSeason: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  logic: { type: Type.STRING, description: "A very short, friendly sentence about why this day is planned this way." },
                  activities: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        reasoning: { type: Type.STRING, description: "One short, simple sentence why we picked this." }
                      },
                      required: ["name", "reasoning"]
                    } 
                  },
                  transport: { 
                    type: Type.OBJECT,
                    properties: {
                      mode: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      reasoning: { type: Type.STRING, description: "One short, simple sentence why this is the best way to move." }
                    },
                    required: ["mode", "duration", "reasoning"]
                  },
                  hotel: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      reasoning: { type: Type.STRING, description: "One short, simple sentence why this hotel is good for the user." }
                    },
                    required: ["name", "category", "reasoning"]
                  }
                },
                required: ["day", "title", "logic", "activities", "transport", "hotel"]
              }
            }
          },
          required: ["destination", "duration", "budgetRange", "itinerary", "vibe", "bestSeason"]
        }
      }
    });

    if (!response.text) throw new Error("Could not make the plan.");
    return JSON.parse(response.text);
  });
};

export const getAlternatives = async (
  type: 'hotel' | 'activity' | 'transport',
  currentPlan: TripPlan,
  dayIndex: number
): Promise<TripAlternative[]> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Give me 3 other choices for the ${type} on Day ${dayIndex + 1}. 
    The trip is to ${currentPlan.destination}. 
    Keep descriptions very short and friendly. 
    Instead of "impact", say something like "Saves money" or "Saves time".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["name", "description", "impact", "category"]
          }
        }
      }
    });

    if (!response.text) throw new Error("Could find other choices.");
    return JSON.parse(response.text);
  });
};

export const recalculateItinerary = async (
  currentPlan: TripPlan,
  change: { dayIndex: number; type: 'hotel' | 'activity' | 'transport'; newValue: string }
): Promise<TripPlan> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `The user changed the ${change.type} on Day ${change.dayIndex + 1} to "${change.newValue}". 
    Update the rest of the plan so it still makes sense and feels easy. 
    Keep all text simple and friendly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            budgetRange: { type: Type.STRING },
            vibe: { type: Type.STRING },
            bestSeason: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  logic: { type: Type.STRING },
                  activities: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        reasoning: { type: Type.STRING }
                      },
                      required: ["name", "reasoning"]
                    } 
                  },
                  transport: { 
                    type: Type.OBJECT,
                    properties: {
                      mode: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      reasoning: { type: Type.STRING }
                    },
                    required: ["mode", "duration", "reasoning"]
                  },
                  hotel: { 
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      category: { type: Type.STRING },
                      reasoning: { type: Type.STRING }
                    },
                    required: ["name", "category", "reasoning"]
                  }
                },
                required: ["day", "title", "logic", "activities", "transport", "hotel"]
              }
            }
          },
          required: ["destination", "duration", "budgetRange", "itinerary", "vibe", "bestSeason"]
        }
      }
    });

    if (!response.text) throw new Error("Could not update the plan.");
    return JSON.parse(response.text);
  });
};
