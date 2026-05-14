import { logger } from "../utils/logger.js";

export const getAIResponse = async (prompt: string) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Using a direct fetch call to bypass library issues
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are a helpful assistant. User says: ${prompt}` }] }],
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      logger.error(`Gemini Direct API Error: ${data.error.message}`);
      return "I'm sorry, I'm having trouble thinking. Please check your API key!";
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    logger.error(`AI Service Error: ${error.message}`);
    return "I'm sorry, I'm having trouble connecting to my brain right now.";
  }
};
