import React from 'react';
import { generatePieChartSegments, getPieChartPath, PieChartSegment } from '../utils/chartUtils';

interface PieChartProps {
  data: PieChartSegment[];
  size?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 200,
  showLabels = true,
  showPercentages = true,
}) => {
  const segments = generatePieChartSegments(data);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <svg width={size} height={size} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={getPieChartPath(centerX, centerY, radius, segment.startAngle, segment.endAngle)}
              fill={segment.color}
              stroke="white"
              strokeWidth="2"
              style={{
                transition: 'transform 0.2s ease',
                transformOrigin: `${centerX}px ${centerY}px`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <title>
                {segment.label}: {segment.value} ({segment.percentage.toFixed(1)}%)
              </title>
            </path>
          </g>
        ))}
      </svg>

      {showLabels && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          {segments.map((segment, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: segment.color,
                  borderRadius: '2px',
                }}
              />
              <span>
                {segment.label}
                {showPercentages && (
                  <span style={{ opacity: 0.7, marginLeft: '4px' }}>
                    ({segment.percentage.toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
