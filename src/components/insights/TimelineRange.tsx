import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type Scale = 'month' | 'quarter' | 'year';
export type ComparisonMode = 'Off' | 'PreviousPeriod' | 'PreviousYear';
export type TimeRange = { start: number; end: number };

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

export function snap(date: Date, _scale: Scale, edge: 'start' | 'end' = 'start'): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (edge === 'end' && d.getTime() < date.getTime()) {
    d.setDate(d.getDate() + 1);
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
  
  if (maxDate && end > maxDate) {
    const diff = end.getTime() - start.getTime();
    end = maxDate;
    start = new Date(end.getTime() - diff);
    if (start < railStart) {
      start = railStart;
      end = new Date(Math.min(start.getTime() + diff, maxDate.getTime()));
    }
  }
  
  return [start, end];
}

function computePreviousPeriod(selection: TimeRange): TimeRange | null {
  const startDate = new Date(selection.start);
  const endDate = new Date(selection.end);
  const duration = endDate.getTime() - startDate.getTime();
  const prevEnd = new Date(startDate);
  const prevStart = new Date(startDate.getTime() - duration);
  
  return { start: prevStart.getTime(), end: prevEnd.getTime() };
}

function computePreviousYear(selection: TimeRange): TimeRange | null {
  const startDate = new Date(selection.start);
  const endDate = new Date(selection.end);
  
  const prevStart = new Date(startDate);
  prevStart.setFullYear(prevStart.getFullYear() - 1);
  
  const prevEnd = new Date(endDate);
  prevEnd.setFullYear(prevEnd.getFullYear() - 1);
  
  if (startDate.getMonth() === 1 && startDate.getDate() === 29 && prevStart.getDate() !== 29) {
    prevStart.setDate(28);
  }
  if (endDate.getMonth() === 1 && endDate.getDate() === 29 && prevEnd.getDate() !== 29) {
    prevEnd.setDate(28);
  }
  
  return { start: prevStart.getTime(), end: prevEnd.getTime() };
}

