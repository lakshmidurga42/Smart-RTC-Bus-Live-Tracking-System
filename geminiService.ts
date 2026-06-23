import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface BusQueryResponse {
  answer: string;
  busId?: string;
  eta?: string;
  crowdLevel?: 'Low' | 'Medium' | 'High';
}

export async function processVoiceQuery(query: string, context: any): Promise<BusQueryResponse> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are a Smart RTC Bus Assistant. You help passengers with bus timings, routes, and crowd information.
    Context provided: ${JSON.stringify(context)}
    Current Time: ${new Date().toLocaleTimeString()}
    
    If the user asks in Telugu, reply in Telugu (with English bus numbers/names for clarity).
    If the user asks in English, reply in English.
    
    Be concise and helpful.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: query,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING, description: "The spoken/text answer to the user" },
          busId: { type: Type.STRING, description: "The ID of the bus being discussed, if any" },
          eta: { type: Type.STRING, description: "Estimated time of arrival if applicable" },
          crowdLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
        },
        required: ["answer"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return { answer: "I'm sorry, I couldn't process that request right now." };
  }
}
