/**
 * Messaging utilities for content script <-> background communication
 */

export type MessageType =
  | 'CHAT_COMPLETION'
  | 'ENCRYPT_DATA'
  | 'DECRYPT_DATA'
  | 'GET_SETTINGS'
  | 'START_AUTOFILL'
  | 'CALCULATE_SCORE'
  | 'SUGGEST_ANSWER'
  | 'GENERATE_COVER_LETTER'
  | 'TRACK_CURRENT_JOB'
  | 'EXTRACT_JD';

export interface Message {
  type: MessageType;
  [key: string]: any;
}

/**
 * Send message to background script
 */
export function sendMessage<T = any>(message: Message): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (response?.error) {
        reject(new Error(response.error));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Stream chat completion using port
 */
export function streamChatCompletion(
  apiKey: string,
  model: string,
  messages: any[],
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): () => void {
  const port = chrome.runtime.connect({ name: 'chat-stream' });

  port.onMessage.addListener((msg) => {
    if (msg.type === 'CHUNK') {
      onChunk(msg.content);
    } else if (msg.type === 'DONE') {
      onDone();
      port.disconnect();
    } else if (msg.type === 'ERROR') {
      onError(msg.error);
      port.disconnect();
    }
  });

  port.postMessage({
    type: 'START_STREAM',
    apiKey,
    model,
    messages,
  });

  // Return cancel function
  return () => port.disconnect();
}

/**
 * Send message to specific tab
 */
export function sendMessageToTab(tabId: number, message: Message): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Send message to active tab
 */
export async function sendMessageToActiveTab(message: Message): Promise<any> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab');
  return sendMessageToTab(tab.id, message);
}
