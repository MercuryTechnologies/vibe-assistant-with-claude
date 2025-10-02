# Quick Start - Timeline Chart Binding

## ⚡ 1-Minute Setup

```bash
cd mercury-insights
npm install
npm start
```

Visit: `http://localhost:3000`

## 🎯 What to Test

### 1. Drag Timeline (Preview Only)
- **Action**: Click and drag the blue selection
- **Expected**: Timeline moves, **chart stays frozen**
- **Why**: Chart only updates on commit, not during drag

### 2. Release Mouse (Commit)
- **Action**: Release the mouse button
- **Expected**: **Chart updates** to show data for selected range
- **Why**: This is the "commit" event

### 3. Keyboard Navigation
- **Action**: Focus timeline, press `←` or `→` arrow keys
- **Expected**: Timeline adjusts, chart stays frozen
- **Action**: Press `Enter`
- **Expected**: **Chart updates**

### 4. Empty Range
- **Action**: Drag to select a future date with no data
- **Expected**: Chart shows "No data in the selected range" message

## 📊 Architecture in 30 Seconds

```
Timeline Drag → onChange (preview) → Local state only
                                      ↓
                                  (chart does NOT update)

Timeline Release → onCommit → Store update → Chart re-renders
```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/store.ts` | Zustand store (committed range) |
| `src/CashFlowBarChart.tsx` | Original D3 chart (receives filtered data) |
| `src/utils.ts` | Filter/aggregate utilities |
| `src/App.tsx` | Wires everything together |

## 💡 How It Works

1. **TimelineRange** component handles dragging
   - `onChange` fires during drag (preview only)
   - `onCommit` fires on release (commits to store)

2. **Zustand Store** holds the committed range
   - `timeRange: DateRange | null`
   - Only updates on commit, not during drag

3. **App.tsx** filters data and passes to chart
   - Uses `useTimeRangeStore(s => s.timeRange)` to get committed range
   - Filters data with `aggregateMonthly()`
   - Passes filtered data to **CashFlowBarChart** (original D3 chart)
   - Chart re-renders only when committed range changes

## 🎨 Visual Feedback

| State | Timeline | Chart |
|-------|----------|-------|
| Dragging | ✅ Updates live | ❌ Stays frozen |
| Released | ✅ Final position | ✅ Re-renders |
| Keyboard nav | ✅ Adjusts | ❌ Waits for Enter |
| Press Enter | ✅ Stays in place | ✅ Re-renders |

## 📝 Code Snippet

```typescript
// App.tsx integration
const setCommittedTimeRange = useTimeRangeStore(s => s.setTimeRange);

const handleCommit = (start: Date, end: Date) => {
  // This triggers chart update
  setCommittedTimeRange({ start, end });
};

<TimelineRange
  onChange={handleChange}    // Preview only
  onCommit={handleCommit}    // Commits to store
/>

<CashFlowBarChart data={chartData} height={500} />
```

## 🐛 Quick Debug

**Problem**: Chart updates during drag  
**Solution**: Ensure `onChange` does NOT call `setCommittedTimeRange`

**Problem**: Chart never updates  
**Solution**: Ensure `onCommit` DOES call `setCommittedTimeRange`

**Problem**: Chart empty on load  
**Solution**: Initialize store in `useEffect` with default range

## 🎓 Next Steps

- Read `README_TIMELINE_BINDING.md` for full documentation
- Read `DEMO_TIMELINE_CHART_BINDING.md` for implementation details
- Explore `src/utils.ts` for utility functions
- Check `src/store.ts` for state management

---

**That's it!** You now have a timeline that binds to a chart with commit-on-release behavior. 🎉

