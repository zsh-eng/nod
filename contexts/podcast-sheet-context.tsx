import { createContext, useContext, useState } from 'react';

interface PodcastSheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PodcastSheetContext = createContext<PodcastSheetContextType | null>(null);

export function PodcastSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <PodcastSheetContext.Provider value={{ open, setOpen }}>
      {children}
    </PodcastSheetContext.Provider>
  );
}

export function usePodcastSheet() {
  const context = useContext(PodcastSheetContext);
  if (!context) {
    throw new Error('usePodcastSheet must be used within a PodcastSheetProvider');
  }
  return context;
} 