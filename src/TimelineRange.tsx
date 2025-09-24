import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Scale } from './SegmentedControl';

export type ComparisonMode = 'Off' | 'PreviousPeriod' | 'PreviousYear';
export type TimeRange = { start: number; end: number }; // ms since epoch

export interface TimelineRangeProps {
  scale: Scale;
  startDate: Date;
  endDate: Date;
  valueStart: Date;
  valueEnd: Date;
  onChange: (nextStart: Date, nextEnd: Date) => void;
  onCommit?: (start: Date, end: Date) => void;
  height?: number;
  showMarker?: boolean;
  markerDate?: Date;
  maxDate?: Date;
  comparisonMode?: ComparisonMode;
  onSelectionChange?: (selection: TimeRange | null) => void;
  onComparisonChange?: (comparison: TimeRange | null, mode: ComparisonMode) => void;
}

// ======== Pure helpers ========
export function dateToPx(date: Date, railStart: Date, railEnd: Date, railPx: number): number {
  const totalMs = railEnd.getTime() - railStart.getTime();
  const dateMs = date.getTime() - railStart.getTime();
  return (dateMs / totalMs) * railPx;
}

export function pxToDate(px: number, railStart: Date, railEnd: Date, railPx: number): Date {
  const ratio = px / railPx;
  const totalMs = railEnd.getTime() - railStart.getTime();
  return new Date(railStart.getTime() + ratio * totalMs);
}

