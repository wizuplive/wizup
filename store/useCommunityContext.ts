import { create } from "zustand";

type CommunityContextState = {
  activeCommunityId: string | null;
  setActiveCommunityId: (id: string | null) => void;
};

export const useCommunityContext = create<CommunityContextState>((set) => ({
  activeCommunityId: null,
  setActiveCommunityId: (id) => set({ activeCommunityId: id }),
}));