import React from 'react';
import { LineChartPoint, calculateMovingAverage } from '../utils/chartUtils';

interface LineChartProps {
  data: LineChartPoint[];
  width?: number;
  height?: number;
  color?: string;
  showTrend?: boolean;
  xLabel?: string;
  yLabel?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 600,
  height = 200,
  color = '#667eea',
  showTrend = false,
  xLabel = '',
  yLabel = '',
}) => {
  if (data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
        No data available
      </div>
    );
  }

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxY = Math.max(...data.map((d) => d.y), 1);
  const minY = Math.min(...data.map((d) => d.y), 0);
  const yRange = maxY - minY || 1;

  // Generate points for the line
  const points = data
    .map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.y - minY) / yRange) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  // Generate trend line if requested
  let trendPoints = '';
  if (showTrend && data.length > 3) {
    const yValues = data.map((d) => d.y);
    const trendData = calculateMovingAverage(yValues, 5);
    trendPoints = data
      .map((point, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((trendData[index] - minY) / yRange) * chartHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height}>
        {/* Grid lines */}
        <g opacity="0.1">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + chartHeight * (1 - ratio)}
              x2={width - padding}
              y2={padding + chartHeight * (1 - ratio)}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Trend line */}
        {showTrend && trendPoints && (
          <polyline
            points={trendPoints}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.5"
          />
        )}

        {/* Main line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((point.y - minY) / yRange) * chartHeight;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
            >
              <title>
                {point.x}: {point.y.toFixed(2)}
              </title>
            </circle>
          );
        })}

        {/* Y-axis labels */}
        <g fontSize="11" fill="currentColor" opacity="0.6">
          {[0, 0.5, 1].map((ratio) => {
            const value = minY + yRange * ratio;
            return (
              <text
                key={ratio}
                x={padding - 10}
                y={padding + chartHeight * (1 - ratio)}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {value.toFixed(0)}
              </text>
            );
          })}
        </g>

        {/* Axis labels */}
        {yLabel && (
          <text
            x={padding - 30}
            y={padding + chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
            opacity="0.7"
            transform={`rotate(-90, ${padding - 30}, ${padding + chartHeight / 2})`}
          >
            {yLabel}
          </text>
        )}
        {xLabel && (
          <text
            x={padding + chartWidth / 2}
            y={height - 10}
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
            opacity="0.7"
          >
            {xLabel}
          </text>
        )}
      </svg>
    </div>
  );
};
