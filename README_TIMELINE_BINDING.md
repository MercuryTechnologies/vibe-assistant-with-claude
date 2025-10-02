# Timeline-to-Chart Binding Feature

## Overview

This feature implements a draggable timeline range selector that binds to a cash flow chart with **commit-on-release** behavior. The chart only updates when the user releases the mouse/touch, not during drag operations.

## 🎯 Key Requirements Met

✅ **Commit-on-Release**: Chart updates only after pointer release, not during drag  
✅ **Live Preview**: Timeline shows visual feedback while dragging  
✅ **Zustand State Management**: Global store for committed time range  
✅ **D3 Integration**: Uses existing D3-based stacked bar chart  
✅ **Performance**: Memoized selectors prevent unnecessary renders  
✅ **Keyboard Accessibility**: Full keyboard navigation support  
✅ **Edge Cases**: Handles inverted ranges, bounds clamping, empty states  

## 📁 Files Added/Modified

### New Files
- `src/store.ts` - Zustand store for committed time range
- `src/utils.ts` - Utility functions (clamp, aggregate, sample data)
- `DEMO_TIMELINE_CHART_BINDING.md` - Complete implementation guide

### Modified Files
- `src/App.tsx` - Integration logic for store and components
- `src/CashFlowBarChart.tsx` - Original D3 chart (receives filtered data)

### Existing Files (Unchanged)
- `src/TimelineRange.tsx` - Already had `onCommit` support

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

The required packages are already installed:
- `zustand` - State management
- `d3` - Charting library (already in use)

### Run the App

```bash
npm start
```

Visit `http://localhost:3000` to see the feature in action.

## 🎮 How to Use

### Mouse/Touch Interaction

1. **Drag the blue selection area** - Timeline updates in real-time (preview)
2. **Release the mouse/touch** - Chart commits and re-renders with filtered data
3. **Drag the left/right handles** - Resize the selection
4. **Click outside selection** - Create new selection

### Keyboard Interaction

- `←/→` Arrow keys - Move selection by 1 day
- `Shift + ←/→` - Move selection by 1 month
- `Enter` - Commit current preview to chart
- `Escape` - Cancel new selection creation

## 🏗️ Architecture

```
User Interaction
      ↓
TimelineRange Component
  ├── onChange (preview) → Local state only
  └── onCommit (release) → Updates Zustand store
              ↓
      Zustand Store (committed range)
              ↓
          App.tsx
      └── Subscribes to committed range
      └── Filters & aggregates data
              ↓
      CashFlowBarChart (D3)
      └── Receives filtered data
      └── Re-renders chart
```

### State Separation

**Preview State (Local)**
- Lives in `TimelineRange` component
- Updates during drag operations
- NOT visible to chart

**Committed State (Global)**
- Lives in Zustand store
- Updates only on pointer release
- Triggers chart re-render

## 📊 Data Flow Example

```typescript
// 1. User drags timeline
TimelineRange.onChange(newPreview)  // Chart does NOT update

// 2. User releases pointer
TimelineRange.onCommit(finalRange)
    ↓
App.handleCommit(finalRange)
    ↓
store.setTimeRange(finalRange)     // Committed!
    ↓
CashFlowChart re-renders            // Chart updates!
```

## 🔍 Code Examples

### Using the Store

```typescript
import { useTimeRangeStore } from './store';

function MyComponent() {
  // Read committed range
  const timeRange = useTimeRangeStore(s => s.timeRange);
  
  // Update committed range
  const setTimeRange = useTimeRangeStore(s => s.setTimeRange);
  
  const handleCommit = (start: Date, end: Date) => {
    setTimeRange({ start, end });
  };
}
```

### Filtering Data

```typescript
import { aggregateMonthly } from './utils';

const data = [...]; // Daily records
const timeRange = { start: new Date('2025-01-01'), end: new Date('2025-06-30') };

const monthly = aggregateMonthly(data, timeRange);
// Returns: [{ month: "2025-01", moneyIn: 5000, moneyOut: 3000 }, ...]
```

## 🎨 Visual Design

### Timeline
- **Selected Range**: Blue highlight (`#3B82F6`, 12% opacity)
- **Border**: Solid blue (`#3B82F6`, 1.5px)
- **Handles**: Blue circles with border
- **Label**: White text on blue background

### Chart
- **Money In**: Blue bars (`#3b82f6`)
- **Money Out**: Dark indigo bars (`#1e1b4b`)
- **Grid**: Subtle gray dotted lines
- **Empty State**: Centered message with icon

## 🧪 Testing

### Manual Test Cases

#### Test 1: Drag without commit
1. Click and drag the blue selection
2. Observe: Timeline moves, chart stays unchanged
3. Release pointer
4. Observe: Chart updates to new range

