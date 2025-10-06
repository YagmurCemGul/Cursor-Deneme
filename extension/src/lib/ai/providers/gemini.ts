// Google Gemini provider implementation
import type { AIMessage, AIResponse } from "./openai";

export class GeminiProvider {
  constructor(
    private apiKey: string,
    private model: string = "gemini-pro",
    private temperature: number = 0.7
  ) {}

  private convertMessages(messages: AIMessage[]): { role: string; parts: { text: string }[] }[] {
    return messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
  }

  async chat(
    messages: AIMessage[],
    options?: { signal?: AbortSignal }
  ): Promise<AIResponse> {
    const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
    const convertedMessages = this.convertMessages(messages);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: convertedMessages,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: 8192,
        },
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate) {
      throw new Error("No response from Gemini");
    }

    return {
      content: candidate.content.parts[0].text,
      finishReason: candidate.finishReason || "STOP",
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  async *chatStream(
    messages: AIMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const systemPrompt = messages.find((m) => m.role === "system")?.content || "";
    const convertedMessages = this.convertMessages(messages);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: convertedMessages,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: 8192,
        },
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      try {
        const parsed = JSON.parse(chunk);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch (e) {
        console.warn("Failed to parse Gemini stream chunk:", e);
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.chat([{ role: "user", content: "Hi" }]);
      return true;
    } catch (error) {
      console.error("Gemini connection test failed:", error);
      return false;
    }
  }
}
