import { create } from "zustand";

export interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  error: string | null;
  isPopupOpen: boolean;
  selectedMovie: any | null;

  setQuery: (q: string) => void;
  setResults: (data: any[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  openPopup: () => void;
  closePopup: () => void;
  selectMovie: (movie: any) => void;
  clearSelectedMovie: () => void;
  reset: () => void;
}

const initialState = {
  query: "",
  results: [],
  isLoading: false,
  error: null,
  isPopupOpen: false,
  selectedMovie: null,
};

export const useSearchStore = create<SearchState>((set) => ({
  ...initialState,

  setQuery: (q) => set({ query: q, isPopupOpen: q.length > 0 }),
  setResults: (data) => set({ results: data }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
  openPopup: () => set({ isPopupOpen: true }),
  closePopup: () => set({ isPopupOpen: false }),
  selectMovie: (movie) => set({ selectedMovie: movie, isPopupOpen: false }),
  clearSelectedMovie: () => set({ selectedMovie: null }),
  reset: () => set(initialState),
}));