export function snap(date: Date, scale: Scale, edge: 'start' | 'end' = 'start'): Date {
  const d = new Date(date);
  if (scale === 'year' || scale === 'quarter') {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    if (edge === 'end' && d.getTime() < date.getTime()) {
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    d.setHours(0, 0, 0, 0);
    if (edge === 'end' && d.getTime() < date.getTime()) {
      d.setDate(d.getDate() + 1);
    }
  }
  return d;
}

export function clampRange(
  start: Date,
  end: Date,
  minUnit: 'month' | 'quarter' | 'week' | 'day',
  railStart: Date,
  railEnd: Date,
  maxDate?: Date
): [Date, Date] {
  const minMs = {
    day: 86400000,
    week: 604800000,
    month: 2592000000,
    quarter: 7776000000,
  }[minUnit];

  if (end.getTime() - start.getTime() < minMs) {
    end = new Date(start.getTime() + minMs);
  }
  if (start < railStart) {
    const diff = end.getTime() - start.getTime();
    start = railStart;
    end = new Date(start.getTime() + diff);
  }
  if (end > railEnd) {
    const diff = end.getTime() - start.getTime();
    end = railEnd;
    start = new Date(end.getTime() - diff);
  }
  
  // Clamp to maxDate (today) if provided
  if (maxDate && end > maxDate) {
    const diff = end.getTime() - start.getTime();
    end = maxDate;
    start = new Date(end.getTime() - diff);
    // Ensure start doesn't go before railStart
    if (start < railStart) {
      start = railStart;
      end = new Date(Math.min(start.getTime() + diff, maxDate.getTime()));
    }
  }
  
  return [start, end];
}

// Compute previous period (immediately before the selection)
function computePreviousPeriod(selection: TimeRange): TimeRange | null {
  const startDate = new Date(selection.start);
  const endDate = new Date(selection.end);
  
  // Calculate the duration of the current selection
  const duration = endDate.getTime() - startDate.getTime();
  
  // Previous period ends where current period starts, with same duration
  const prevEnd = new Date(startDate);
  const prevStart = new Date(startDate.getTime() - duration);
  
  return {
    start: prevStart.getTime(),
    end: prevEnd.getTime()
  };
}

// Compute previous year (same time frame but one year ago)
function computePreviousYear(selection: TimeRange): TimeRange | null {
  const startDate = new Date(selection.start);
  const endDate = new Date(selection.end);
  
  // Shift back one calendar year
  const prevStart = new Date(startDate);
  prevStart.setFullYear(prevStart.getFullYear() - 1);
  
  const prevEnd = new Date(endDate);
  prevEnd.setFullYear(prevEnd.getFullYear() - 1);
  
  // Handle Feb 29 -> Feb 28 edge case
  if (startDate.getMonth() === 1 && startDate.getDate() === 29 && prevStart.getDate() !== 29) {
    prevStart.setDate(28);
  }
  if (endDate.getMonth() === 1 && endDate.getDate() === 29 && prevEnd.getDate() !== 29) {
    prevEnd.setDate(28);
  }
  
  return {
    start: prevStart.getTime(),
    end: prevEnd.getTime()
  };
}

// Generate tick marks
function generateTicks(startDate: Date, endDate: Date, scale: Scale) {
  const ticks: { date: Date; type: 'minor' | 'major' | 'super' | 'month' | 'year'; label?: string }[] = [];
  const current = new Date(startDate);

  if (scale === 'year') {
    // Generate all months
    while (current <= endDate) {
      const month = current.getMonth();
      const isJanuary = month === 0;
      const isQuarterStart = month % 3 === 0;

      // Add month label
      ticks.push({ 
        date: new Date(current), 
        type: 'month', 
        label: current.toLocaleDateString('en-US', { month: 'short' }) 
      });

      // Add quarter label (separate from month)
      if (isQuarterStart && !isJanuary) {
        const q = Math.floor(month / 3) + 1;
        ticks.push({ date: new Date(current), type: 'major', label: `Q${q}` });
      }

      // Add year label (separate from month)
      if (isJanuary) {
        ticks.push({ date: new Date(current), type: 'year', label: current.getFullYear().toString() });
      }

      current.setMonth(current.getMonth() + 1);
    }
  } else if (scale === 'quarter') {
    // Show months at month boundaries
    while (current <= endDate) {
      if (current.getDate() === 1) {
        ticks.push({ 
          date: new Date(current), 
          type: 'month', 
          label: current.toLocaleDateString('en-US', { month: 'short' }) 
        });
      }
      current.setDate(current.getDate() + 7);
    }
  } else {
    // Month scale - show days (every 5th day for maximum spacing)
    let dayCount = 0;
    while (current <= endDate) {
      const isWeekStart = current.getDay() === 0;
      const showLabel = dayCount % 5 === 0; // Show every 5th day label for more spacing
      ticks.push({ 
        date: new Date(current), 
        type: isWeekStart ? 'major' : 'minor', 
        label: showLabel ? current.getDate().toString() : undefined
      });
      current.setDate(current.getDate() + 1);
      dayCount++;
    }
  }
  return ticks;
}

// Space out labels to avoid overlap
function filterBySpacing(points: { x: number; idx: number }[], minPx: number) {
  const keptIdx = new Set<number>();
  let lastX = -Infinity;
  for (const p of points) {
    if (p.x - lastX >= minPx) {
      keptIdx.add(p.idx);
      lastX = p.x;
    }
  }
  return keptIdx;
}

const TimelineRange: React.FC<TimelineRangeProps> = ({
  scale,
  startDate,
  endDate,
  valueStart,
  valueEnd,
  onChange,
  onCommit,
  height = 140,
  showMarker = false,
  markerDate = new Date(),
  maxDate,
  comparisonMode = 'Off',
  onSelectionChange,
  onComparisonChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [railWidth, setRailWidth] = useState(0);
  // State machine for drag interactions
  type DragState = 'idle' | 'draggingCreate' | 'draggingMove' | 'draggingResizeLeft' | 'draggingResizeRight';
  const [dragState, setDragState] = useState<DragState>('idle');
  const [dragStart, setDragStart] = useState({ x: 0, valueStart, valueEnd });
  
  // New selection creation state
  const [createStartPx, setCreateStartPx] = useState(0);
  const [createCurrentPx, setCreateCurrentPx] = useState(0);
  const [previewSelection, setPreviewSelection] = useState<{ start: Date; end: Date } | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isComparisonHovered, setIsComparisonHovered] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);
  
  const FINALIZE_THRESHOLD_PX = 4;
  const DEBUG_SELECTION = false;
  
  const dbg = useCallback((label: string, data?: unknown) => {
    if (!DEBUG_SELECTION) return;
    console.log(`[sel] ${label}`, data ?? '');
  }, []);


  // Resize observer for width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setRailWidth(containerRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Positions
  const selectionStartPx = useMemo(() => dateToPx(valueStart, startDate, endDate, railWidth), [valueStart, startDate, endDate, railWidth]);
  const selectionEndPx = useMemo(() => dateToPx(valueEnd, startDate, endDate, railWidth), [valueEnd, startDate, endDate, railWidth]);
  const markerPx = useMemo(() => (showMarker && markerDate ? dateToPx(markerDate, startDate, endDate, railWidth) : null), [showMarker, markerDate, startDate, endDate, railWidth]);

  // Compute comparison range
  const comparisonRange = useMemo(() => {
    if (comparisonMode === 'Off') return null;
    
    const selection: TimeRange = {
      start: valueStart.getTime(),
      end: valueEnd.getTime()
    };
    
    if (comparisonMode === 'PreviousPeriod') {
      const prev = computePreviousPeriod(selection);
      if (!prev) return null;
      
      // Clamp to timeline bounds
      const compStart = Math.max(prev.start, startDate.getTime());
      const compEnd = Math.min(prev.end, endDate.getTime());
      
      // Only return if there's a valid range within bounds
      if (compStart < compEnd) {
        return { start: compStart, end: compEnd };
      }
    } else if (comparisonMode === 'PreviousYear') {
      const prev = computePreviousYear(selection);
      if (!prev) return null;
      
      // Clamp to timeline bounds
      const compStart = Math.max(prev.start, startDate.getTime());
      const compEnd = Math.min(prev.end, endDate.getTime());
      
      // Only return if there's a valid range within bounds
      if (compStart < compEnd) {
        return { start: compStart, end: compEnd };
      }
    }
    
    return null;
  }, [comparisonMode, valueStart, valueEnd, startDate, endDate]);

  const comparisonStartPx = useMemo(() => 
    comparisonRange ? dateToPx(new Date(comparisonRange.start), startDate, endDate, railWidth) : 0,
    [comparisonRange, startDate, endDate, railWidth]
  );
  
  const comparisonEndPx = useMemo(() => 
    comparisonRange ? dateToPx(new Date(comparisonRange.end), startDate, endDate, railWidth) : 0,
    [comparisonRange, startDate, endDate, railWidth]
  );

  // Emit selection and comparison changes
  useEffect(() => {
    const selection: TimeRange = {
      start: valueStart.getTime(),
      end: valueEnd.getTime()
    };
    onSelectionChange?.(selection);
    dbg('Selection change', selection);
  }, [valueStart, valueEnd, onSelectionChange, dbg]);

  useEffect(() => {
    onComparisonChange?.(comparisonRange, comparisonMode);
    dbg('Comparison change', { comparisonRange, comparisonMode });
  }, [comparisonRange, comparisonMode, onComparisonChange, dbg]);

  // Ticks
  const ticks = useMemo(() => generateTicks(startDate, endDate, scale), [startDate, endDate, scale]);

  const minUnit = scale === 'year' ? 'month' : scale === 'quarter' ? 'quarter' : 'day';

  const localX = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, type: 'left' | 'right' | 'body') => {
    e.preventDefault();
    e.stopPropagation();
    dbg(`Handle ${type} drag start`);
    
    if (type === 'left') setDragState('draggingResizeLeft');
    else if (type === 'right') setDragState('draggingResizeRight');
    else setDragState('draggingMove');
    
    setDragStart({ x: e.clientX, valueStart, valueEnd });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [valueStart, valueEnd, dbg]);

  const handleBackgroundPointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    
    const clickX = localX(e);
    
    // Check if click is outside current selection (pixel-based)
    const isOutsideSelection = clickX < selectionStartPx || clickX > selectionEndPx;
    
    dbg('Background click', { clickX, isOutsideSelection, selectionStartPx, selectionEndPx });
    
    if (isOutsideSelection) {
      e.preventDefault();
      e.stopPropagation();
      
      // Start create flow
      dbg('Begin create');
      setDragState('draggingCreate');
      setCreateStartPx(clickX);
      setCreateCurrentPx(clickX);
      setPreviewSelection(null);
      
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [selectionStartPx, selectionEndPx, localX, dbg]);

  const updateCreatePreview = useCallback(() => {
    if (dragState !== 'draggingCreate') return;
    
    const startPx = Math.min(createStartPx, createCurrentPx);
    const endPx = Math.max(createStartPx, createCurrentPx);
    
    const newStartDate = pxToDate(startPx, startDate, endDate, railWidth);
    const newEndDate = pxToDate(endPx, startDate, endDate, railWidth);
    
    // Snap to boundaries
    const snappedStart = snap(newStartDate, scale, 'start');
    const snappedEnd = snap(newEndDate, scale, 'end');
    
    // Clamp to valid range
    const [clampedStart, clampedEnd] = clampRange(snappedStart, snappedEnd, minUnit, startDate, endDate, maxDate);
    
    dbg('Update preview', { startPx, endPx, clampedStart: clampedStart.toISOString(), clampedEnd: clampedEnd.toISOString() });
    setPreviewSelection({ start: clampedStart, end: clampedEnd });
  }, [dragState, createStartPx, createCurrentPx, startDate, endDate, railWidth, scale, minUnit, maxDate, dbg]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragState === 'idle') return;
    
    const currentX = localX(e);
    
    if (dragState === 'draggingCreate') {
      setCreateCurrentPx(currentX);
      
      // Show preview immediately on first movement
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          updateCreatePreview();
        });
      }
      
      e.preventDefault();
      return;
    }
    
    // Handle existing selection interactions
    if (dragState === 'draggingResizeLeft' || dragState === 'draggingResizeRight' || dragState === 'draggingMove') {
      const deltaX = e.clientX - dragStart.x;

      if (dragState === 'draggingResizeLeft') {
        const newPx = dateToPx(dragStart.valueStart, startDate, endDate, railWidth) + deltaX;
        const newDate = pxToDate(newPx, startDate, endDate, railWidth);
        const snapped = snap(newDate, scale, 'start');
        const [clampedStart] = clampRange(snapped, valueEnd, minUnit, startDate, endDate, maxDate);
        onChange(clampedStart, valueEnd);
      } else if (dragState === 'draggingResizeRight') {
        const newPx = dateToPx(dragStart.valueEnd, startDate, endDate, railWidth) + deltaX;
        const newDate = pxToDate(newPx, startDate, endDate, railWidth);
        const snapped = snap(newDate, scale, 'end');
        const [, clampedEnd] = clampRange(valueStart, snapped, minUnit, startDate, endDate, maxDate);
        onChange(valueStart, clampedEnd);
      } else if (dragState === 'draggingMove') {
        const duration = dragStart.valueEnd.getTime() - dragStart.valueStart.getTime();
        const newStartPx = dateToPx(dragStart.valueStart, startDate, endDate, railWidth) + deltaX;
        const newStartDate = pxToDate(newStartPx, startDate, endDate, railWidth);
        const snappedStart = snap(newStartDate, scale, 'start');
        const newEnd = new Date(snappedStart.getTime() + duration);
        const [clampedStart, clampedEnd] = clampRange(snappedStart, newEnd, minUnit, startDate, endDate, maxDate);
        onChange(clampedStart, clampedEnd);
      }
    }
  }, [dragState, dragStart, startDate, endDate, railWidth, scale, minUnit, valueStart, valueEnd, onChange, localX, updateCreatePreview]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dbg('Pointer up', { dragState });
    
    if (dragState === 'draggingCreate') {
      const delta = Math.abs(createCurrentPx - createStartPx);
      dbg('Finalize create', { delta, threshold: FINALIZE_THRESHOLD_PX, hasPreview: !!previewSelection });
      
      if (delta >= FINALIZE_THRESHOLD_PX && previewSelection) {
        // Finalize new selection - replace the old one entirely
        dbg('Committing new selection');
        onChange(previewSelection.start, previewSelection.end);
        if (onCommit) onCommit(previewSelection.start, previewSelection.end);
      } else {
        dbg('Discarding create (below threshold or no preview)');
      }
      
      // Clean up creation state
      setCreateStartPx(0);
      setCreateCurrentPx(0);
      setPreviewSelection(null);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    } else if (dragState !== 'idle' && onCommit) {
      // Handle existing selection interactions
      onCommit(valueStart, valueEnd);
    }
    
    setDragState('idle');
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [dragState, createStartPx, createCurrentPx, previewSelection, onChange, onCommit, valueStart, valueEnd, dbg, FINALIZE_THRESHOLD_PX]);

  const handleMouseEnter = useCallback(() => {
    // Show hover line when entering the timeline
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Hide hover line when leaving the timeline
    setHoverX(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Update hover line position during mouse movement (not dragging)
    if (dragState === 'idle') {
      const currentX = localX(e as any);
      
      // Check if mouse is over selected timeframe
      const isOverSelection = currentX >= selectionStartPx && currentX <= selectionEndPx;
      
      // Check if mouse is over comparison timeframe
      const isOverComparison = comparisonRange && 
        currentX >= comparisonStartPx && 
        currentX <= comparisonEndPx;
      
      // Hide hover line if over selection or comparison areas
      if (isOverSelection || isOverComparison) {
        setHoverX(null);
      } else {
        setHoverX(currentX);
      }
    }
  }, [dragState, localX, selectionStartPx, selectionEndPx, comparisonRange, comparisonStartPx, comparisonEndPx]);

  const handleComparisonMouseEnter = useCallback(() => {
    setIsComparisonHovered(true);
  }, []);

  const handleComparisonMouseLeave = useCallback(() => {
    setIsComparisonHovered(false);
  }, []);

  const handleRemoveComparison = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComparisonChange) {
      onComparisonChange(null, 'Off');
    }
  }, [onComparisonChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle Escape during new selection creation
    if (e.key === 'Escape' && dragState === 'draggingCreate') {
      dbg('Escape pressed - canceling create');
      setDragState('idle');
      setCreateStartPx(0);
      setCreateCurrentPx(0);
      setPreviewSelection(null);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }
    
    const stepMs = scale === 'year' ? 2592000000 : scale === 'quarter' ? 604800000 : 86400000;
    if (e.key === 'ArrowLeft') {
      if (e.altKey) {
        const newStart = new Date(valueStart.getTime() - stepMs);
        const [clampedStart] = clampRange(newStart, valueEnd, minUnit, startDate, endDate, maxDate);
        onChange(clampedStart, valueEnd);
      } else if (e.shiftKey) {
        const newEnd = new Date(valueEnd.getTime() - stepMs);
        const [, clampedEnd] = clampRange(valueStart, newEnd, minUnit, startDate, endDate, maxDate);
        onChange(valueStart, clampedEnd);
      } else {
        const newStart = new Date(valueStart.getTime() - stepMs);
        const newEnd = new Date(valueEnd.getTime() - stepMs);
        const [clampedStart, clampedEnd] = clampRange(newStart, newEnd, minUnit, startDate, endDate, maxDate);
        onChange(clampedStart, clampedEnd);
      }
    } else if (e.key === 'ArrowRight') {
      if (e.altKey) {
        const newStart = new Date(valueStart.getTime() + stepMs);
        const [clampedStart] = clampRange(newStart, valueEnd, minUnit, startDate, endDate, maxDate);
        onChange(clampedStart, valueEnd);
      } else if (e.shiftKey) {
        const newEnd = new Date(valueEnd.getTime() + stepMs);
        const [, clampedEnd] = clampRange(valueStart, newEnd, minUnit, startDate, endDate, maxDate);
        onChange(valueStart, clampedEnd);
      } else {
        const newStart = new Date(valueStart.getTime() + stepMs);
        const newEnd = new Date(valueEnd.getTime() + stepMs);
        const [clampedStart, clampedEnd] = clampRange(newStart, newEnd, minUnit, startDate, endDate, maxDate);
        onChange(clampedStart, clampedEnd);
      }
    }
  }, [scale, valueStart, valueEnd, minUnit, startDate, endDate, onChange]);

  // Decide which ticks provide bottom labels based on scale
  const bottomLabelTicks = useMemo(() => {
    // For year and quarter scales, show month labels; for month scale, show day labels
    const relevant = ticks.filter(t => {
      if (scale === 'year' || scale === 'quarter') {
        return t.type === 'month' && t.label;
      } else {
        // For day scale, only show ticks that have labels (every 5th day)
        return t.label !== undefined;
      }
    });
    
    // For yearly cadence, apply responsive filtering based on width
    if (scale === 'year' && railWidth > 0) {
      const points = relevant.map((t, idx) => ({ 
        x: dateToPx(t.date, startDate, endDate, railWidth), 
        idx, 
        tick: t 
      }));
      
      // Calculate minimum spacing based on container width
      const totalMonths = relevant.length;
      const avgSpacing = railWidth / totalMonths;
      
      let filteredPoints;
      if (avgSpacing < 40) {
        // Very tight - show every 3rd month (Jan, Apr, Jul, Oct)
        filteredPoints = points.filter((_, i) => i % 3 === 0);
      } else if (avgSpacing < 60) {
        // Moderately tight - show every 2nd month
        filteredPoints = points.filter((_, i) => i % 2 === 0);
      } else {
        // Plenty of space - show all months
        filteredPoints = points;
      }
      
      return filteredPoints.map(p => ({ t: p.tick, idx: p.idx, x: p.x }));
    }
    
    // For other scales, show all labels
    const points = relevant.map((t, idx) => ({ x: dateToPx(t.date, startDate, endDate, railWidth), idx }));
    return relevant.map((t, idx) => ({ t, idx, x: points[idx]?.x ?? 0 }));
  }, [ticks, scale, startDate, endDate, railWidth]);

  // Year labels for top
  const topLabelTicks = useMemo(() => {
    const relevant = ticks.filter(t => t.type === 'year' && t.label);
    const points = relevant.map((t, idx) => ({ x: dateToPx(t.date, startDate, endDate, railWidth), idx }));
    return relevant.map((t, idx) => ({ t, idx, x: points[idx]?.x ?? 0 }));
  }, [ticks, startDate, endDate, railWidth]);

  // Generate visual tick marks for the timeline
  const visualTicks = useMemo(() => {
    const tickList: { x: number; height: string; isMonth: boolean }[] = [];
    if (railWidth === 0) return tickList;
    
    const current = new Date(startDate);
    while (current <= endDate) {
      // Add month start tick (longer)
      tickList.push({
        x: dateToPx(current, startDate, endDate, railWidth),
        height: '4px',
        isMonth: true
      });
      
      // Add 3 weekly ticks within the month (shorter)
      for (let week = 1; week <= 3; week++) {
        const weekDate = new Date(current);
        weekDate.setDate(current.getDate() + (week * 7));
        if (weekDate.getMonth() === current.getMonth() && weekDate <= endDate) {
          tickList.push({
            x: dateToPx(weekDate, startDate, endDate, railWidth),
            height: '2px',
            isMonth: false
          });
        }
      }
      
      current.setMonth(current.getMonth() + 1);
    }
    return tickList;
  }, [startDate, endDate, railWidth]);

  return (
    <div
      ref={containerRef}
      className="relative bg-white cursor-crosshair select-none"
      style={{ 
        height,
        touchAction: 'none'
      }}
      onKeyDown={handleKeyDown}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      tabIndex={0}
      role="slider"
      aria-valuetext={`${valueStart.toLocaleDateString()} to ${valueEnd.toLocaleDateString()}`}
      data-state={dragState}
    >
      {/* Month labels - now above tick marks */}
      <div className="absolute left-0 right-0" style={{ bottom: '20px' }}>
        {bottomLabelTicks.map(({ t, x }, i) => {
          const isSelected = t.date >= valueStart && t.date < valueEnd;
          return (
            <div
              key={`label-${i}`}
              className={`absolute text-[10px] ${isSelected ? 'text-gray-700 font-medium' : 'text-gray-400'}`}
              style={{ left: `${x}px`, transform: 'translateX(-50%)' }}
              title={t.label}
            >
              {t.label}
            </div>
          );
        })}
      </div>

      {/* Tick marks - now below labels */}
      <div className="absolute left-0 right-0 bottom-0 h-4">
        {visualTicks.map((tick, i) => (
          <div
            key={`tick-${i}`}
            className="absolute bg-gray-300"
            style={{
              left: `${tick.x}px`,
              width: '1px',
              height: tick.height,
              bottom: '0'
            }}
          />
        ))}
      </div>

      {/* Today's date line - full height */}
      {markerPx !== null && (
        <div
          className="absolute pointer-events-none z-5"
          style={{
            left: `${markerPx}px`,
            width: '1px',
            top: '-16px', // Extend to full container height
            height: `calc(100% + 16px)`,
            backgroundColor: '#F4A267'
          }}
        />
      )}

      {/* Hover line - follows mouse cursor */}
      {hoverX !== null && dragState === 'idle' && (
        <>
          <div
            className="absolute pointer-events-none z-1"
            style={{
              left: `${hoverX}px`,
              width: '1px',
              top: '-16px',
              height: `calc(100% + 16px)`,
              backgroundColor: '#D1D5DB' // Light gray
            }}
          />
          {/* Hover date label */}
          <div
            className="absolute pointer-events-none z-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            style={{
              left: `${hoverX}px`,
              top: `calc(100% + 4px)`, // Position below the timeline border
              transform: 'translateX(-50%)', // Center the label on the hover line
            }}
          >
            {pxToDate(hoverX, startDate, endDate, railWidth).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </>
      )}

      {/* Comparison overlay - gray box below primary selection */}
      {comparisonRange && (
        <div
          className="absolute"
          style={{
            left: `${comparisonStartPx}px`,
            width: `${comparisonEndPx - comparisonStartPx}px`,
            top: '-16px',
            height: `calc(100% + 16px)`,
            background: 'rgba(0, 0, 0, 0.08)',
            border: '1px solid #9CA3AF',
            borderRadius: '6px',
            zIndex: 1,
          }}
          onMouseEnter={handleComparisonMouseEnter}
          onMouseLeave={handleComparisonMouseLeave}
        >
          {/* Comparison label */}
          <div className="absolute top-1 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded font-medium pointer-events-none">
            {new Date(comparisonRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(comparisonRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          
          {/* X button to remove comparison - only show on hover */}
          {isComparisonHovered && (
            <button
              className="absolute bg-white hover:bg-gray-100 rounded-full shadow-sm border border-gray-300 flex items-center justify-center cursor-pointer"
              style={{
                width: '16px',
                height: '16px',
                top: '8px',
                right: '8px',
                fontSize: '10px',
                lineHeight: '1'
              }}
              onClick={handleRemoveComparison}
              title="Remove comparison"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Current selection - always visible unless creating new one */}
      {dragState !== 'draggingCreate' && (
        <div
          className="absolute cursor-grab active:cursor-grabbing"
          style={{
            left: `${selectionStartPx}px`,
            width: `${selectionEndPx - selectionStartPx}px`,
            top: '-16px',
            height: `calc(100% + 16px)`,
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1.5px solid #3B82F6',
            borderRadius: '6px',
            zIndex: 2,
          }}
          onPointerDown={(e) => handlePointerDown(e, 'body')}
        >
          {/* Date range label */}
          <div className="absolute top-1 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
            {valueStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {valueEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>

          {/* Resize handles */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[5px] h-6 bg-blue-50 cursor-ew-resize rounded-sm border-[1.5px] border-blue-500"
            style={{ left: '-2.5px' }}
            onPointerDown={(e) => handlePointerDown(e, 'left')}
            aria-label="Resize start"
          />
          
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[5px] h-6 bg-blue-50 cursor-ew-resize rounded-sm border-[1.5px] border-blue-500"
            style={{ right: '-2.5px' }}
            onPointerDown={(e) => handlePointerDown(e, 'right')}
            aria-label="Resize end"
          />
        </div>
      )}

      {/* Preview selection during creation */}
      {dragState === 'draggingCreate' && previewSelection && (
        <div
          className="absolute cursor-crosshair pointer-events-none"
          style={{
            left: `${dateToPx(previewSelection.start, startDate, endDate, railWidth)}px`,
            width: `${dateToPx(previewSelection.end, startDate, endDate, railWidth) - dateToPx(previewSelection.start, startDate, endDate, railWidth)}px`,
            top: '-16px',
            height: `calc(100% + 16px)`,
            background: 'rgba(59, 130, 246, 0.12)',
            border: '1.5px solid #3B82F6',
            borderRadius: '6px',
          }}
        >
          {/* Date range label for preview */}
          <div className="absolute top-1 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
            {previewSelection.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {previewSelection.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      )}

      {/* Top labels (years) - positioned above */}
      <div className="absolute left-0 right-0 top-0">
        {topLabelTicks.map(({ t, x }, i) => (
          <div
            key={`year-${i}`}
            className="absolute text-[11px] text-gray-600 font-medium"
            style={{ left: `${x}px`, transform: 'translateX(-50%)' }}
          >
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineRange;
