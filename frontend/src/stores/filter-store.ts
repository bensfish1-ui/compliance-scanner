import { create } from "zustand";

interface FilterState {
  search: string;
  status: string[];
  category: string[];
  country: string[];
  impactLevel: string[];
  priority: string[];
  dateFrom: string | null;
  dateTo: string | null;
  setSearch: (search: string) => void;
  setStatus: (status: string[]) => void;
  setCategory: (category: string[]) => void;
  setCountry: (country: string[]) => void;
  setImpactLevel: (level: string[]) => void;
  setPriority: (priority: string[]) => void;
  setDateRange: (from: string | null, to: string | null) => void;
  clearAll: () => void;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  search: "",
  status: [],
  category: [],
  country: [],
  impactLevel: [],
  priority: [],
  dateFrom: null,
  dateTo: null,
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setCategory: (category) => set({ category }),
  setCountry: (country) => set({ country }),
  setImpactLevel: (impactLevel) => set({ impactLevel }),
  setPriority: (priority) => set({ priority }),
  setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
  clearAll: () =>
    set({
      search: "",
      status: [],
      category: [],
      country: [],
      impactLevel: [],
      priority: [],
      dateFrom: null,
      dateTo: null,
    }),
  hasActiveFilters: () => {
    const state = get();
    return (
      state.search !== "" ||
      state.status.length > 0 ||
      state.category.length > 0 ||
      state.country.length > 0 ||
      state.impactLevel.length > 0 ||
      state.priority.length > 0 ||
      state.dateFrom !== null ||
      state.dateTo !== null
    );
  },
}));