function generateTicks(startDate: Date, endDate: Date, scale: Scale) {
  const ticks: { date: Date; type: 'minor' | 'major' | 'super' | 'month' | 'year'; label?: string }[] = [];
  const current = new Date(startDate);

  if (scale === 'year') {
    while (current <= endDate) {
      const month = current.getMonth();
      const isJanuary = month === 0;
      const isQuarterStart = month % 3 === 0;

      ticks.push({ 
        date: new Date(current), 
        type: 'month', 
        label: current.toLocaleDateString('en-US', { month: 'short' }) 
      });

      if (isQuarterStart && !isJanuary) {
        const q = Math.floor(month / 3) + 1;
        ticks.push({ date: new Date(current), type: 'major', label: `Q${q}` });
      }

      if (isJanuary) {
        ticks.push({ date: new Date(current), type: 'year', label: current.getFullYear().toString() });
      }

      current.setMonth(current.getMonth() + 1);
    }
  } else if (scale === 'quarter') {
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
    let dayCount = 0;
    while (current <= endDate) {
      const isWeekStart = current.getDay() === 0;
      const showLabel = dayCount % 5 === 0;
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
  type DragState = 'idle' | 'draggingCreate' | 'draggingMove' | 'draggingResizeLeft' | 'draggingResizeRight';
  const [dragState, setDragState] = useState<DragState>('idle');
  const [dragStart, setDragStart] = useState({ x: 0, valueStart, valueEnd });
  const [createStartPx, setCreateStartPx] = useState(0);
  const [createCurrentPx, setCreateCurrentPx] = useState(0);
  const [previewSelection, setPreviewSelection] = useState<{ start: Date; end: Date } | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isComparisonHovered, setIsComparisonHovered] = useState<boolean>(false);
  const rafRef = useRef<number | null>(null);
  
  const FINALIZE_THRESHOLD_PX = 4;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) setRailWidth(containerRef.current.offsetWidth);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const selectionStartPx = useMemo(() => dateToPx(valueStart, startDate, endDate, railWidth), [valueStart, startDate, endDate, railWidth]);
  const selectionEndPx = useMemo(() => dateToPx(valueEnd, startDate, endDate, railWidth), [valueEnd, startDate, endDate, railWidth]);
  const markerPx = useMemo(() => (showMarker && markerDate ? dateToPx(markerDate, startDate, endDate, railWidth) : null), [showMarker, markerDate, startDate, endDate, railWidth]);

  const comparisonRange = useMemo(() => {
    if (comparisonMode === 'Off') return null;
    
    const selection: TimeRange = { start: valueStart.getTime(), end: valueEnd.getTime() };
    
    if (comparisonMode === 'PreviousPeriod') {
      const prev = computePreviousPeriod(selection);
      if (!prev) return null;
      const compStart = Math.max(prev.start, startDate.getTime());
      const compEnd = Math.min(prev.end, endDate.getTime());
      if (compStart < compEnd) return { start: compStart, end: compEnd };
    } else if (comparisonMode === 'PreviousYear') {
      const prev = computePreviousYear(selection);
      if (!prev) return null;
      const compStart = Math.max(prev.start, startDate.getTime());
      const compEnd = Math.min(prev.end, endDate.getTime());
      if (compStart < compEnd) return { start: compStart, end: compEnd };
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

  useEffect(() => {
    const selection: TimeRange = { start: valueStart.getTime(), end: valueEnd.getTime() };
    onSelectionChange?.(selection);
  }, [valueStart, valueEnd, onSelectionChange]);

  useEffect(() => {
    onComparisonChange?.(comparisonRange, comparisonMode);
  }, [comparisonRange, comparisonMode, onComparisonChange]);

  const ticks = useMemo(() => generateTicks(startDate, endDate, scale), [startDate, endDate, scale]);
  const minUnit = 'day' as const;

  const localX = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, type: 'left' | 'right' | 'body') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'left') setDragState('draggingResizeLeft');
    else if (type === 'right') setDragState('draggingResizeRight');
    else setDragState('draggingMove');
    
    setDragStart({ x: e.clientX, valueStart, valueEnd });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [valueStart, valueEnd]);

  const handleBackgroundPointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;
    
    const clickX = localX(e);
    const isOutsideSelection = clickX < selectionStartPx || clickX > selectionEndPx;
    
    if (isOutsideSelection) {
      e.preventDefault();
      e.stopPropagation();
      setDragState('draggingCreate');
      setCreateStartPx(clickX);
      setCreateCurrentPx(clickX);
      setPreviewSelection(null);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [selectionStartPx, selectionEndPx, localX]);

  const updateCreatePreview = useCallback(() => {
    if (dragState !== 'draggingCreate') return;
    
    const startPx = Math.min(createStartPx, createCurrentPx);
    const endPx = Math.max(createStartPx, createCurrentPx);
    
    const newStartDate = pxToDate(startPx, startDate, endDate, railWidth);
    const newEndDate = pxToDate(endPx, startDate, endDate, railWidth);
    
    const snappedStart = snap(newStartDate, scale, 'start');
    const snappedEnd = snap(newEndDate, scale, 'end');
    const [clampedStart, clampedEnd] = clampRange(snappedStart, snappedEnd, minUnit, startDate, endDate, maxDate);
    
    setPreviewSelection({ start: clampedStart, end: clampedEnd });
  }, [dragState, createStartPx, createCurrentPx, startDate, endDate, railWidth, scale, minUnit, maxDate]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragState === 'idle') return;
    
    const currentX = localX(e);
    
    if (dragState === 'draggingCreate') {
      setCreateCurrentPx(currentX);
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          updateCreatePreview();
        });
      }
      e.preventDefault();
      return;
    }
    
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
  }, [dragState, dragStart, startDate, endDate, railWidth, scale, minUnit, valueStart, valueEnd, onChange, localX, updateCreatePreview, maxDate]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragState === 'draggingCreate') {
      const delta = Math.abs(createCurrentPx - createStartPx);
      
      if (delta >= FINALIZE_THRESHOLD_PX && previewSelection) {
        onChange(previewSelection.start, previewSelection.end);
        if (onCommit) onCommit(previewSelection.start, previewSelection.end);
      }
      
      setCreateStartPx(0);
      setCreateCurrentPx(0);
      setPreviewSelection(null);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    } else if (dragState !== 'idle' && onCommit) {
      onCommit(valueStart, valueEnd);
    }
    
    setDragState('idle');
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [dragState, createStartPx, createCurrentPx, previewSelection, onChange, onCommit, valueStart, valueEnd, FINALIZE_THRESHOLD_PX]);

  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragState === 'idle') {
      const currentX = localX(e);
      const isOverSelection = currentX >= selectionStartPx && currentX <= selectionEndPx;
      const isOverComparison = comparisonRange && currentX >= comparisonStartPx && currentX <= comparisonEndPx;
      
      if (isOverSelection || isOverComparison) {
        setHoverX(null);
      } else {
        setHoverX(currentX);
      }
    }
  }, [dragState, localX, selectionStartPx, selectionEndPx, comparisonRange, comparisonStartPx, comparisonEndPx]);

  const handleComparisonMouseEnter = useCallback(() => setIsComparisonHovered(true), []);
  const handleComparisonMouseLeave = useCallback(() => setIsComparisonHovered(false), []);

  const handleRemoveComparison = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComparisonChange) onComparisonChange(null, 'Off');
  }, [onComparisonChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && dragState === 'draggingCreate') {
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
  }, [scale, valueStart, valueEnd, minUnit, startDate, endDate, onChange, dragState, maxDate]);

  const bottomLabelTicks = useMemo(() => {
    const relevant = ticks.filter(t => {
      if (scale === 'year' || scale === 'quarter') return t.type === 'month' && t.label;
      return t.label !== undefined;
    });
    const points = relevant.map((t, idx) => ({ x: dateToPx(t.date, startDate, endDate, railWidth), idx }));
    return relevant.map((t, idx) => ({ t, idx, x: points[idx]?.x ?? 0 }));
  }, [ticks, scale, startDate, endDate, railWidth]);

  const topLabelTicks = useMemo(() => {
    const relevant = ticks.filter(t => t.type === 'year' && t.label);
    const points = relevant.map((t, idx) => ({ x: dateToPx(t.date, startDate, endDate, railWidth), idx }));
    return relevant.map((t, idx) => ({ t, idx, x: points[idx]?.x ?? 0 }));
  }, [ticks, startDate, endDate, railWidth]);

  const visualTicks = useMemo(() => {
    const tickList: { x: number; height: string; isMonth: boolean }[] = [];
    if (railWidth === 0) return tickList;
    
    const current = new Date(startDate);
    while (current <= endDate) {
      tickList.push({ x: dateToPx(current, startDate, endDate, railWidth), height: '4px', isMonth: true });
      
      for (let week = 1; week <= 3; week++) {
        const weekDate = new Date(current);
        weekDate.setDate(current.getDate() + (week * 7));
        if (weekDate.getMonth() === current.getMonth() && weekDate <= endDate) {
          tickList.push({ x: dateToPx(weekDate, startDate, endDate, railWidth), height: '2px', isMonth: false });
        }
      }
      current.setMonth(current.getMonth() + 1);
    }
    return tickList;
  }, [startDate, endDate, railWidth]);

  return (
    <div
      ref={containerRef}
      className="timeline-range-container"
      style={{ height, touchAction: 'none', overflowX: 'clip' }}
      onKeyDown={handleKeyDown}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      tabIndex={0}
      role="slider"
      aria-valuenow={Math.round((valueStart.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime()) * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${valueStart.toLocaleDateString()} to ${valueEnd.toLocaleDateString()}`}
      data-state={dragState}
    >
      {/* Month labels */}
      <div className="absolute left-0 right-0" style={{ bottom: 20 }}>
        {bottomLabelTicks.map(({ t, x }, i) => {
          const isSelected = t.date >= valueStart && t.date < valueEnd;
          return (
            <div
              key={`label-${i}`}
              className="timeline-tick-label"
              data-selected={isSelected}
              style={{ left: x, transform: 'translateX(-50%)' }}
              title={t.label}
            >
              {t.label}
            </div>
          );
        })}
      </div>

      {/* Tick marks */}
      <div className="absolute left-0 right-0 bottom-0" style={{ height: 16 }}>
        {visualTicks.map((tick, i) => (
          <div
            key={`tick-${i}`}
            className="timeline-tick-mark"
            style={{ left: tick.x, height: tick.height }}
          />
        ))}
      </div>

      {/* Today marker */}
      {markerPx !== null && (
        <div className="timeline-today-marker" style={{ left: markerPx }} />
      )}

      {/* Hover line */}
      {hoverX !== null && dragState === 'idle' && (
        <>
          <div className="timeline-hover-line" style={{ left: hoverX }} />
          <div className="timeline-hover-label" style={{ left: hoverX }}>
            {pxToDate(hoverX, startDate, endDate, railWidth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </>
      )}

      {/* Comparison overlay */}
      {comparisonRange && (
        <div
          className="timeline-comparison-box"
          style={{ left: comparisonStartPx, width: comparisonEndPx - comparisonStartPx }}
          onMouseEnter={handleComparisonMouseEnter}
          onMouseLeave={handleComparisonMouseLeave}
        >
          <div className="timeline-comparison-label">
            {new Date(comparisonRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(comparisonRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          
          {isComparisonHovered && (
            <button className="timeline-comparison-remove" onClick={handleRemoveComparison} title="Remove comparison">×</button>
          )}
        </div>
      )}

      {/* Current selection */}
      {dragState !== 'draggingCreate' && (
        <div
          className="timeline-selection-box"
          style={{ left: selectionStartPx, width: selectionEndPx - selectionStartPx }}
          onPointerDown={(e) => handlePointerDown(e, 'body')}
        >
          <div className="timeline-selection-label">
            {valueStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {valueEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>

          <div className="timeline-resize-handle left" style={{ left: -2.5 }} onPointerDown={(e) => handlePointerDown(e, 'left')} aria-label="Resize start" />
          <div className="timeline-resize-handle right" style={{ right: -2.5 }} onPointerDown={(e) => handlePointerDown(e, 'right')} aria-label="Resize end" />
        </div>
      )}

      {/* Preview selection during creation */}
      {dragState === 'draggingCreate' && previewSelection && (
        <div
          className="timeline-selection-box preview"
          style={{
            left: dateToPx(previewSelection.start, startDate, endDate, railWidth),
            width: dateToPx(previewSelection.end, startDate, endDate, railWidth) - dateToPx(previewSelection.start, startDate, endDate, railWidth),
          }}
        >
          <div className="timeline-selection-label">
            {previewSelection.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {previewSelection.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      )}

      {/* Year labels */}
      <div className="absolute left-0 right-0 top-0">
        {topLabelTicks.map(({ t, x }, i) => (
          <div key={`year-${i}`} className="timeline-year-label" style={{ left: x, transform: 'translateX(-50%)' }}>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineRange;
