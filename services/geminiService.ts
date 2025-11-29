import { GoogleGenAI } from "@google/genai";
import { AI_PROMPTS } from "../constants";
import { AIPromptType } from "../types";

// Initialize Gemini Client
// IMPORTANT: The API key must be obtained from process.env.API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNoteContent = async (
  noteContent: string,
  promptType: AIPromptType
): Promise<string> => {
  try {
    const promptIntro = AI_PROMPTS[promptType];
    const fullPrompt = `${promptIntro}\n\n"${noteContent}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return response.text || "No content generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI content. Please check your network or try again.");
  }
};
