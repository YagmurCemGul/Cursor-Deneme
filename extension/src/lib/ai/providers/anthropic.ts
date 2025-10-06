// Anthropic Claude provider implementation
import type { AIMessage, AIResponse } from "./openai";

export class AnthropicProvider {
  constructor(
    private apiKey: string,
    private model: string = "claude-3-5-sonnet-20241022",
    private temperature: number = 0.7
  ) {}

  private convertMessages(messages: AIMessage[]): { role: string; content: string }[] {
    return messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));
  }

  async chat(
    messages: AIMessage[],
    options?: { signal?: AbortSignal }
  ): Promise<AIResponse> {
    const systemPrompt = messages.find((m) => m.role === "system")?.content;
    const convertedMessages = this.convertMessages(messages);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        messages: convertedMessages,
        system: systemPrompt,
        temperature: this.temperature,
        max_tokens: 8192,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      finishReason: data.stop_reason,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  async *chatStream(
    messages: AIMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const systemPrompt = messages.find((m) => m.role === "system")?.content;
    const convertedMessages = this.convertMessages(messages);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        messages: convertedMessages,
        system: systemPrompt,
        temperature: this.temperature,
        max_tokens: 8192,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Anthropic API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } catch (e) {
            console.warn("Failed to parse Anthropic SSE chunk:", e);
          }
        }
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.chat([{ role: "user", content: "Hi" }]);
      return true;
    } catch (error) {
      console.error("Anthropic connection test failed:", error);
      return false;
    }
  }
}
