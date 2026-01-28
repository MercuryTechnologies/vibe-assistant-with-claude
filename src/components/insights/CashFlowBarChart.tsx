import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import GradientCard from './GradientCard';
import GradientCardMoneyIn from './GradientCardMoneyIn';
import CadenceDropdown from './CadenceDropdown';
import ChartOptionsDropdown from './ChartOptionsDropdown';
import { createRoot } from 'react-dom/client';
import type { Cadence } from '@/lib/insights-utils';

interface CashFlowData {
  month: string;
  moneyIn: number;
  moneyOut: number;
}

export interface GradientSettings {
  baseColor: string;
  topGlowColor: string;
  bottomGlowColor: string;
  topGlowOpacity: number;
  bottomGlowOpacity: number;
  topBlurIntensity: number;
  bottomBlurIntensity: number;
  topGlowSize: number;
  bottomGlowSize: number;
  topGlowOffset: number;
  bottomGlowOffset: number;
}

export interface GradientSettingsMoneyIn {
  topGradientColor: string;
  bottomGradientColor: string;
  topGlowColor: string;
  bottomGlowColor: string;
  topGlowOpacity: number;
  bottomGlowOpacity: number;
  topBlurIntensity: number;
  bottomBlurIntensity: number;
  topGlowSize: number;
  bottomGlowSize: number;
  topGlowOffset: number;
  bottomGlowOffset: number;
}

interface ChartOptions {
  showCashflowLine: boolean;
  showBars: boolean;
}

interface CashFlowBarChartProps {
  data?: CashFlowData[];
  width?: number;
  height?: number;
  cadence?: Cadence;
  onCadenceChange?: (cadence: Cadence) => void;
  selectionStart?: Date;
  selectionEnd?: Date;
  gradientSettingsMoneyOut?: GradientSettings;
  gradientSettingsMoneyIn?: GradientSettingsMoneyIn;
  categoryLabel?: string;
  chartOptions?: ChartOptions;
  onChartOptionsChange?: (options: Partial<ChartOptions>) => void;
}

interface TooltipData {
  x: number;
  y: number;
  category: string;
  moneyIn: number;
  moneyOut: number;
}

const defaultData: CashFlowData[] = [
  { month: 'Jan', moneyIn: 10500, moneyOut: -5000 },
  { month: 'Feb', moneyIn: 8000, moneyOut: -9500 },
  { month: 'Mar', moneyIn: 8000, moneyOut: -5500 },
  { month: 'Apr', moneyIn: 7000, moneyOut: -8500 },
  { month: 'May', moneyIn: 10000, moneyOut: -11000 },
  { month: 'Jun', moneyIn: 7000, moneyOut: -7000 },
  { month: 'Jul', moneyIn: 10500, moneyOut: -5500 },
  { month: 'Aug', moneyIn: 9500, moneyOut: -6000 },
  { month: 'Sep', moneyIn: 9000, moneyOut: -10000 },
];

const defaultChartOptions: ChartOptions = {
  showCashflowLine: true,
  showBars: true,
};

