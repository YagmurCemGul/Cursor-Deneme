// Azure OpenAI provider implementation
import type { AIMessage, AIResponse } from "./openai";

export class AzureProvider {
  constructor(
    private apiKey: string,
    private endpoint: string,
    private deploymentName: string,
    private temperature: number = 0.7
  ) {}

  async chat(
    messages: AIMessage[],
    options?: { signal?: AbortSignal }
  ): Promise<AIResponse> {
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2024-02-15-preview`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify({
        messages,
        temperature: this.temperature,
        stream: false,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Azure OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      finishReason: data.choices[0].finish_reason,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  async *chatStream(
    messages: AIMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const url = `${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2024-02-15-preview`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      },
      body: JSON.stringify({
        messages,
        temperature: this.temperature,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Azure OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`
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
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0]?.delta?.content;
            if (delta) yield delta;
          } catch (e) {
            console.warn("Failed to parse Azure SSE chunk:", e);
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
      console.error("Azure connection test failed:", error);
      return false;
    }
  }
}
