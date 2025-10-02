import { create } from "zustand";

export type DateRange = { start: Date; end: Date };

type TimeRangeStore = {
  timeRange: DateRange | null;
  setTimeRange: (r: DateRange | null) => void;
};

export const useTimeRangeStore = create<TimeRangeStore>((set) => ({
  timeRange: null,
  setTimeRange: (r) => set({ timeRange: r }),
}));

