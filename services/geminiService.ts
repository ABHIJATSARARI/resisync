import { GoogleGenAI, Type } from "@google/genai";
import { Trip, ComplianceStatus, RiskLevel, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Model Configurations ---
// 1. Thinking Model for Deep Analysis (Dashboard Shield)
const THINKING_MODEL = 'gemini-3-pro-preview';
// 2. Standard Model with Tools for Chat (Search/Maps) and Fallback
const STANDARD_MODEL = 'gemini-2.5-flash';
// 3. Fast Model for simple parsing
const FAST_MODEL = 'gemini-2.5-flash-lite';

// In-memory cache for destination insights to prevent refetching on hover
const insightsCache: Record<string, string> = {};

// Helper to calculate basic stats client-side to feed the AI
const calculateBasicStats = (trips: Trip[]) => {
  const today = new Date();
  const startWindow = new Date(today);
  startWindow.setDate(today.getDate() - 180);

  let schengenCount = 0;
  const countryCounts: Record<string, number> = {};

  trips.forEach(trip => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    // Simple day counting logic for context
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

    if (trip.isSchengen) {
        // Very rough approximation for the prompt context; real calculation is complex
        schengenCount += diffDays; 
    }
    
    countryCounts[trip.country] = (countryCounts[trip.country] || 0) + diffDays;
  });

  return { schengenCount, countryCounts };
};

/**
 * Uses Gemini 3 Pro with Thinking Mode to analyze complex compliance scenarios.
 * Falls back to Flash if rate limits are hit.
 */
export const analyzeCompliance = async (
  trips: Trip[], 
  profile?: UserProfile | null,
  onRetry?: () => void
): Promise<ComplianceStatus> => {
  const stats = calculateBasicStats(trips);
  
  const profileContext = profile ? `
    User Profile:
    - Nationality (Passport): ${profile.nationality}
    - Current Base: ${profile.currentLocation}
    - Strategic Goals: ${profile.travelGoals.join(', ')}
    
    Please tailor the analysis and recommendation to this profile. Specifically consider visa restrictions for this nationality and tax rules relevant to their current base or nationality (e.g. US citizenship tax vs territorial tax).
  ` : '';

  const prompt = `
    You are ResiSync, an expert immigration and tax compliance AI.
    Analyze the following travel schedule for a digital nomad.
    
    ${profileContext}

    Current Date: ${new Date().toISOString().split('T')[0]}
    Trips: ${JSON.stringify(trips)}
    
    Rules:
    1. Schengen Area: Max 90 days in any rolling 180-day period.
    2. Tax Residency: General warning at 183 days in a single country.
    
    Task:
    Calculate the exact days used in Schengen.
    Identify any tax residency risks (approaching 183 days).
    Determine the Risk Level (SAFE, WARNING, DANGER).
    Provide a concise, strategic recommendation to avoid overstay or tax issues.
    If there is a violation, suggest a "Reset" strategy (e.g. go to non-Schengen country X).
  `;

  // Define schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      schengenDaysUsed: { type: Type.NUMBER },
      schengenDaysRemaining: { type: Type.NUMBER },
      riskLevel: { type: Type.STRING, enum: ['SAFE', 'WARNING', 'DANGER'] },
      taxResidencyRisk: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            country: { type: Type.STRING },
            daysSpent: { type: Type.NUMBER },
            threshold: { type: Type.NUMBER },
            risk: { type: Type.STRING, enum: ['SAFE', 'WARNING', 'DANGER'] }
          }
        }
      },
      recommendation: { type: Type.STRING },
      resetDate: { type: Type.STRING, description: "Date when Schengen allowance resets or improves, if applicable" }
    },
    required: ['schengenDaysUsed', 'schengenDaysRemaining', 'riskLevel', 'recommendation']
  };

  try {
    // Attempt 1: High-Reasoning Thinking Model
    const response = await ai.models.generateContent({
      model: THINKING_MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Reduced budget slightly for speed
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as ComplianceStatus;

  } catch (error: any) {
    console.warn("Primary model failed (likely quota), switching to fallback model...", error);
    if (onRetry) onRetry();

    try {
        // Attempt 2: Standard Flash Model (Faster, Higher Quota, No Thinking Config)
        const response = await ai.models.generateContent({
          model: STANDARD_MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
          }
        });
    
        const text = response.text;
        if (!text) throw new Error("No response from Fallback AI");
        return JSON.parse(text) as ComplianceStatus;

    } catch (fallbackError) {
        console.error("Compliance Analysis Error (Fallback failed):", fallbackError);
        // Final Fallback: Client-side approximation
        return {
          schengenDaysUsed: stats.schengenCount,
          schengenDaysRemaining: Math.max(0, 90 - stats.schengenCount),
          riskLevel: stats.schengenCount > 80 ? RiskLevel.WARNING : RiskLevel.SAFE,
          taxResidencyRisk: [],
          recommendation: "AI Analysis unavailable due to high traffic. Please verify dates manually.",
        };
    }
  }
};

