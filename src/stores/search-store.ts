import { create } from 'zustand';

interface SearchStore {
  search: string;
  setSearch: (value: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  search: '',
  setSearch: (value) => set({ search: value }),
}));