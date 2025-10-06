/**
 * OpenAI API Client for streaming and non-streaming chat completions
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChatArgs {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  signal?: AbortSignal;
}

export interface NonStreamChatArgs extends StreamChatArgs {
  // Same interface for consistency
}

/**
 * Streaming chat completion generator
 * Yields JSON strings containing delta content
 */
export async function* streamChat(args: StreamChatArgs): AsyncGenerator<string, void, unknown> {
  const { apiKey, model, messages, temperature = 0.7, max_tokens = 2000, signal } = args;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip malformed JSON
            console.warn('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Non-streaming chat completion
 * Returns the complete response
 */
export async function nonStreamChat(args: NonStreamChatArgs): Promise<string> {
  const { apiKey, model, messages, temperature = 0.7, max_tokens = 2000, signal } = args;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