/**
 * Fetch specific country insights for the user profile.
 * Implements caching to support hover interactions without rate limiting.
 */
export const getDestinationInsights = async (country: string, profile: UserProfile): Promise<string> => {
    const cacheKey = `${country.toLowerCase()}-${profile.nationality.toLowerCase()}`;
    if (insightsCache[cacheKey]) {
        return insightsCache[cacheKey];
    }

    const prompt = `
        Provide a very concise executive brief for a digital nomad traveling to ${country}.
        
        User Context:
        - Nationality: ${profile.nationality}
        - Goals: ${profile.travelGoals.join(', ')}

        Include:
        1. Visa Status (Do they need one?)
        2. Tax Warning (Briefly)
        3. Nomad Hotspots & Local Vibe
        4. One "Pro Tip" for logistics (SIM card, sockets, or transport).

        Format as a short, punchy markdown list. No intro/outro.
    `;

    try {
        const response = await ai.models.generateContent({
            model: FAST_MODEL,
            contents: prompt,
        });
        const text = response.text || "No insights available.";
        insightsCache[cacheKey] = text;
        return text;
    } catch (e) {
        return "Unable to fetch insights.";
    }
}

/**
 * Uses Gemini Flash Lite for low-latency text parsing.
 */
export const parseTravelText = async (text: string): Promise<Partial<Trip>> => {
  const prompt = `
    Extract travel details from this text (email, booking, etc).
    Return a JSON object with:
    - country (string)
    - countryCode (2-letter ISO code, e.g. "ES", "FR", "JP")
    - startDate (YYYY-MM-DD)
    - endDate (YYYY-MM-DD)
    - isSchengen (boolean)
    
    If a date is missing, make a best guess based on context or leave null.
    
    Text: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            country: { type: Type.STRING },
            countryCode: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            isSchengen: { type: Type.BOOLEAN }
          }
        }
      }
    });
    
    const resText = response.text;
    return resText ? JSON.parse(resText) : {};
  } catch (error) {
    console.error("Parsing Error:", error);
    return {};
  }
};

/**
 * Uses Gemini Flash with Search and Maps Grounding for up-to-date information.
 */
export const sendChatMessage = async (
  message: string, 
  history: {role: string, parts: {text: string}[]}[], 
  trips: Trip[],
  profile?: UserProfile | null
): Promise<{ text: string, sources?: {title: string, uri: string}[] }> => {
  
  const profileContext = profile ? `
    User Profile:
    - Nationality: ${profile.nationality}
    - Location: ${profile.currentLocation}
    - Goals: ${profile.travelGoals.join(', ')}
  ` : '';

  const systemInstruction = `
    You are ResiSync, a highly knowledgeable AI legal companion for digital nomads.
    You help users navigate complex visa rules (Schengen 90/180, US SPT, UK SRT) and tax residency laws.
    
    Current User Context:
    - Date: ${new Date().toISOString().split('T')[0]}
    - Trips Planned: ${JSON.stringify(trips)}
    ${profileContext}
    
    Guidelines:
    - ALWAYS cross-reference the user's "Trips Planned" AND "User Profile" (Nationality is critical for visa rules).
    - Use Google Search to find the latest visa requirements, income thresholds, and tax treaty details. THIS IS CRITICAL.
    - If explaining a legal rule, YOU MUST VERIFY it with Search to ensure it is current.
    - Use Google Maps if the user asks for locations (embassies, offices).
    - Be concise, professional, but empathetic.
    - Format response in clean Markdown (use **bold** for key terms, bullet points for steps).
    - Warn about risks (e.g., "You are close to 183 days in Spain").
    - Do not give binding legal advice; always suggest consulting a professional.
  `;

  try {
    // 1. Configure the chat with tools
    const chat = ai.chats.create({
      model: STANDARD_MODEL,
      history: history,
      config: {
        systemInstruction: systemInstruction,
        tools: [
            { googleSearch: {} },
            { googleMaps: {} }
        ]
      },
    });

    const result = await chat.sendMessage({ message: message });
    
    // 2. Extract Grounding Metadata (Sources)
    const sources: {title: string, uri: string}[] = [];
    
    // Check for Search Grounding (Web Sources)
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        chunks.forEach((chunk: any) => {
            if (chunk.web) {
                sources.push({ title: chunk.web.title, uri: chunk.web.uri });
            }
        });
    }

    return { 
        text: result.text || "I'm sorry, I couldn't process that.",
        sources: sources.length > 0 ? sources : undefined
    };

  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "I'm having trouble connecting to the compliance database. Please try again." };
  }
};