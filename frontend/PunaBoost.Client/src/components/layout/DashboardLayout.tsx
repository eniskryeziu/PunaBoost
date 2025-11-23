import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import Navbar from './Navbar';
import { useSidebar } from '@/contexts/SidebarContext';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: Array<{
    label: string;
    path: string;
    icon: ReactNode;
  }>;
}

export default function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  const location = useLocation();
  const { setSidebarItems } = useSidebar();

  useEffect(() => {
    setSidebarItems(sidebarItems);
  }, [sidebarItems, setSidebarItems]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden md:block w-64 flex-shrink-0">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

