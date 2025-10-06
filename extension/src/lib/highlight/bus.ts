// Event bus for optimization highlight feature
import type { OptimizationHighlight } from "../storage/schema";

type HighlightListener = (highlight: OptimizationHighlight) => void;

class HighlightBus {
  private listeners: HighlightListener[] = [];

  subscribe(listener: HighlightListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  publish(highlight: OptimizationHighlight): void {
    this.listeners.forEach((listener) => listener(highlight));
  }
}

export const highlightBus = new HighlightBus();
