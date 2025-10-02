import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface CashFlowData {
  month: string;
  moneyIn: number;
  moneyOut: number;
}

interface CashFlowBarChartProps {
  data?: CashFlowData[];
  width?: number;
  height?: number;
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
  height = 500 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Handle responsive sizing
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
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Chart dimensions and margins (24px padding + space for labels)
    const margin = { top: 20, right: 40, bottom: 50, left: 80 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
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

    // Create dot grid background
    const dotSpacing = 20; // 20px spacing between dots
    const dotRadius = 1; // Reduced to 1px radius (2px diameter)
    
    // Get Y-axis tick positions for darker dots
    const yAxisTicks = [-15000, -10000, -5000, 0, 5000, 10000, 15000]; // Use same custom ticks
    
    // Create dots across the entire chart area
    for (let x = 0; x <= chartWidth; x += dotSpacing) {
      for (let y = 0; y <= chartHeight; y += dotSpacing) {
        // Check if this row aligns with a Y-axis tick
        const yValue = yScale.invert(y);
        // Use a more precise tolerance based on pixel positioning
        const isYAxisRow = yAxisTicks.some(tick => {
          const tickY = yScale(tick);
          return Math.abs(y - tickY) < dotSpacing / 2; // Within half a dot spacing
        });
        const isZeroLine = Math.abs(yValue) < scaledMaxValue * 0.02; // Check if this is the zero line
        
        chart.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', dotRadius)
          .style('fill', isYAxisRow ? '#9ca3af' : '#e5e7eb') // Darker for Y-axis aligned rows
          .style('opacity', isZeroLine ? 0 : (isYAxisRow ? 0.8 : 0.4)); // Hide dots on zero line
      }
    }

    // Y-axis with labels (custom tick values including 15k increments)
    const customTicks = [-15000, -10000, -5000, 0, 5000, 10000, 15000];
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
        
        chart.append('path')
          .attr('d', pathData)
          .style('fill', moneyInIsLarger ? '#b6a8ff' : '#d1d5db')
          .style('opacity', 1);
      }

      // Money Out bar (negative) - square top, rounded bottom
      if (d.moneyOut < 0) {
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
        
        chart.append('path')
          .attr('d', pathData)
          .style('fill', !moneyInIsLarger ? '#1e1b4b' : '#d1d5db')
          .style('opacity', 1);
      }
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

  }, [data, dimensions]);

  return (
    <div className="bg-white" ref={containerRef}>
      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: '#b6a8ff' }}
          />
          <span className="text-sm font-medium text-gray-700">Money In</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: '#1e1b4b' }}
          />
          <span className="text-sm font-medium text-gray-700">Money Out</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="w-full">
        <svg ref={svgRef} className="w-full h-auto" style={{ minWidth: '600px' }} />
      </div>
    </div>
  );
};

export default CashFlowBarChart;
