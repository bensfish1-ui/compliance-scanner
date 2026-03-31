import { create } from "zustand";
import type { AIMessage, AIContext } from "@/types";

interface AIState {
  messages: AIMessage[];
  isLoading: boolean;
  context: AIContext | null;
  conversationId: string | null;
  totalTokensUsed: number;
  addMessage: (message: AIMessage) => void;
  setLoading: (loading: boolean) => void;
  setContext: (context: AIContext | null) => void;
  setConversationId: (id: string | null) => void;
  addTokens: (count: number) => void;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your Compliance AI Copilot. I can help you with regulatory analysis, risk assessments, policy drafting, audit preparation, and more. How can I assist you today?",
      timestamp: new Date().toISOString(),
    },
  ],
  isLoading: false,
  context: null,
  conversationId: null,
  totalTokensUsed: 0,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (isLoading) => set({ isLoading }),
  setContext: (context) => set({ context }),
  setConversationId: (conversationId) => set({ conversationId }),
  addTokens: (count) =>
    set((state) => ({ totalTokensUsed: state.totalTokensUsed + count })),
  clearMessages: () =>
    set({
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Conversation cleared. How can I help you with compliance today?",
          timestamp: new Date().toISOString(),
        },
      ],
      conversationId: null,
    }),
}));