const CashFlowBarChart: React.FC<CashFlowBarChartProps> = ({ 
  data = defaultData, 
  width, 
  height = 480,
  cadence = 'monthly',
  onCadenceChange,
  selectionStart,
  selectionEnd,
  gradientSettingsMoneyOut,
  gradientSettingsMoneyIn,
  categoryLabel = 'Month',
  chartOptions = defaultChartOptions,
  onChartOptionsChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const deltaLineSvgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientContainerMoneyOutRef = useRef<HTMLDivElement>(null);
  const gradientContainerMoneyInRef = useRef<HTMLDivElement>(null);
  const gradientRootsRef = useRef<Array<ReturnType<typeof createRoot>>>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setDimensions({ width: width || containerWidth, height });
    }
  }, [width, height]);

  useEffect(() => {
    updateDimensions();
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateDimensions, 150);
    };
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [updateDimensions]);

  useEffect(() => {
    return () => {
      gradientRootsRef.current.forEach((root) => {
        try { root.unmount(); } catch (e) { /* ignore */ }
      });
    };
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    const gradientOutElement = gradientContainerMoneyOutRef.current;
    const gradientInElement = gradientContainerMoneyInRef.current;
    
    if (!svgElement || !data.length) return;

    const safeRemoveChildren = (element: Element | null) => {
      if (!element) return;
      try {
        while (element.firstChild) element.removeChild(element.firstChild);
      } catch (e) { /* ignore */ }
    };

    safeRemoveChildren(svgElement);

    const margin = { top: 20, right: 40, bottom: 50, left: 80 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgElement)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, chartWidth])
      .padding(0.3);

    const maxValue = d3.max(data, d => Math.max(Math.abs(d.moneyIn), Math.abs(d.moneyOut))) || 15000;
    const scaledMaxValue = maxValue * 1.3;
    const yScale = d3.scaleLinear()
      .domain([-scaledMaxValue, scaledMaxValue])
      .range([chartHeight, 0]);

    const tickCount = 6;
    const customTicks = d3.ticks(-scaledMaxValue, scaledMaxValue, tickCount);
    const zeroLineY = yScale(0);
    const tickPositions = customTicks.map(tick => yScale(tick));

    const dotSpacing = 20;
    const dotRadius = 1;
    
    for (let x = 0; x <= chartWidth; x += dotSpacing) {
      for (let y = 0; y <= chartHeight; y += dotSpacing) {
        const isYAxisRow = tickPositions.some(tickY => Math.abs(y - tickY) < dotSpacing / 2);
        const isZeroLine = Math.abs(y - zeroLineY) < dotSpacing / 2;
        
        chart.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', dotRadius)
          .style('fill', isYAxisRow ? 'var(--ds-text-tertiary)' : 'var(--color-border-default)')
          .style('opacity', isZeroLine ? 0 : (isYAxisRow ? 0.8 : 0.4));
      }
    }

    const yAxisLabels = d3.axisLeft(yScale)
      .tickFormat(d => {
        const val = d as number;
        const absVal = Math.abs(val);
        const formattedVal = absVal >= 1000 ? `$${absVal / 1000}K` : `$${absVal}`;
        return val < 0 ? `-${formattedVal}` : formattedVal;
      })
      .tickValues(customTicks);

    chart.append('g')
      .attr('class', 'y-axis')
      .call(yAxisLabels)
      .selectAll('text')
      .style('font-family', 'var(--font-sans)')
      .style('font-size', '12px')
      .style('fill', 'var(--ds-text-tertiary)')
      .style('text-anchor', 'start')
      .attr('x', -75);

    chart.select('.y-axis .domain').remove();
    chart.selectAll('.y-axis .tick line').remove();

    const xAxis = d3.axisBottom(xScale).tickSize(0);

    chart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight + 24})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-family', 'var(--font-sans)')
      .style('font-size', '12px')
      .style('fill', 'var(--ds-text-tertiary)');

    chart.select('.x-axis .domain').remove();

    data.forEach(d => {
      const x = xScale(d.month)!;
      const barWidth = xScale.bandwidth();
      
      const moneyInAbs = Math.abs(d.moneyIn);
      const moneyOutAbs = Math.abs(d.moneyOut);
      const moneyInIsLarger = moneyInAbs >= moneyOutAbs;
      
      if (d.moneyIn > 0) {
        const pathData = `
          M ${x} ${yScale(0)}
          L ${x} ${yScale(d.moneyIn) + 6}
          Q ${x} ${yScale(d.moneyIn)} ${x + 6} ${yScale(d.moneyIn)}
          L ${x + barWidth - 6} ${yScale(d.moneyIn)}
          Q ${x + barWidth} ${yScale(d.moneyIn)} ${x + barWidth} ${yScale(d.moneyIn) + 6}
          L ${x + barWidth} ${yScale(0)}
          Z
        `;
        
        if (!gradientSettingsMoneyIn) {
          chart.append('path')
            .attr('class', 'bar-money-in')
            .attr('data-month', d.month)
            .attr('d', pathData)
            .style('fill', moneyInIsLarger ? '#b6a8ff' : '#d1d5db')
            .style('opacity', 1)
            .style('transition', 'opacity 0.2s ease');
        }
      }

      if (d.moneyOut < 0) {
        const pathData = `
          M ${x} ${yScale(0)}
          L ${x} ${yScale(d.moneyOut) - 6}
          Q ${x} ${yScale(d.moneyOut)} ${x + 6} ${yScale(d.moneyOut)}
          L ${x + barWidth - 6} ${yScale(d.moneyOut)}
          Q ${x + barWidth} ${yScale(d.moneyOut)} ${x + barWidth} ${yScale(d.moneyOut) - 6}
          L ${x + barWidth} ${yScale(0)}
          Z
        `;
        
        if (!gradientSettingsMoneyOut) {
          chart.append('path')
            .attr('class', 'bar-money-out')
            .attr('data-month', d.month)
            .attr('d', pathData)
            .style('fill', !moneyInIsLarger ? '#1e1b4b' : '#d1d5db')
            .style('opacity', 1)
            .style('transition', 'opacity 0.2s ease');
        }
      }
    });

    data.forEach(d => {
      const x = xScale(d.month)!;
      const barWidth = xScale.bandwidth();
      const topY = d.moneyIn > 0 ? yScale(d.moneyIn) : yScale(0);
      const bottomY = d.moneyOut < 0 ? yScale(d.moneyOut) : yScale(0);
      const fullHeight = bottomY - topY;
      
      chart.append('rect')
        .attr('class', 'hover-rect')
        .attr('x', x)
        .attr('y', topY)
        .attr('width', barWidth)
        .attr('height', fullHeight)
        .style('fill', 'transparent')
        .style('cursor', 'pointer')
        .on('mouseenter', function(event: MouseEvent) {
          const rect = (event.currentTarget as SVGRectElement).getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            setTooltip({
              x: rect.left - containerRect.left + barWidth / 2,
              y: topY + margin.top - 10,
              category: d.month,
              moneyIn: d.moneyIn,
              moneyOut: d.moneyOut
            });
          }
          setHoveredMonth(d.month);
        })
        .on('mouseleave', function() {
          setTooltip(null);
          setHoveredMonth(null);
        });
    });

    chart.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .style('stroke', 'var(--ds-text-default)')
      .style('stroke-width', 1)
      .style('opacity', 0.4);

    gradientRootsRef.current.forEach((root) => {
      try { root.unmount(); } catch (e) { /* ignore */ }
    });
    gradientRootsRef.current = [];

    safeRemoveChildren(gradientOutElement);
    safeRemoveChildren(gradientInElement);

    if (gradientSettingsMoneyOut && gradientOutElement) {
      const gradientContainer = d3.select(gradientOutElement);
      
      data.forEach(d => {
        if (d.moneyOut < 0) {
          const x = xScale(d.month)!;
          const barWidth = xScale.bandwidth();
          const barHeight = Math.abs(yScale(d.moneyOut) - yScale(0));
          const topPosition = margin.top + yScale(0);
          
          const cardContainer = gradientContainer.append('div')
            .attr('data-month', d.month)
            .attr('class', 'gradient-bar-money-out')
            .style('position', 'absolute')
            .style('left', `${margin.left + x}px`)
            .style('top', `${topPosition}px`)
            .style('width', `${barWidth}px`)
            .style('height', `${barHeight}px`)
            .style('overflow', 'hidden')
            .style('border-radius', '0 0 6px 6px')
            .style('transition', 'opacity 0.2s ease')
            .node();
          
          if (cardContainer) {
            const root = createRoot(cardContainer);
            gradientRootsRef.current.push(root);
            root.render(
              <GradientCard
                width={barWidth}
                height={barHeight}
                baseColor={gradientSettingsMoneyOut.baseColor}
                topGlowColor={gradientSettingsMoneyOut.topGlowColor}
                bottomGlowColor={gradientSettingsMoneyOut.bottomGlowColor}
                topGlowOpacity={gradientSettingsMoneyOut.topGlowOpacity}
                bottomGlowOpacity={gradientSettingsMoneyOut.bottomGlowOpacity}
                topBlurIntensity={gradientSettingsMoneyOut.topBlurIntensity}
                bottomBlurIntensity={gradientSettingsMoneyOut.bottomBlurIntensity}
                topGlowSize={gradientSettingsMoneyOut.topGlowSize}
                bottomGlowSize={gradientSettingsMoneyOut.bottomGlowSize}
                topGlowOffset={gradientSettingsMoneyOut.topGlowOffset}
                bottomGlowOffset={gradientSettingsMoneyOut.bottomGlowOffset}
              />
            );
          }
        }
      });
    }

    if (gradientSettingsMoneyIn && gradientInElement) {
      const gradientContainer = d3.select(gradientInElement);
      
      data.forEach(d => {
        if (d.moneyIn > 0) {
          const x = xScale(d.month)!;
          const barWidth = xScale.bandwidth();
          const barHeight = Math.abs(yScale(d.moneyIn) - yScale(0));
          const topPosition = margin.top + yScale(d.moneyIn);
          
          const cardContainer = gradientContainer.append('div')
            .attr('data-month', d.month)
            .attr('class', 'gradient-bar-money-in')
            .style('position', 'absolute')
            .style('left', `${margin.left + x}px`)
            .style('top', `${topPosition}px`)
            .style('width', `${barWidth}px`)
            .style('height', `${barHeight}px`)
            .style('overflow', 'hidden')
            .style('border-radius', '6px 6px 0 0')
            .style('transition', 'opacity 0.2s ease')
            .node();
          
          if (cardContainer) {
            const root = createRoot(cardContainer);
            gradientRootsRef.current.push(root);
            root.render(
              <GradientCardMoneyIn
                width={barWidth}
                height={barHeight}
                topGradientColor={gradientSettingsMoneyIn.topGradientColor}
                bottomGradientColor={gradientSettingsMoneyIn.bottomGradientColor}
                topGlowColor={gradientSettingsMoneyIn.topGlowColor}
                bottomGlowColor={gradientSettingsMoneyIn.bottomGlowColor}
                topGlowOpacity={gradientSettingsMoneyIn.topGlowOpacity}
                bottomGlowOpacity={gradientSettingsMoneyIn.bottomGlowOpacity}
                topBlurIntensity={gradientSettingsMoneyIn.topBlurIntensity}
                bottomBlurIntensity={gradientSettingsMoneyIn.bottomBlurIntensity}
                topGlowSize={gradientSettingsMoneyIn.topGlowSize}
                bottomGlowSize={gradientSettingsMoneyIn.bottomGlowSize}
                topGlowOffset={gradientSettingsMoneyIn.topGlowOffset}
                bottomGlowOffset={gradientSettingsMoneyIn.bottomGlowOffset}
              />
            );
          }
        }
      });
    }

    return () => {
      gradientRootsRef.current.forEach((root) => {
        try { root.unmount(); } catch (e) { /* ignore */ }
      });
      gradientRootsRef.current = [];
      safeRemoveChildren(svgElement);
      safeRemoveChildren(gradientOutElement);
      safeRemoveChildren(gradientInElement);
    };

  }, [data, dimensions, gradientSettingsMoneyOut, gradientSettingsMoneyIn, categoryLabel]);

  useEffect(() => {
    const svgElement = deltaLineSvgRef.current;
    if (!svgElement || !data.length) return;

    const clearDeltaLine = () => {
      try {
        while (svgElement.firstChild) svgElement.removeChild(svgElement.firstChild);
      } catch (e) { /* ignore */ }
    };

    clearDeltaLine();

    if (!chartOptions.showCashflowLine) return clearDeltaLine;

    const margin = { top: 20, right: 40, bottom: 50, left: 80 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgElement)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, chartWidth])
      .padding(0.3);

    const maxValue = d3.max(data, d => Math.max(Math.abs(d.moneyIn), Math.abs(d.moneyOut))) || 15000;
    const scaledMaxValue = maxValue * 1.3;
    const yScale = d3.scaleLinear()
      .domain([-scaledMaxValue, scaledMaxValue])
      .range([chartHeight, 0]);

    const deltaData = data.map(d => ({ month: d.month, delta: d.moneyIn + d.moneyOut }));

    const defs = svg.append('defs');
    const zeroY = margin.top + yScale(0);
    const topY = margin.top;
    const bottomY = margin.top + chartHeight;
    
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'delta-line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', topY)
      .attr('x2', 0)
      .attr('y2', bottomY);
    
    const zeroLinePercent = ((zeroY - topY) / (bottomY - topY)) * 100;
    
    lineGradient.append('stop').attr('offset', '0%').attr('stop-color', '#4F46E5');
    lineGradient.append('stop').attr('offset', `${zeroLinePercent}%`).attr('stop-color', '#4F46E5');
    lineGradient.append('stop').attr('offset', `${zeroLinePercent}%`).attr('stop-color', '#E879A9');
    lineGradient.append('stop').attr('offset', '100%').attr('stop-color', '#BE3A5C');

    const lineGenerator = d3.line<{ month: string; delta: number }>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.delta))
      .curve(d3.curveLinear);

    chart.append('path')
      .datum(deltaData)
      .attr('class', 'delta-line')
      .attr('fill', 'none')
      .attr('stroke', 'url(#delta-line-gradient)')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    deltaData.forEach(d => {
      const x = (xScale(d.month) || 0) + xScale.bandwidth() / 2;
      const y = yScale(d.delta);
      const isPositive = d.delta >= 0;
      const dotColor = isPositive ? '#4F46E5' : '#BE3A5C';
      
      chart.append('circle')
        .attr('class', 'delta-dot-bg')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .style('fill', 'white');
      
      chart.append('circle')
        .attr('class', 'delta-dot')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 2)
        .style('fill', dotColor);
    });

    return clearDeltaLine;

  }, [data, dimensions, chartOptions.showCashflowLine]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    svg.selectAll('.bar-money-in, .bar-money-out').each(function() {
      const element = d3.select(this);
      const month = element.attr('data-month');
      if (hoveredMonth === null) {
        element.style('opacity', 1);
      } else {
        element.style('opacity', month === hoveredMonth ? 1 : 0.1);
      }
    });

    if (gradientContainerMoneyOutRef.current) {
      d3.select(gradientContainerMoneyOutRef.current)
        .selectAll('.gradient-bar-money-out')
        .each(function() {
          const element = d3.select(this);
          const month = element.attr('data-month');
          element.style('opacity', hoveredMonth === null ? 1 : (month === hoveredMonth ? 1 : 0.1));
        });
    }

    if (gradientContainerMoneyInRef.current) {
      d3.select(gradientContainerMoneyInRef.current)
        .selectAll('.gradient-bar-money-in')
        .each(function() {
          const element = d3.select(this);
          const month = element.attr('data-month');
          element.style('opacity', hoveredMonth === null ? 1 : (month === hoveredMonth ? 1 : 0.1));
        });
    }
  }, [hoveredMonth]);

  return (
    <div style={{ backgroundColor: 'var(--ds-bg-default)' }} ref={containerRef}>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div 
              className="rounded-sm" 
              style={{ width: 12, height: 12, backgroundColor: gradientSettingsMoneyIn?.topGradientColor || '#b6a8ff' }}
            />
            <span className="text-label" style={{ color: 'var(--ds-text-default)' }}>Money In</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="rounded-sm" 
              style={{ width: 12, height: 12, backgroundColor: gradientSettingsMoneyOut?.baseColor || '#1e1b4b' }}
            />
            <span className="text-label" style={{ color: 'var(--ds-text-default)' }}>Money Out</span>
          </div>
          {chartOptions.showCashflowLine && (
            <div className="flex items-center gap-2">
              <div 
                className="rounded-full" 
                style={{ width: 12, height: 2, background: 'linear-gradient(90deg, #4F46E5 50%, #BE3A5C 50%)' }}
              />
              <span className="text-label" style={{ color: 'var(--ds-text-default)' }}>Delta</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCadenceChange && (
            <CadenceDropdown 
              value={cadence} 
              onChange={onCadenceChange} 
              selectionStart={selectionStart} 
              selectionEnd={selectionEnd} 
            />
          )}
          {onChartOptionsChange && (
            <ChartOptionsDropdown options={chartOptions} onChange={onChartOptionsChange} />
          )}
        </div>
      </div>
      
      <div className="w-full relative">
        <style>{`
          .bars-hidden .bar-money-in,
          .bars-hidden .bar-money-out {
            display: none !important;
          }
        `}</style>
        <svg ref={svgRef} className={`w-full h-auto ${!chartOptions.showBars ? 'bars-hidden' : ''}`} />
        <div 
          ref={gradientContainerMoneyOutRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none',
            display: chartOptions.showBars ? 'block' : 'none'
          }} 
        />
        <div 
          ref={gradientContainerMoneyInRef} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none',
            display: chartOptions.showBars ? 'block' : 'none'
          }} 
        />
        <svg 
          ref={deltaLineSvgRef}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none'
          }} 
        />
        {tooltip && (
          <div
            className="absolute"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            <div className="cashflow-tooltip">
              <div className="cashflow-tooltip-header">{categoryLabel}: {tooltip.category}</div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="rounded-sm" 
                    style={{ width: 8, height: 8, backgroundColor: gradientSettingsMoneyIn?.topGradientColor || '#b6a8ff', flexShrink: 0 }}
                  />
                  <span className="cashflow-tooltip-label">Money In:</span>
                  <span className="cashflow-tooltip-value-in">
                    ${Math.abs(tooltip.moneyIn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="rounded-sm" 
                    style={{ width: 8, height: 8, backgroundColor: gradientSettingsMoneyOut?.baseColor || '#1e1b4b', flexShrink: 0 }}
                  />
                  <span className="cashflow-tooltip-label">Money Out:</span>
                  <span className="cashflow-tooltip-value-out">
                    –${Math.abs(tooltip.moneyOut).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="cashflow-tooltip-arrow" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowBarChart;
