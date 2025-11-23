import { createContext, useContext, useState, type ReactNode } from 'react';

interface SidebarItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface SidebarContextType {
  sidebarItems: SidebarItem[];
  setSidebarItems: (items: SidebarItem[]) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

  return (
    <SidebarContext.Provider value={{ sidebarItems, setSidebarItems }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    return { sidebarItems: [], setSidebarItems: () => {} };
  }
  return context;
}

