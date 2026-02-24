import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStudioStore = create(
  persist(
    (set) => ({
      activeTab: 'current',
      isSidebarCollapsed: false,
      freeFormMode: false,
      librarySearchTerm: '',
      importHistory: [],
      customPackages: [],
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      
      toggleFreeFormMode: () => set((state) => ({ freeFormMode: !state.freeFormMode })),
      
      setLibrarySearchTerm: (term) => set({ librarySearchTerm: term }),
      
      addToImportHistory: (item) => set((state) => {
        const exists = state.importHistory.find(h => h.id === item.id);
        if (exists) return state;
        
        const newHistoryItem = {
          ...item,
          importedAt: new Date().toISOString(),
          itemCount: item.sentences?.length || item.data?.length || 0
        };
        
        return {
          importHistory: [newHistoryItem, ...state.importHistory]
        };
      }),
      
      removeFromImportHistory: (id) => set((state) => ({
        importHistory: state.importHistory.filter(h => h.id !== id)
      })),
      
      saveCustomPackage: (pkg) => set((state) => {
        const existingIndex = state.customPackages.findIndex(p => p.id === pkg.id);
        if (existingIndex >= 0) {
          const newPackages = [...state.customPackages];
          newPackages[existingIndex] = { ...pkg, updatedAt: new Date().toISOString() };
          return { customPackages: newPackages };
        }
        return {
          customPackages: [...state.customPackages, { ...pkg, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
        };
      }),

      deleteCustomPackage: (id) => set((state) => ({
        customPackages: state.customPackages.filter(p => p.id !== id)
      }))
    }),
    {
      name: 'studio-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        freeFormMode: state.freeFormMode,
        importHistory: state.importHistory,
        customPackages: state.customPackages
      })
    }
  )
);
