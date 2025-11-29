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
  SUMMARY = 'Summary',
  ACTION_ITEMS = 'Action Items',
  POLISH = 'Polish & Rewrite',
  EXPAND = 'Expand Thoughts',
}

export interface SiliconFlowResponse {
  text: string;
}
