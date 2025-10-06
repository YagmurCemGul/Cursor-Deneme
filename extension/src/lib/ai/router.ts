// AI Router with provider selection, fallback, timeout, and retry
import type { AIProvider } from "../storage/schema";
import type { AIMessage, AIResponse } from "./providers/openai";
import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";
import { AnthropicProvider } from "./providers/anthropic";
import { AzureProvider } from "./providers/azure";

interface RouterConfig {
  provider: AIProvider;
  model?: string;
  temperature?: number;
  apiKeys: Record<string, string | undefined>;
  fallbackChain?: AIProvider[];
  timeout?: number;
  maxRetries?: number;
}

class RateLimitQueue {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequest = 0;
  private minInterval = 100; // Min 100ms between requests

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequest;

      if (timeSinceLastRequest < this.minInterval) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.minInterval - timeSinceLastRequest)
        );
      }

      const task = this.queue.shift();
      if (task) {
        this.lastRequest = Date.now();
        await task();
      }
    }

    this.processing = false;
  }
}

export class AIRouter {
  private queue = new RateLimitQueue();

  constructor(private config: RouterConfig) {}

  private createProvider(provider: AIProvider): any {
    const apiKey = this.config.apiKeys[provider];
    if (!apiKey) {
      throw new Error(`No API key configured for ${provider}`);
    }

    const model = this.config.model;
    const temperature = this.config.temperature ?? 0.7;

    switch (provider) {
      case "openai":
        return new OpenAIProvider(apiKey, model || "gpt-4", temperature);
      case "gemini":
        return new GeminiProvider(apiKey, model || "gemini-pro", temperature);
      case "anthropic":
        return new AnthropicProvider(apiKey, model || "claude-3-5-sonnet-20241022", temperature);
      case "azure":
        // Azure requires additional config; extract from API key if formatted as "key|endpoint|deployment"
        const [key, endpoint, deployment] = apiKey.split("|");
        if (!endpoint || !deployment) {
          throw new Error("Azure API key must be formatted as: key|endpoint|deployment");
        }
        return new AzureProvider(key, endpoint, deployment, temperature);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    );
    return Promise.race([promise, timeout]);
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }

  async chat(
    messages: AIMessage[],
    options?: { signal?: AbortSignal }
  ): Promise<AIResponse> {
    const providers = [
      this.config.provider,
      ...(this.config.fallbackChain || []),
    ].filter((p, i, arr) => arr.indexOf(p) === i); // Unique providers

    let lastError: Error | undefined;

    for (const providerName of providers) {
      try {
        const provider = this.createProvider(providerName);
        const timeout = this.config.timeout ?? 30000;
        const maxRetries = this.config.maxRetries ?? 3;

        return await this.queue.enqueue(() =>
          this.retryWithBackoff(
            () => this.withTimeout(provider.chat(messages, options), timeout),
            maxRetries
          )
        );
      } catch (error) {
        console.warn(`Provider ${providerName} failed:`, error);
        lastError = error as Error;
        // Continue to next provider in fallback chain
      }
    }

    throw lastError || new Error("All providers failed");
  }

  async *chatStream(
    messages: AIMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const providers = [
      this.config.provider,
      ...(this.config.fallbackChain || []),
    ].filter((p, i, arr) => arr.indexOf(p) === i);

    let lastError: Error | undefined;

    for (const providerName of providers) {
      try {
        const provider = this.createProvider(providerName);
        
        // Streaming doesn't use queue or retry - direct execution
        for await (const chunk of provider.chatStream(messages, signal)) {
          yield chunk;
        }
        return; // Success, exit
      } catch (error) {
        console.warn(`Provider ${providerName} streaming failed:`, error);
        lastError = error as Error;
      }
    }

    throw lastError || new Error("All providers failed");
  }

  async testConnection(provider?: AIProvider): Promise<boolean> {
    try {
      const providerName = provider || this.config.provider;
      const providerInstance = this.createProvider(providerName);
      return await providerInstance.testConnection();
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }
}
