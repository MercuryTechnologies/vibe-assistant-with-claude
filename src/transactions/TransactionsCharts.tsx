import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { type Transaction } from './mockData';
import TransactionScatterPlot from './TransactionScatterPlot';

// Chart view toggle types
type ChartView = 'scatter' | 'line';

// Grouping options based on table columns
export type GroupByOption = 'toFrom' | 'account' | 'method' | 'category' | 'date';

interface GroupByConfig {
  value: GroupByOption;
  label: string;
}

const groupByOptions: GroupByConfig[] = [
  { value: 'toFrom', label: 'To/From' },
  { value: 'account', label: 'Account' },
  { value: 'method', label: 'Method' },
  { value: 'category', label: 'Category' },
  { value: 'date', label: 'Date' },
];

// Group By Dropdown Component
interface GroupByDropdownProps {
  value: GroupByOption;
  onChange: (value: GroupByOption) => void;
}

const GroupByDropdown: React.FC<GroupByDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = groupByOptions.find(opt => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-[12px] text-gray-600 hover:text-gray-900"
      >
        <span className="font-medium">{selectedOption?.label}</span>
        <svg 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 min-w-[140px] bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {groupByOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-1.5 text-left text-[12px] hover:bg-gray-50 flex items-center justify-between
                ${value === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}
              `}
            >
              {option.label}
              {value === option.value && (
                <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper to format ISO date for bar chart display
const formatDateForBarChart = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to aggregate transactions by a given property - returns incoming and outgoing separately
const aggregateByProperty = (transactions: Transaction[], groupBy: GroupByOption): { name: string; fullName: string; incoming: number; outgoing: number }[] => {
  const aggregated: Record<string, { incoming: number; outgoing: number; sortKey: string }> = {};
  
  transactions.forEach(t => {
    // Skip failed transactions
    if (t.status === 'failed') return;
    
    let key: string;
    let sortKey: string;
    
    switch (groupBy) {
      case 'toFrom':
        key = t.toFrom.name;
        sortKey = key;
        break;
      case 'account':
        key = t.account;
        sortKey = key;
        break;
      case 'method':
        if (t.method.type === 'card') {
          key = `Card ••${t.method.cardLast4}`;
        } else if (t.method.type === 'loan') {
          key = 'Loan Payment';
        } else if (t.method.type === 'invoice') {
          key = 'Invoice';
        } else {
          key = 'Transfer';
        }
        sortKey = key;
        break;
      case 'category':
        key = t.glCode || 'Uncategorized';
        sortKey = key;
        break;
      case 'date':
        // Format ISO date for display but keep original for sorting
        key = formatDateForBarChart(t.date);
        sortKey = t.date; // Keep ISO for sorting
        break;
      default:
        key = 'Other';
        sortKey = key;
    }
    
    // Initialize if not exists
    if (!aggregated[key]) {
      aggregated[key] = { incoming: 0, outgoing: 0, sortKey };
    }
    
    // Separate incoming (positive) and outgoing (negative)
    if (t.amount >= 0) {
      aggregated[key].incoming += t.amount;
    } else {
      aggregated[key].outgoing += Math.abs(t.amount);
    }
  });
  
  // Convert to array and sort by total value descending, take top 5
  // Keep full name for tooltip, truncated name for x-axis display
  return Object.entries(aggregated)
    .map(([fullName, values]) => ({ 
      name: fullName.length > 10 ? fullName.substring(0, 8) + '..' : fullName,
      fullName,
      incoming: values.incoming, 
      outgoing: values.outgoing 
    }))
    .sort((a, b) => (b.incoming + b.outgoing) - (a.incoming + a.outgoing))
    .slice(0, 5);
};

// Hover data type for line chart
export interface LineChartHoverData {
  date: string;
  moneyIn: number;
  moneyOut: number;
}

// Helper to format ISO date for display
const formatDateForLineChart = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Line Chart Component using D3 - shows cumulative money in/out by date
interface LineChartD3Props {
  transactions: Transaction[];
  onHover?: (data: LineChartHoverData | null) => void;
}

const LineChartD3: React.FC<LineChartD3Props> = ({ transactions, onHover }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute cumulative data by date
  const lineData = useMemo(() => {
    // Aggregate by date
    const byDate: Record<string, { moneyIn: number; moneyOut: number }> = {};
    
    transactions.forEach(t => {
      if (t.status === 'failed') return;
      
      // Use the ISO date as key
      const dateKey = t.date;
      
      if (!byDate[dateKey]) {
        byDate[dateKey] = { moneyIn: 0, moneyOut: 0 };
      }
      
      if (t.amount >= 0) {
        byDate[dateKey].moneyIn += t.amount;
      } else {
        byDate[dateKey].moneyOut += Math.abs(t.amount);
      }
    });
    
    // Get unique dates and sort them (ISO format sorts correctly)
    const sortedDates = Object.keys(byDate).sort();
    
    // Create cumulative data
    let cumulativeIn = 0;
    let cumulativeOut = 0;
    
    return sortedDates.map(date => {
      cumulativeIn += byDate[date]?.moneyIn || 0;
      cumulativeOut += byDate[date]?.moneyOut || 0;
      return {
        date: formatDateForLineChart(date), // Format for display
        isoDate: date, // Keep original for sorting
        moneyIn: cumulativeIn,
        moneyOut: cumulativeOut,
      };
    });
  }, [transactions]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || lineData.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 10, right: 24, left: 50, bottom: 28 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate max value for y scale
    const maxValue = Math.max(
      ...lineData.map(d => Math.max(d.moneyIn, d.moneyOut))
    );
    const yMax = Math.ceil(maxValue / 10000) * 10000 + 5000;
    const yMin = 0;

    // Scales
    const xScale = d3.scalePoint<string>()
      .domain(lineData.map(d => d.date))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0]);

    // Grid lines
    const gridTicks = [yMax * 0.25, yMax * 0.5, yMax * 0.75];
    g.selectAll('.grid-line')
      .data(gridTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#F3F4F6')
      .attr('stroke-width', 1);

    // Line generators
    const lineGeneratorIn = d3.line<typeof lineData[0]>()
      .x(d => xScale(d.date) || 0)
      .y(d => yScale(d.moneyIn))
      .curve(d3.curveMonotoneX);

    const lineGeneratorOut = d3.line<typeof lineData[0]>()
      .x(d => xScale(d.date) || 0)
      .y(d => yScale(d.moneyOut))
      .curve(d3.curveMonotoneX);

    // Area under money in line
    const areaGenerator = d3.area<typeof lineData[0]>()
      .x(d => xScale(d.date) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d.moneyIn))
      .curve(d3.curveMonotoneX);

    // Gradient for area
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'areaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0a5736')
      .attr('stop-opacity', 0.15);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0a5736')
      .attr('stop-opacity', 0.02);

    // Draw area
    g.append('path')
      .datum(lineData)
      .attr('fill', 'url(#areaGradient)')
      .attr('d', areaGenerator);

    // Draw money out line (pink)
    g.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', '#d03275')
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorOut);

    // Draw money in line (green) - no dots
    g.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', '#0a5736')
      .attr('stroke-width', 2)
      .attr('d', lineGeneratorIn);

    // Create hover elements (initially hidden)
    const hoverLine = g.append('line')
      .attr('class', 'hover-line')
      .attr('stroke', '#9CA3AF')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('opacity', 0);

    const hoverDotIn = g.append('circle')
      .attr('class', 'hover-dot-in')
      .attr('r', 5)
      .attr('fill', '#0a5736')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    const hoverDotOut = g.append('circle')
      .attr('class', 'hover-dot-out')
      .attr('r', 5)
      .attr('fill', '#d03275')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    // Invisible overlay for mouse tracking
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        
        // Find the nearest data point
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        lineData.forEach((d, i) => {
          const x = xScale(d.date) || 0;
          const distance = Math.abs(mouseX - x);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
          }
        });
        
        const nearestData = lineData[nearestIndex];
        const nearestX = xScale(nearestData.date) || 0;
        
        // Update hover line
        hoverLine
          .attr('x1', nearestX)
          .attr('x2', nearestX)
          .style('opacity', 1);
        
        // Update hover dots
        hoverDotIn
          .attr('cx', nearestX)
          .attr('cy', yScale(nearestData.moneyIn))
          .style('opacity', 1);
        
        hoverDotOut
          .attr('cx', nearestX)
          .attr('cy', yScale(nearestData.moneyOut))
          .style('opacity', 1);
        
        // Call hover callback
        if (onHover) {
          onHover({
            date: nearestData.date,
            moneyIn: nearestData.moneyIn,
            moneyOut: nearestData.moneyOut,
          });
        }
      })
      .on('mouseleave', function() {
        // Hide hover elements
        hoverLine.style('opacity', 0);
        hoverDotIn.style('opacity', 0);
        hoverDotOut.style('opacity', 0);
        
        // Clear hover data
        if (onHover) {
          onHover(null);
        }
      });

    // Y Axis
    const yTickValues = [Math.round(yMax * 0.3), Math.round(yMax * 0.8)];
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .tickValues(yTickValues)
          .tickFormat(d => `$${Math.round(Number(d) / 1000)}K`)
          .tickSize(0)
      )
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .attr('dx', -8)
      .attr('fill', '#374151')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '13px')
      .attr('font-weight', '400')
      .attr('letter-spacing', '0.1px');

    // X Axis - limit to maximum 4 evenly spaced labels
    const maxXTicks = 4;
    const tickIndices: number[] = [];
    if (lineData.length <= maxXTicks) {
      // Show all ticks if we have 4 or fewer data points
      for (let i = 0; i < lineData.length; i++) {
        tickIndices.push(i);
      }
    } else {
      // Calculate evenly spaced indices for 4 ticks
      for (let i = 0; i < maxXTicks; i++) {
        const index = Math.round((i * (lineData.length - 1)) / (maxXTicks - 1));
        tickIndices.push(index);
      }
    }
    const xTickValues = tickIndices.map(i => lineData[i].date);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0).tickValues(xTickValues))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .attr('dy', 8)
      .attr('fill', '#374151')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '13px')
      .attr('font-weight', '400')
      .attr('letter-spacing', '0.1px')
      .attr('dominant-baseline', 'hanging')
      .attr('text-anchor', 'middle');

  }, [lineData, onHover]);

  if (lineData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        No data to display
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

// Tooltip data interface for bar chart
interface BarTooltipData {
  x: number;
  y: number;
  fullName: string;
  incoming: number;
  outgoing: number;
}

// Bar Chart Component using D3 - grouped bars for incoming/outgoing
interface BarChartD3Props {
  data: { name: string; fullName: string; incoming: number; outgoing: number }[];
  categoryLabel?: string; // Label for the category type (e.g., "Category", "Account", "To/From", "Method", "Date")
  onBarClick?: (fullName: string) => void; // Callback when a bar is clicked
}

const BarChartD3: React.FC<BarChartD3Props> = ({ data, categoryLabel = 'Category', onBarClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<BarTooltipData | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 5, right: 20, left: 45, bottom: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate max value for y scale
    const maxValue = Math.max(...data.map(d => Math.max(d.incoming, d.outgoing)));
    const yMax = Math.ceil(maxValue / 10000) * 10000 + 5000; // Round up to nearest 10K plus padding

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, innerWidth])
      .padding(0.3);

    // Inner scale for grouped bars
    const xInnerScale = d3.scaleBand()
      .domain(['incoming', 'outgoing'])
      .range([0, xScale.bandwidth()])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);

    // Create gradient definitions
    const defs = svg.append('defs');
    
    // Gradient for incoming (green) bars
    const incomingGradient = defs.append('linearGradient')
      .attr('id', 'incoming-bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    incomingGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(24, 133, 84, 0.16)');
    
    incomingGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(24, 133, 84, 0.02)');

    // Gradient for outgoing (pink) bars
    const outgoingGradient = defs.append('linearGradient')
      .attr('id', 'outgoing-bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    outgoingGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(208, 50, 117, 0.16)');
    
    outgoingGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(208, 50, 117, 0.02)');

    // Draw grouped bars for each category
    const groups = g.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(${xScale(d.name) || 0},0)`);

    // Add full-height hover background (initially transparent)
    groups.append('rect')
      .attr('class', 'hover-background')
      .attr('x', -4) // Slight padding on left
      .attr('y', 0)
      .attr('width', xScale.bandwidth() + 8) // Full width with padding
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event: MouseEvent, d) {
        // Show light gray background on hover
        d3.select(this).attr('fill', '#f3f4f6');
        
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (containerRect) {
          // Position tooltip at the center-top of the bar group
          const groupX = xScale(d.name) || 0;
          const tooltipX = margin.left + groupX + xScale.bandwidth() / 2;
          const barTopY = Math.min(yScale(d.incoming), yScale(d.outgoing));
          
          setTooltip({
            x: tooltipX,
            y: barTopY + margin.top - 8,
            fullName: d.fullName,
            incoming: d.incoming,
            outgoing: d.outgoing
          });
        }
      })
      .on('mouseleave', function() {
        // Hide background on mouse leave
        d3.select(this).attr('fill', 'transparent');
        setTooltip(null);
      })
      .on('click', function(event: MouseEvent, d) {
        // Call the click handler with the full category name
        if (onBarClick) {
          onBarClick(d.fullName);
        }
      });

    // Incoming bars (green gradient with top border)
    groups.append('rect')
      .attr('class', 'bar-incoming')
      .attr('x', xInnerScale('incoming') || 0)
      .attr('y', d => yScale(d.incoming))
      .attr('width', xInnerScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.incoming))
      .attr('fill', 'url(#incoming-bar-gradient)')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('pointer-events', 'none'); // Let hover pass through to background

    // Top border for incoming bars
    groups.append('rect')
      .attr('class', 'bar-incoming-border')
      .attr('x', xInnerScale('incoming') || 0)
      .attr('y', d => yScale(d.incoming))
      .attr('width', xInnerScale.bandwidth())
      .attr('height', 1.5)
      .attr('fill', '#0a5736')
      .attr('rx', 4)
      .attr('ry', 0)
      .style('pointer-events', 'none'); // Let hover pass through to background

    // Outgoing bars (pink gradient with top border)
    groups.append('rect')
      .attr('class', 'bar-outgoing')
      .attr('x', xInnerScale('outgoing') || 0)
      .attr('y', d => yScale(d.outgoing))
      .attr('width', xInnerScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.outgoing))
      .attr('fill', 'url(#outgoing-bar-gradient)')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('pointer-events', 'none'); // Let hover pass through to background

    // Top border for outgoing bars
    groups.append('rect')
      .attr('class', 'bar-outgoing-border')
      .attr('x', xInnerScale('outgoing') || 0)
      .attr('y', d => yScale(d.outgoing))
      .attr('width', xInnerScale.bandwidth())
      .attr('height', 1.5)
      .attr('fill', '#d03275')
      .attr('rx', 4)
      .attr('ry', 0)
      .style('pointer-events', 'none'); // Let hover pass through to background

    // Calculate max label length based on bar width
    const groupWidth = xScale.bandwidth();
    const maxLabelChars = Math.max(3, Math.floor(groupWidth / 8)); // ~8px per character at 13px font

    // X Axis with truncated labels (matching line chart style)
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call(g => g.select('.domain').remove());
    
    xAxis.selectAll('text')
      .attr('dy', 8)
      .attr('fill', '#374151')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '13px')
      .attr('font-weight', '400')
      .attr('letter-spacing', '0.1px')
      .attr('dominant-baseline', 'hanging')
      .attr('text-anchor', 'middle')
      .each(function() {
        const text = d3.select(this);
        const label = text.text();
        // Truncate labels to fit within bar width
        if (label.length > maxLabelChars) {
          text.text(label.substring(0, maxLabelChars - 1) + '..');
        }
      });

    // Y Axis (left side) - show min and max tick values
    const midTick = Math.round(yMax / 2 / 1000) * 1000;
    g.append('g')
      .call(
        d3.axisLeft(yScale)
          .tickValues([midTick, yMax - 5000])
          .tickFormat(d => `$${Math.round(Number(d) / 1000)}K`)
          .tickSize(0)
      )
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .attr('dx', -5)
      .attr('fill', '#374151')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '13px')
      .attr('font-weight', '400')
      .attr('letter-spacing', '0.1px');

  }, [data, categoryLabel, onBarClick]);

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        No data
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full" />
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
          <div className="bg-gray-900 text-white rounded-lg shadow-lg px-3 py-2 text-sm" style={{ minWidth: 'max-content' }}>
            <div className="font-medium text-white mb-1.5 text-sm">
              {tooltip.fullName}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: '#0a5736' }}
                />
                <span className="text-gray-400">Money In:</span>
                <span className="font-medium text-green-400">
                  ${tooltip.incoming.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: '#d03275' }}
                />
                <span className="text-gray-400">Money Out:</span>
                <span className="font-medium text-red-400">
                  –${tooltip.outgoing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
  );
};

