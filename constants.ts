import { AIPromptType } from './types';

export const AI_PROMPTS: Record<AIPromptType, string> = {
  [AIPromptType.SUMMARY]: "Summarize the following text concisely, highlighting the main points:",
  [AIPromptType.ACTION_ITEMS]: "Extract a list of actionable tasks or to-do items from the following text:",
  [AIPromptType.POLISH]: "Rewrite the following text to be more professional, clear, and grammatically correct:",
  [AIPromptType.EXPAND]: "Expand on the ideas in the following text, providing more context and potential details:",
};

export const SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/audio/transcriptions";
export const SILICON_FLOW_MODEL = "TeleAI/TeleSpeechASR";
