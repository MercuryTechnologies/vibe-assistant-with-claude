import React, { useMemo, useState } from 'react';
import { SegmentedControl } from './ui/segmented-control';

interface CashFlowData {
  label: string;
  moneyIn: number;
  moneyOut: number;
}

export interface CashFlowChartProps {
  data: CashFlowData[];
  height?: number;
}

type Cadence = 'Days' | 'Months' | 'Quarters';

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ 
  data,
  height = 400,
}) => {
  const [cadence, setCadence] = useState<Cadence>('Days');
  const [showMoneyIn, setShowMoneyIn] = useState(true);
  const [showMoneyOut, setShowMoneyOut] = useState(true);
  const [showDelta, setShowDelta] = useState(true);

  // Calculate max value for scaling
  const { maxValue, minValue } = useMemo(() => {
    const allMoneyIn = data.map(d => d.moneyIn);
    const allMoneyOut = data.map(d => -d.moneyOut); // Negative for display
    const allDeltas = data.map(d => d.moneyIn - d.moneyOut);
    
    const max = Math.max(...allMoneyIn, ...allDeltas.filter(d => d > 0));
    const min = Math.min(...allMoneyOut, ...allDeltas.filter(d => d < 0));
    
    // Round to nice numbers
    const absMax = Math.max(Math.abs(max), Math.abs(min));
    const niceMax = Math.ceil(absMax / 50000) * 50000;
    
    return { maxValue: niceMax, minValue: -niceMax };
  }, [data]);

  // Calculate bar heights as percentages (from center line)
  const getBarHeight = (value: number, _isNegative: boolean) => {
    const range = maxValue - minValue;
    if (range === 0) return 0;
    const percent = (Math.abs(value) / (range / 2)) * 100;
    return Math.min(percent, 100);
  };

  // Calculate delta line points
  const deltaPoints = useMemo(() => {
    if (data.length === 0) return '';
    
    const chartHeight = height - 100; // Account for padding
    const centerY = chartHeight / 2;
    const range = maxValue - minValue;
    
    return data.map((d, i) => {
      const delta = d.moneyIn - d.moneyOut;
      const x = (i / (data.length - 1 || 1)) * 100;
      const y = centerY - (delta / (range / 2)) * (chartHeight / 2);
      return `${x},${y}`;
    }).join(' ');
  }, [data, maxValue, minValue, height]);

  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `$${(absValue / 1000000).toFixed(0)}M`;
    }
    if (absValue >= 1000) {
      return `$${(absValue / 1000).toFixed(0)}K`;
    }
    return `$${absValue.toFixed(0)}`;
  };

  const formatYAxisLabel = (value: number) => {
    if (value === 0) return '$0';
    const formatted = formatCurrency(Math.abs(value));
    return value < 0 ? `-${formatted}` : formatted;
  };

  // Generate Y-axis labels
  const yAxisLabels = useMemo(() => {
    const step = maxValue / 3;
    return [
      maxValue,
      maxValue - step,
      0,
      -(maxValue - step),
      -maxValue,
    ];
  }, [maxValue]);

  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg"
        style={{ 
          height, 
          backgroundColor: 'var(--ds-bg-secondary)',
          border: '1px solid var(--color-border-default)',
        }}
      >
        <div className="text-center">
          <svg
            className="mx-auto mb-3"
            style={{ width: 48, height: 48, color: 'var(--ds-icon-tertiary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-body-lg-demi" style={{ color: 'var(--ds-text-default)' }}>
            No data in the selected range
          </p>
          <p className="text-body-sm mt-1" style={{ color: 'var(--ds-text-tertiary)' }}>
            Try selecting a different time period
          </p>
        </div>
      </div>
    );
  }

  const chartAreaHeight = height - 80;

  return (
    <div 
      className="rounded-lg"
      style={{ 
        height,
        backgroundColor: 'var(--ds-bg-default)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Chart Header with Legend and Controls */}
      <div 
        className="flex items-center justify-between p-4 pb-2"
        style={{ borderBottom: '1px solid var(--color-border-default)' }}
      >
        {/* Legend */}
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-2 text-label"
            style={{ 
              color: showMoneyIn ? 'var(--ds-text-default)' : 'var(--ds-text-tertiary)',
              opacity: showMoneyIn ? 1 : 0.5,
            }}
            onClick={() => setShowMoneyIn(!showMoneyIn)}
          >
            <span 
              className="rounded"
              style={{ 
                width: 12, 
                height: 12, 
                backgroundColor: 'var(--purple-magic-300)',
              }} 
            />
            Money In
          </button>
          <button 
            className="flex items-center gap-2 text-label"
            style={{ 
              color: showMoneyOut ? 'var(--ds-text-default)' : 'var(--ds-text-tertiary)',
              opacity: showMoneyOut ? 1 : 0.5,
            }}
            onClick={() => setShowMoneyOut(!showMoneyOut)}
          >
            <span 
              className="rounded"
              style={{ 
                width: 12, 
                height: 12, 
                backgroundColor: 'var(--neutral-base-700)',
              }} 
            />
            Money Out
          </button>
          <button 
            className="flex items-center gap-2 text-label"
            style={{ 
              color: showDelta ? 'var(--ds-text-default)' : 'var(--ds-text-tertiary)',
              opacity: showDelta ? 1 : 0.5,
            }}
            onClick={() => setShowDelta(!showDelta)}
          >
            <span 
              style={{ 
                width: 12, 
                height: 2, 
                backgroundColor: 'var(--purple-magic-500)',
              }} 
            />
            Delta
          </button>
        </div>
        
        {/* Cadence Dropdown */}
        <div className="flex items-center gap-2">
          <SegmentedControl
            options={['Days', 'Months', 'Quarters'] as Cadence[]}
            value={cadence}
            onChange={setCadence}
            size="sm"
          />
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="flex p-4">
        {/* Y-Axis */}
        <div 
          className="flex flex-col justify-between pr-3"
          style={{ height: chartAreaHeight, width: 60 }}
        >
          {yAxisLabels.map((value, i) => (
            <span 
              key={i} 
              className="text-tiny tabular-nums text-right"
              style={{ color: 'var(--ds-text-tertiary)' }}
            >
              {formatYAxisLabel(value)}
            </span>
          ))}
        </div>
        
        {/* Chart */}
        <div className="flex-1 relative" style={{ height: chartAreaHeight }}>
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {yAxisLabels.map((_, i) => (
              <div 
                key={i}
                style={{ 
                  height: 1, 
                  backgroundColor: 'var(--color-border-default)',
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
          
          {/* Center line (zero) */}
          <div 
            className="absolute left-0 right-0"
            style={{ 
              top: '50%',
              height: 1, 
              backgroundColor: 'var(--color-border-emphasized)',
            }}
          />
          
          {/* Bars */}
          <div className="absolute inset-0 flex items-center justify-between gap-1 px-1">
            {data.map((item, index) => {
              const moneyInHeight = getBarHeight(item.moneyIn, false);
              const moneyOutHeight = getBarHeight(item.moneyOut, true);
              
              return (
                <div 
                  key={index}
                  className="flex-1 flex flex-col items-center relative"
                  style={{ height: '100%' }}
                >
                  {/* Money In Bar (above center) */}
                  {showMoneyIn && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 cashflow-bar cashflow-bar-in"
                      style={{ 
                        bottom: '50%',
                        height: `${moneyInHeight / 2}%`,
                        width: 'calc(100% - 4px)',
                        maxWidth: 32,
                      }}
                      title={`Money In: ${formatCurrency(item.moneyIn)}`}
                    />
                  )}
                  {/* Money Out Bar (below center) */}
                  {showMoneyOut && (
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 cashflow-bar cashflow-bar-out"
                      style={{ 
                        top: '50%',
                        height: `${moneyOutHeight / 2}%`,
                        width: 'calc(100% - 4px)',
                        maxWidth: 32,
                      }}
                      title={`Money Out: ${formatCurrency(item.moneyOut)}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Delta Line */}
          {showDelta && data.length > 1 && (
            <svg 
              className="absolute inset-0 pointer-events-none"
              viewBox={`0 0 100 ${chartAreaHeight}`}
              preserveAspectRatio="none"
            >
              <polyline
                points={deltaPoints}
                fill="none"
                stroke="var(--purple-magic-500)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {/* Delta points */}
              {data.map((d, i) => {
                const delta = d.moneyIn - d.moneyOut;
                const x = (i / (data.length - 1 || 1)) * 100;
                const range = maxValue - minValue;
                const y = chartAreaHeight / 2 - (delta / (range / 2)) * (chartAreaHeight / 2);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="white"
                    stroke="var(--purple-magic-500)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>
      
      {/* X-Axis Labels */}
      <div 
        className="flex justify-between px-4 pb-4"
        style={{ marginLeft: 60 }}
      >
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex-1 text-center text-tiny"
            style={{ color: 'var(--ds-text-tertiary)' }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CashFlowChart;
