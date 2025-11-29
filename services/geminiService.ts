import { AI_PROMPTS, SILICON_FLOW_CHAT_API_URL, SILICON_FLOW_CHAT_MODEL } from "../constants";
import { AIPromptType } from "../types";

export const generateNoteContent = async (
  noteContent: string,
  promptType: AIPromptType,
  token: string
): Promise<string> => {
  if (!token) {
    throw new Error("SiliconFlow API Token is missing. Please configure it in Settings.");
  }

  try {
    const promptIntro = AI_PROMPTS[promptType];
    const fullPrompt = `${promptIntro}\n\n"${noteContent}"`;

    const response = await fetch(SILICON_FLOW_CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: SILICON_FLOW_CHAT_MODEL,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 处理 403 错误（余额不足或需要付费）
      if (response.status === 403) {
        const errorMessage = errorData.message || "API 请求被拒绝";
        if (errorMessage.includes("paid balance") || errorMessage.includes("余额") || errorMessage.includes("insufficient")) {
          throw new Error("账户余额不足或所选模型需要付费。请充值后重试，或使用免费模型。");
        }
        throw new Error(`API 访问被拒绝: ${errorMessage}`);
      }
      
      throw new Error(`AI generation failed: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated from AI response.");
    }

    return content;
  } catch (error: any) {
    console.error("SiliconFlow Chat API Error:", error);
    
    if (error.message?.includes("Token")) {
      throw new Error("SiliconFlow API Token 未配置。请在设置中配置 API Token。");
    }
    
    if (error.message?.includes("余额") || error.message?.includes("paid balance") || error.message?.includes("insufficient")) {
      throw error; // 直接抛出余额相关的错误，保持原始错误信息
    }
    
    if (error.message?.includes("network") || error.message?.includes("fetch")) {
      throw new Error("网络连接失败，请检查网络连接后重试。");
    }
    
    throw new Error(error.message || "生成 AI 内容失败，请稍后重试。");
  }
};
