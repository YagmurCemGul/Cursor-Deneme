/**
 * Chart Utilities for Analytics Visualization
 * Provides helper functions for rendering charts in the analytics dashboard
 */

export interface PieChartSegment {
  label: string;
  value: number;
  color: string;
}

export interface LineChartPoint {
  x: string | number;
  y: number;
}

/**
 * Generate SVG path for a pie chart segment
 */
export function getPieChartPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    centerX,
    centerY,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ');
}

/**
 * Convert polar coordinates to cartesian
 */
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Generate pie chart segments with angles
 */
export function generatePieChartSegments(data: PieChartSegment[]): Array<
  PieChartSegment & {
    startAngle: number;
    endAngle: number;
    percentage: number;
  }
> {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return data.map((segment) => {
    const percentage = (segment.value / total) * 100;
    const angle = (segment.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...segment,
      startAngle,
      endAngle,
      percentage,
    };
  });
}

/**
 * Calculate moving average for trend lines
 */
export function calculateMovingAverage(data: number[], windowSize: number = 3): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const slice = data.slice(start, end);
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    result.push(avg);
  }
  
  return result;
}

/**
 * Format number for display
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

/**
 * Get color palette for charts
 */
export const CHART_COLORS = {
  primary: '#667eea',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  indigo: '#6366f1',
  orange: '#f97316',
};

/**
 * Get provider color
 */
export function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    openai: CHART_COLORS.success,
    gemini: CHART_COLORS.info,
    claude: CHART_COLORS.purple,
  };
  return colors[provider] || CHART_COLORS.primary;
}

/**
 * Interpolate between two colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1] || '0', 16),
        g: parseInt(result[2] || '0', 16),
        b: parseInt(result[3] || '0', 16),
      }
    : null;
}
