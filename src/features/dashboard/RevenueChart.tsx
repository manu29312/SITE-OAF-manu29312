'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/formatters';

type RevenuePoint = {
  label: string;
  value: number;
};

type RevenueChartProps = {
  points: RevenuePoint[];
};

const SVG_WIDTH = 740;
const SVG_HEIGHT = 260;
const CHART_WIDTH = 690;
const CHART_HEIGHT = 180;
const X_OFFSET = 25;
const Y_OFFSET = 35;

function buildChartPath(values: number[]): string {
  if (!values.length) {
    return '';
  }

  const maxValue = Math.max(...values, 1);
  const step = values.length > 1 ? CHART_WIDTH / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = index * step;
      const y = CHART_HEIGHT - (value / maxValue) * CHART_HEIGHT;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function RevenueChart({ points }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const values = useMemo(() => points.map((point) => point.value), [points]);
  const maxValue = Math.max(...values, 1);
  const chartPath = useMemo(() => buildChartPath(values), [values]);
  const chartArea = chartPath ? `${chartPath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z` : '';
  const hoveredPoint = hoveredIndex === null ? null : points[hoveredIndex];
  const hoveredValue = hoveredIndex === null ? null : values[hoveredIndex];
  const tooltipIndex = hoveredIndex ?? 0;

  return (
    <>
      <div className="chart-surface chart-surface-interactive" role="img" aria-label="Evolution du chiffre d affaires sur 4 mois">
        {hoveredPoint && hoveredValue !== null ? (
          <div
            className="chart-tooltip"
            style={{
              left: `${Math.min(tooltipIndex * (points.length > 1 ? CHART_WIDTH / (points.length - 1) : 0) + X_OFFSET + 18, 560)}px`,
              top: `${Math.max(Y_OFFSET + (CHART_HEIGHT - (hoveredValue / maxValue) * CHART_HEIGHT) - 54, 16)}px`,
            }}
          >
            <strong>{hoveredPoint.label}</strong>
            <span>{formatCurrency(hoveredValue)}</span>
          </div>
        ) : null}

        <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d6aff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3d6aff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="25" y1="35" x2="715" y2="35" className="grid-line" />
          <line x1="25" y1="95" x2="715" y2="95" className="grid-line" />
          <line x1="25" y1="155" x2="715" y2="155" className="grid-line" />
          <line x1="25" y1="215" x2="715" y2="215" className="grid-line" />

          {chartPath ? <path d={chartPath} className="chart-line" transform={`translate(${X_OFFSET}, ${Y_OFFSET})`} /> : null}
          {chartArea ? <path d={chartArea} className="chart-fill" transform={`translate(${X_OFFSET}, ${Y_OFFSET})`} /> : null}

          {values.map((value, index) => {
            const step = values.length > 1 ? CHART_WIDTH / (values.length - 1) : 0;
            const x = X_OFFSET + index * step;
            const y = Y_OFFSET + (CHART_HEIGHT - (value / maxValue) * CHART_HEIGHT);
            const isActive = hoveredIndex === index;

            return (
              <g
                key={`${points[index].label}-${value}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle cx={x} cy={y} r="16" className="chart-hit-area" />
                <circle cx={x} cy={y} r="5" className={`chart-dot${isActive ? ' is-active' : ''}`} />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="chart-years" aria-hidden="true">
        {points.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </>
  );
}