#### Test 2: Keyboard navigation
1. Focus the timeline (click or tab)
2. Press arrow keys to adjust range
3. Observe: Timeline moves, chart unchanged
4. Press Enter
5. Observe: Chart updates

#### Test 3: Empty range
1. Drag to select a future date range with no data
2. Release pointer
3. Observe: Chart shows "No data in selected range"

#### Test 4: Range reversal
1. Drag left handle past right handle
2. Release pointer
3. Observe: Range auto-corrects (start <= end)

#### Test 5: Out of bounds
1. Try to drag selection beyond data boundaries
2. Observe: Selection is clamped to valid range

## ⚡ Performance Considerations

### Optimizations Applied

1. **Memoized Aggregation**
   ```typescript
   const monthly = React.useMemo(() => 
     aggregateMonthly(data, timeRange),
     [data, timeRange]
   );
   ```

2. **Selective Store Subscription**
   ```typescript
   // Only subscribes to committed range, not preview
   const timeRange = useTimeRangeStore(s => s.timeRange);
   ```

3. **Efficient Date Filtering**
   ```typescript
   // Uses timestamp comparison (numbers) instead of Date objects
   const filtered = data.filter(r => {
     const t = new Date(r.date).getTime();
     return t >= start && t <= end;
   });
   ```

4. **Delayed Loading State**
   - Shows loading indicator for minimum 200ms
   - Prevents flicker on fast updates

## 🐛 Edge Cases Handled

| Case | Behavior |
|------|----------|
| Inverted range (start > end) | Auto-swapped on commit |
| Out of bounds selection | Clamped to data min/max |
| Empty result set | Shows empty state message |
| Very fast dragging | Throttled with RAF |
| Keyboard spam | Debounced updates |
| Null/undefined range | Shows all data |

## 🔒 Accessibility Features

- ✅ `role="slider"` on timeline selection
- ✅ `aria-valuetext` with readable dates ("Jan 1 – Sep 22, 2025")
- ✅ Keyboard navigation (arrows, Enter, Escape)
- ✅ Focus indicators on interactive elements
- ✅ Screen reader announcements
- ✅ Sufficient color contrast

## 📈 Sample Data

The demo includes 18 months of realistic cash flow data:
- **Start Date**: January 1, 2024
- **End Date**: June 2025 (~550 days)
- **Pattern**: Sinusoidal variation + weekly/bi-weekly spikes
- **Range**: $200-$1,000 per day typical, up to $1,800 on spike days

## 🛠️ Utility Functions

### `clampRange(range, minDate, maxDate)`
Ensures a date range stays within bounds and start <= end.

### `aggregateMonthly(data, range)`
Filters daily records by date range and aggregates into monthly buckets.

### `generateSampleData()`
Creates 18 months of realistic cash flow data for demo.

## 🔄 State Management

### Store Structure

```typescript
type TimeRangeStore = {
  timeRange: DateRange | null;      // { start: Date, end: Date }
  setTimeRange: (r: DateRange | null) => void;
}
```

### Store Benefits

- **Single source of truth** for committed range
- **Automatic re-renders** when range changes
- **DevTools support** (Zustand integrates with React DevTools)
- **Time-travel debugging** (can be added easily)

## 📝 API Reference

### Component Props

#### CashFlowBarChart (D3 Chart)
```typescript
interface Props {
  data?: CashFlowData[];
  width?: number;
  height?: number;
}

type CashFlowData = {
  month: string;    // Short month name (e.g., "Jan")
  moneyIn: number;  // Positive number
  moneyOut: number; // Negative number (for D3 chart)
}
```

#### TimelineRange (existing)
```typescript
interface Props {
  valueStart: Date;
  valueEnd: Date;
  onChange: (start: Date, end: Date) => void;     // Fires during drag
  onCommit?: (start: Date, end: Date) => void;    // Fires on release
  // ... other props
}
```

## 🚨 Common Issues

### Chart not updating
**Cause**: `onCommit` not wired to store update  
**Fix**: Ensure `handleCommit` calls `setCommittedTimeRange`

### Chart updates during drag
**Cause**: `onChange` is updating the store  
**Fix**: Only update store in `onCommit`, not `onChange`

### Performance issues
**Cause**: Re-aggregating on every render  
**Fix**: Wrap `aggregateMonthly` in `useMemo`

### Empty chart on load
**Cause**: Store not initialized  
**Fix**: Set initial range in `useEffect` on mount

## 🎓 Learning Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Recharts Documentation](https://recharts.org/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Pointer Events API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## 📜 License

MIT (same as parent project)

## 🤝 Contributing

1. Test with different date ranges
2. Test keyboard navigation
3. Test on mobile/touch devices
4. Check accessibility with screen readers
5. Verify performance with large datasets

---

**Questions?** Check `DEMO_TIMELINE_CHART_BINDING.md` for detailed implementation guide.

