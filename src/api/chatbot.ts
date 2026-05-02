import axiosInstance from "./axiosConfig.js";

export interface ChatResponse {
  reply: string;
  intent: string | null;
  confidence: number;
  sessionId: string;
}

export const chatbotApi = {
  sendMessage: async (message: string, sessionId?: string): Promise<ChatResponse> => {
    const res = await axiosInstance.post<ChatResponse>("/chatbot/message", { message, sessionId });
    return res.data;
  },
};