// Chart View Toggle Component
interface ChartViewToggleProps {
  view: ChartView;
  onChange: (view: ChartView) => void;
}

const ChartViewToggle: React.FC<ChartViewToggleProps> = ({ view, onChange }) => {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
      <button
        onClick={() => onChange('scatter')}
        className={`
          px-2.5 py-1 text-[11px] font-medium rounded transition-all
          ${view === 'scatter' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'}
        `}
      >
        Scatter
      </button>
      <button
        onClick={() => onChange('line')}
        className={`
          px-2.5 py-1 text-[11px] font-medium rounded transition-all
          ${view === 'line' 
            ? 'bg-white text-gray-900 shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'}
        `}
      >
        Trend
      </button>
    </div>
  );
};

interface TransactionsChartsProps {
  transactions: Transaction[];
  /** Callback when hovering over a transaction in scatter plot */
  onTransactionHover?: (transactionId: string | null) => void;
  /** Callback when clicking a transaction in scatter plot */
  onTransactionClick?: (transactionId: string) => void;
  /** Callback when hovering over the line chart */
  onLineChartHover?: (data: LineChartHoverData | null) => void;
  /** Callback when clicking a bar in the bar chart */
  onBarChartClick?: (category: string, groupBy: GroupByOption) => void;
}

