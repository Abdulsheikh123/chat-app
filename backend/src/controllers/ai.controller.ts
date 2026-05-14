import { Response } from "express";
import { getAIResponse } from "../services/ai.service.js";
import { logger } from "../utils/logger.js";

export const chatWithAI = async (req: any, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const aiText = await getAIResponse(prompt);
    
    return res.status(200).json({
      success: true,
      data: aiText
    });
  } catch (error: any) {
    logger.error(`AI Controller Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
