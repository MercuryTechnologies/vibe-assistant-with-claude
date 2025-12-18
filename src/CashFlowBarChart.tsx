import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import Dropdown, { type Cadence } from './Dropdown';
import GradientCard from './GradientCard';
import GradientCardMoneyIn from './GradientCardMoneyIn';
import { type GradientSettings, type GradientSettingsMoneyIn } from './GradientPlayground';
import { createRoot } from 'react-dom/client';
import ChartOptionsDropdown from './ChartOptionsDropdown';
import { useAppStore } from './store';

interface CashFlowData {
  month: string; // Keep as "month" for backward compatibility, but represents any time period
  moneyIn: number;
  moneyOut: number;
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
  categoryLabel?: string; // Label for the category type (e.g., "Month", "Account", "To/From", "Method")
}

interface TooltipData {
  x: number;
  y: number;
  category: string;
  moneyIn: number;
  moneyOut: number;
}

// Sample data matching the design
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
  categoryLabel = 'Month'
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
  
  // Get chart options from store
  const chartOptions = useAppStore((s) => s.chartOptions);

  // Handle responsive sizing with debounce to prevent rapid re-renders
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setDimensions({
        width: width || containerWidth,
        height: height
      });
    }
  }, [width, height]);

  useEffect(() => {
    updateDimensions();
    
    // Debounce resize to prevent rapid re-renders that cause DOM conflicts
    let resizeTimeout: NodeJS.Timeout;
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

  // Cleanup React roots on unmount
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:88',message:'Component mounted',data:{rootCount:gradientRootsRef.current.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-H5'})}).catch(()=>{});
    // #endregion
    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:92',message:'Component unmounting - cleanup starting',data:{rootCount:gradientRootsRef.current.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      gradientRootsRef.current.forEach((root, idx) => {
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:97',message:'Unmounting root',data:{idx},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
          root.unmount();
        } catch (e) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:102',message:'Root unmount error',data:{idx,error:String(e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
          // #endregion
        }
      });
    };
  }, []);

  useEffect(() => {
    const svgElement = svgRef.current;
    const gradientOutElement = gradientContainerMoneyOutRef.current;
    const gradientInElement = gradientContainerMoneyInRef.current;
    
    if (!svgElement || !data.length) return;

    // Safe DOM cleanup function
    const safeRemoveChildren = (element: Element | null) => {
      if (!element) return;
      try {
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
      } catch (e) {
        // Ignore DOM manipulation errors during React reconciliation
      }
    };

    // Clear previous chart
    safeRemoveChildren(svgElement);

    // Chart dimensions and margins (24px padding + space for labels)
    const margin = { top: 20, right: 40, bottom: 50, left: 80 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgElement)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales with increased padding between months
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, chartWidth])
      .padding(0.3); // Increased padding for 16px spacing between bars

    const maxValue = d3.max(data, d => Math.max(Math.abs(d.moneyIn), Math.abs(d.moneyOut))) || 15000;
    // Increase the scale by 30% to make bars appear smaller
    const scaledMaxValue = maxValue * 1.3;
    const yScale = d3.scaleLinear()
      .domain([-scaledMaxValue, scaledMaxValue])
      .range([chartHeight, 0]);

    // Determine Y-axis ticks dynamically so they always span full chart height
    const tickCount = 6;
    const customTicks = d3.ticks(-scaledMaxValue, scaledMaxValue, tickCount);
    const zeroLineY = yScale(0);
    const tickPositions = customTicks.map(tick => yScale(tick));

    // Create dot grid background
    const dotSpacing = 20; // 20px spacing between dots
    const dotRadius = 1; // Reduced to 1px radius (2px diameter)
    
    // Create dots across the entire chart area
    for (let x = 0; x <= chartWidth; x += dotSpacing) {
      for (let y = 0; y <= chartHeight; y += dotSpacing) {
        // Check if this row aligns with a Y-axis tick
        const isYAxisRow = tickPositions.some(tickY => Math.abs(y - tickY) < dotSpacing / 2);
        const isZeroLine = Math.abs(y - zeroLineY) < dotSpacing / 2; // Check if this is the zero line
        
        chart.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', dotRadius)
          .style('fill', isYAxisRow ? '#9ca3af' : '#e5e7eb') // Darker for Y-axis aligned rows
          .style('opacity', isZeroLine ? 0 : (isYAxisRow ? 0.8 : 0.4)); // Hide dots on zero line
      }
    }

    // Y-axis with labels using the same dynamic tick values
    const yAxisLabels = d3.axisLeft(yScale)
      .tickFormat(d => {
        const val = d as number;
        const absVal = Math.abs(val);
        const formattedVal = absVal >= 1000 ? `$${absVal / 1000}K` : `$${absVal}`;
        return val < 0 ? `-${formattedVal}` : formattedVal;
      })
      .tickValues(customTicks); // Use custom tick values instead of automatic ticks

    chart.append('g')
      .attr('class', 'y-axis')
      .call(yAxisLabels)
      .selectAll('text')
      .style('font-family', 'Inter, -apple-system, BlinkMacSystemFont, sans-serif')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .style('text-anchor', 'start') // Left-align the labels
      .attr('x', -75); // Position labels to the left

    // Remove y-axis domain line
    chart.select('.y-axis .domain').remove();
    chart.selectAll('.y-axis .tick line').remove();

    // X-axis (positioned 24px below chart area)
    const xAxis = d3.axisBottom(xScale)
      .tickSize(0);

    chart.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight + 24})`) // Added 24px padding
      .call(xAxis)
      .selectAll('text')
      .style('font-family', 'Inter, -apple-system, BlinkMacSystemFont, sans-serif')
      .style('font-size', '12px')
      .style('fill', '#6b7280');

    // Remove x-axis domain line
    chart.select('.x-axis .domain').remove();

    // Create bars for each month
    data.forEach(d => {
      const x = xScale(d.month)!;
      const barWidth = xScale.bandwidth();
      
      // Determine which value is larger for opacity logic
      const moneyInAbs = Math.abs(d.moneyIn);
      const moneyOutAbs = Math.abs(d.moneyOut);
      const moneyInIsLarger = moneyInAbs >= moneyOutAbs;
      
      // Money In bar (positive) - rounded top, square bottom
      if (d.moneyIn > 0) {
        const barHeight = Math.abs(yScale(d.moneyIn) - yScale(0));
        
        // Create a path for rounded top, square bottom
        const pathData = `
          M ${x} ${yScale(0)}
          L ${x} ${yScale(d.moneyIn) + 6}
          Q ${x} ${yScale(d.moneyIn)} ${x + 6} ${yScale(d.moneyIn)}
          L ${x + barWidth - 6} ${yScale(d.moneyIn)}
          Q ${x + barWidth} ${yScale(d.moneyIn)} ${x + barWidth} ${yScale(d.moneyIn) + 6}
          L ${x + barWidth} ${yScale(0)}
          Z
        `;
        
        // If gradient settings are provided, use a placeholder
        if (gradientSettingsMoneyIn) {
          chart.append('rect')
            .attr('class', `gradient-bar-money-in-placeholder`)
            .attr('data-bar-index', d.month)
            .attr('x', x)
            .attr('y', yScale(d.moneyIn))
            .attr('width', barWidth)
            .attr('height', barHeight)
            .attr('rx', 6)
            .style('opacity', 0); // Hidden placeholder
        } else {
          chart.append('path')
            .attr('class', 'bar-money-in')
            .attr('data-month', d.month)
            .attr('d', pathData)
            .style('fill', moneyInIsLarger ? '#b6a8ff' : '#d1d5db')
            .style('opacity', 1)
            .style('transition', 'opacity 0.2s ease');
        }
      }

      // Money Out bar (negative) - square top, rounded bottom
      if (d.moneyOut < 0) {
        const barHeight = Math.abs(yScale(d.moneyOut) - yScale(0));
        
        // Create a path for square top, rounded bottom
        const pathData = `
          M ${x} ${yScale(0)}
          L ${x} ${yScale(d.moneyOut) - 6}
          Q ${x} ${yScale(d.moneyOut)} ${x + 6} ${yScale(d.moneyOut)}
          L ${x + barWidth - 6} ${yScale(d.moneyOut)}
          Q ${x + barWidth} ${yScale(d.moneyOut)} ${x + barWidth} ${yScale(d.moneyOut) - 6}
          L ${x + barWidth} ${yScale(0)}
          Z
        `;
        
        // If gradient settings are provided, use a placeholder for React component
        if (gradientSettingsMoneyOut) {
          // Add a placeholder rect that we'll replace with React component
          chart.append('rect')
            .attr('class', `gradient-bar-money-out-placeholder`)
            .attr('data-bar-index', d.month)
            .attr('x', x)
            .attr('y', yScale(d.moneyOut))
            .attr('width', barWidth)
            .attr('height', barHeight)
            .attr('rx', 6)
            .style('opacity', 0); // Hidden placeholder
        } else {
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

    // Create invisible hover rectangles for tooltip interaction
    data.forEach(d => {
      const x = xScale(d.month)!;
      const barWidth = xScale.bandwidth();
      
      // Calculate the full height of the bar pair (from top of money in to bottom of money out)
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

    // Add zero line with reduced opacity
    chart.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .style('stroke', '#374151')
      .style('stroke-width', 1)
      .style('opacity', 0.4); // Reduced opacity by 60%

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:345',message:'Chart effect - cleaning up roots BEFORE D3 remove',data:{rootCount:gradientRootsRef.current.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-H2'})}).catch(()=>{});
    // #endregion
    // Clean up old React roots before creating new ones
    gradientRootsRef.current.forEach((root, idx) => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:352',message:'Effect unmounting root',data:{idx},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        root.unmount();
      } catch (e) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:357',message:'Effect root unmount error',data:{idx,error:String(e)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      }
    });
    gradientRootsRef.current = [];

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:364',message:'Chart effect - clearing D3 containers AFTER root unmount',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-H2'})}).catch(()=>{});
    // #endregion
    // Always clear gradient containers first using safe cleanup
    safeRemoveChildren(gradientOutElement);
    safeRemoveChildren(gradientInElement);

    // Render Money Out gradient bars using React components
    if (gradientSettingsMoneyOut && gradientOutElement) {
      const gradientContainer = d3.select(gradientOutElement);
      
      data.forEach(d => {
        if (d.moneyOut < 0) {
          const x = xScale(d.month)!;
          const barWidth = xScale.bandwidth();
          const barHeight = Math.abs(yScale(d.moneyOut) - yScale(0));
          
          // Position from zero line (top of negative bar) downward
          const topPosition = margin.top + yScale(0);
          
          // Create a container for the gradient card
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:405',message:'Creating MoneyOut root',data:{month:d.month,currentRootCount:gradientRootsRef.current.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
            // #endregion
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

    // Render Money In gradient bars using React components
    if (gradientSettingsMoneyIn && gradientInElement) {
      const gradientContainer = d3.select(gradientInElement);
      
      data.forEach(d => {
        if (d.moneyIn > 0) {
          const x = xScale(d.month)!;
          const barWidth = xScale.bandwidth();
          const barHeight = Math.abs(yScale(d.moneyIn) - yScale(0));
          
          // Position from top of bar upward to zero line
          const topPosition = margin.top + yScale(d.moneyIn);
          
          // Create a container for the gradient card
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/fa9275e2-70e9-43ca-a419-11bef518d4c6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CashFlowBarChart.tsx:460',message:'Creating MoneyIn root',data:{month:d.month,currentRootCount:gradientRootsRef.current.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
            // #endregion
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

    // Return cleanup function using captured references
    return () => {
      // Clean up React roots first (before removing DOM elements)
      gradientRootsRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch (e) {
          // Ignore unmount errors
        }
      });
      gradientRootsRef.current = [];
      
      // Safe cleanup of DOM using captured references
      safeRemoveChildren(svgElement);
      safeRemoveChildren(gradientOutElement);
      safeRemoveChildren(gradientInElement);
    };

  }, [data, dimensions, gradientSettingsMoneyOut, gradientSettingsMoneyIn, categoryLabel]);

  // Effect to render delta line in overlay SVG (on top of bars)
  useEffect(() => {
    const svgElement = deltaLineSvgRef.current;
    if (!svgElement || !data.length) return;

    // Safe cleanup function
    const clearDeltaLine = () => {
      try {
        // Remove children one by one to avoid removeChild errors
        while (svgElement.firstChild) {
          svgElement.removeChild(svgElement.firstChild);
        }
      } catch (e) {
        // Ignore DOM manipulation errors during React reconciliation
      }
    };

    // Clear previous delta line
    clearDeltaLine();

    if (!chartOptions.showCashflowLine) return clearDeltaLine;

    // Chart dimensions and margins (must match main chart)
    const margin = { top: 20, right: 40, bottom: 50, left: 80 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgElement)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    // Create chart group with same transform as main chart
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Recreate scales (must match main chart)
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, chartWidth])
      .padding(0.3);

    const maxValue = d3.max(data, d => Math.max(Math.abs(d.moneyIn), Math.abs(d.moneyOut))) || 15000;
    const scaledMaxValue = maxValue * 1.3;
    const yScale = d3.scaleLinear()
      .domain([-scaledMaxValue, scaledMaxValue])
      .range([chartHeight, 0]);

    // Calculate delta values (moneyIn + moneyOut since moneyOut is negative)
    const deltaData = data.map(d => ({
      month: d.month,
      delta: d.moneyIn + d.moneyOut
    }));

    // Create gradient definition for the line stroke
    const defs = svg.append('defs');
    
    // Calculate the actual Y coordinate of the zero line in user space
    const zeroY = margin.top + yScale(0);
    const topY = margin.top; // Top of chart area
    const bottomY = margin.top + chartHeight; // Bottom of chart area
    
    // Create vertical gradient for the line (blue above zero, red below)
    // Using userSpaceOnUse so gradient is based on actual coordinates, not path bounding box
    const lineGradient = defs.append('linearGradient')
      .attr('id', 'delta-line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', topY)
      .attr('x2', 0)
      .attr('y2', bottomY);
    
    // Calculate zero line position as percentage of chart height
    const zeroLinePercent = ((zeroY - topY) / (bottomY - topY)) * 100;
    
    // Blue color for positive values (above zero)
    lineGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4F46E5'); // Indigo blue
    
    lineGradient.append('stop')
      .attr('offset', `${zeroLinePercent}%`)
      .attr('stop-color', '#4F46E5'); // Indigo blue at zero
    
    lineGradient.append('stop')
      .attr('offset', `${zeroLinePercent}%`)
      .attr('stop-color', '#E879A9'); // Pink/red at zero
    
    // Red/pink color for negative values (below zero)
    lineGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#BE3A5C'); // Darker red/pink

    // Create line generator
    const lineGenerator = d3.line<{ month: string; delta: number }>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.delta))
      .curve(d3.curveLinear);

    // Draw the delta line
    chart.append('path')
      .datum(deltaData)
      .attr('class', 'delta-line')
      .attr('fill', 'none')
      .attr('stroke', 'url(#delta-line-gradient)')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);

    // Add dots at each data point
    deltaData.forEach(d => {
      const x = (xScale(d.month) || 0) + xScale.bandwidth() / 2;
      const y = yScale(d.delta);
      const isPositive = d.delta >= 0;
      const dotColor = isPositive ? '#4F46E5' : '#BE3A5C';
      
      // White background circle
      chart.append('circle')
        .attr('class', 'delta-dot-bg')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 4)
        .style('fill', 'white');
      
      // Inner colored dot
      chart.append('circle')
        .attr('class', 'delta-dot')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 2)
        .style('fill', dotColor);
    });

    // Return cleanup function
    return clearDeltaLine;

  }, [data, dimensions, chartOptions.showCashflowLine]);

  // Effect to handle hover opacity changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Update SVG bars opacity
    svg.selectAll('.bar-money-in, .bar-money-out').each(function() {
      const element = d3.select(this);
      const month = element.attr('data-month');
      if (hoveredMonth === null) {
        element.style('opacity', 1);
      } else {
        element.style('opacity', month === hoveredMonth ? 1 : 0.1);
      }
    });

    // Update gradient containers opacity
    if (gradientContainerMoneyOutRef.current) {
      d3.select(gradientContainerMoneyOutRef.current)
        .selectAll('.gradient-bar-money-out')
        .each(function() {
          const element = d3.select(this);
          const month = element.attr('data-month');
          if (hoveredMonth === null) {
            element.style('opacity', 1);
          } else {
            element.style('opacity', month === hoveredMonth ? 1 : 0.1);
          }
        });
    }

    if (gradientContainerMoneyInRef.current) {
      d3.select(gradientContainerMoneyInRef.current)
        .selectAll('.gradient-bar-money-in')
        .each(function() {
          const element = d3.select(this);
          const month = element.attr('data-month');
          if (hoveredMonth === null) {
            element.style('opacity', 1);
          } else {
            element.style('opacity', month === hoveredMonth ? 1 : 0.1);
          }
        });
    }
  }, [hoveredMonth]);

  return (
    <div className="bg-white" ref={containerRef}>
      {/* Legend with Frequency Dropdown and Chart Options */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: gradientSettingsMoneyIn?.topGradientColor || '#b6a8ff' }}
            />
            <span className="text-sm font-medium text-gray-700">Money In</span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: gradientSettingsMoneyOut?.baseColor || '#1e1b4b' }}
            />
            <span className="text-sm font-medium text-gray-700">Money Out</span>
          </div>
          {chartOptions.showCashflowLine && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-0.5 rounded-full" 
                style={{ background: 'linear-gradient(90deg, #4F46E5 50%, #BE3A5C 50%)' }}
              />
              <span className="text-sm font-medium text-gray-700">Delta</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCadenceChange && (
            <Dropdown 
              value={cadence} 
              onChange={onCadenceChange} 
              selectionStart={selectionStart} 
              selectionEnd={selectionEnd} 
            />
          )}
          <ChartOptionsDropdown />
        </div>
      </div>
      
      {/* Chart */}
      <div className="w-full relative">
        {/* CSS to hide bars when showBars is false */}
        <style>{`
          .bars-hidden .bar-money-in,
          .bars-hidden .bar-money-out {
            display: none !important;
          }
        `}</style>
        <svg ref={svgRef} className={`w-full h-auto ${!chartOptions.showBars ? 'bars-hidden' : ''}`} style={{ minWidth: '600px' }} />
        {/* Money Out gradient bars overlay */}
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
        {/* Money In gradient bars overlay */}
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
        {/* Delta line overlay (rendered on top of bars) */}
        <svg 
          ref={deltaLineSvgRef}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none',
            minWidth: '600px'
          }} 
        />
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="bg-gray-900 text-white rounded-lg shadow-lg px-3 py-2 text-sm whitespace-nowrap">
              <div className="font-medium text-gray-300 mb-1.5 text-xs uppercase tracking-wide">
                {categoryLabel}: {tooltip.category}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: gradientSettingsMoneyIn?.topGradientColor || '#b6a8ff' }}
                  />
                  <span className="text-gray-400">Money In:</span>
                  <span className="font-medium text-green-400">
                    ${Math.abs(tooltip.moneyIn).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: gradientSettingsMoneyOut?.baseColor || '#1e1b4b' }}
                  />
                  <span className="text-gray-400">Money Out:</span>
                  <span className="font-medium text-red-400">
                    –${Math.abs(tooltip.moneyOut).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              {/* Tooltip arrow */}
              <div 
                className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #111827'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowBarChart;
