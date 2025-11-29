import { AIPromptType } from './types';

export const AI_PROMPTS: Record<AIPromptType, string> = {
  [AIPromptType.SUMMARY]: "请用中文简洁地总结以下文本，突出主要要点：",
  [AIPromptType.ACTION_ITEMS]: "请用中文从以下文本中提取可执行的任务或待办事项列表：",
  [AIPromptType.POLISH]: "请用中文重写以下文本，使其更加专业、清晰且语法正确：",
  [AIPromptType.EXPAND]: "请用中文扩展以下文本中的想法，提供更多上下文和潜在细节：",
};

export const SILICON_FLOW_API_URL = "https://api.siliconflow.cn/v1/audio/transcriptions";
export const SILICON_FLOW_MODEL = "TeleAI/TeleSpeechASR";
export const SILICON_FLOW_CHAT_API_URL = "https://api.siliconflow.cn/v1/chat/completions";
export const SILICON_FLOW_CHAT_MODEL = "deepseek-ai/DeepSeek-V3";
