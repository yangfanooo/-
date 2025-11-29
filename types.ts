export interface Note {
  id: string;
  content: string;
  createdAt: number;
  aiResponse?: string;
  aiPromptType?: string;
}

export interface AppSettings {
  siliconFlowToken: string;
}

export enum AIPromptType {
  SUMMARY = '总结',
  ACTION_ITEMS = '行动项',
  POLISH = '润色重写',
  EXPAND = '扩展想法',
}

export interface SiliconFlowResponse {
  text: string;
}

export interface SiliconFlowChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_content?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

export interface SiliconFlowChatChoice {
  message: SiliconFlowChatMessage;
  finish_reason: string;
}

export interface SiliconFlowChatResponse {
  id: string;
  choices: SiliconFlowChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  created: number;
  model: string;
  object: string;
}
