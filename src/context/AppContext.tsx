import React, { createContext, useContext, useState } from 'react';
import type { AppState } from '../types';
import { mockData } from '../data/mockData';

const AppContext = createContext<{
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
} | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(mockData);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
