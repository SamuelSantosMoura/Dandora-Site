import { create } from 'zustand';

const useStore = create((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
  
  isDM: false,
  setIsDM: (isDM) => set({ isDM }),
  
  currentTool: 'select', // select, draw, ruler, fog
  setCurrentTool: (tool) => set({ currentTool: tool }),
  
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
  updateToken: (id, newProps) => set((state) => ({
    tokens: state.tokens.map(token => token.id === id ? { ...token, ...newProps } : token)
  })),
  
  mapImage: null,
  setMapImage: (mapImage) => set({ mapImage }),
}));

export default useStore;