const TransactionsCharts: React.FC<TransactionsChartsProps> = ({ 
  transactions,
  onTransactionHover,
  onTransactionClick,
  onLineChartHover,
  onBarChartClick,
}) => {
  const [groupBy, setGroupBy] = useState<GroupByOption>('category');
  const [chartView, setChartView] = useState<ChartView>('scatter');

  // Memoize the aggregated data based on groupBy selection and transactions
  const barChartData = useMemo(() => {
    return aggregateByProperty(transactions, groupBy);
  }, [transactions, groupBy]);

  return (
    <div className="flex gap-0 h-[180px] w-full">
      {/* Main Chart Section (Scatter or Line) */}
      <div className="w-1/2 min-w-0 h-full flex flex-col">
        {/* Chart View Toggle */}
        <div className="flex items-center justify-end mb-2 pr-2">
          <ChartViewToggle view={chartView} onChange={setChartView} />
        </div>
        
        {/* Chart Content */}
        <div className="flex-1 min-h-0">
          {chartView === 'scatter' ? (
            <TransactionScatterPlot 
              data={transactions} 
              height={150}
              className="h-full"
              onTransactionHover={onTransactionHover}
              onTransactionClick={onTransactionClick}
            />
          ) : (
            <LineChartD3 transactions={transactions} onHover={onLineChartHover} />
          )}
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="w-1/2 border-l border-gray-100 pl-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <GroupByDropdown 
            value={groupBy} 
            onChange={setGroupBy} 
          />
        </div>
        <div className="flex-1">
          <BarChartD3 
            data={barChartData} 
            categoryLabel={groupByOptions.find(opt => opt.value === groupBy)?.label || 'Category'}
            onBarClick={(fullName) => {
              if (onBarChartClick) {
                onBarChartClick(fullName, groupBy);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionsCharts;
