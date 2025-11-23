import { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, setCredentials } from '@/store/slices/authSlice';
import { getInitials, enrichUserWithName } from '@/utils/userUtils';
import { useSidebar } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Briefcase, Building2, Shield, Menu } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const { sidebarItems } = useSidebar();

  // Enrich user data if missing name information
  useEffect(() => {
    const enrichUser = async () => {
      if (isAuthenticated && user && token) {
        // Don't enrich Admin users
        if (user.role === 'Admin') {
          return;
        }

        // Check if we need to enrich (missing firstName/lastName for candidates or companyName for companies)
        const needsEnrichment =
          (user.role === 'Candidate' && (!user.firstName || !user.lastName)) ||
          (user.role === 'Company' && !user.companyName);

        if (needsEnrichment) {
          // Add a small delay to ensure token is fully set in axios instance
          await new Promise(resolve => setTimeout(resolve, 100));

          try {
            const enrichedUser = await enrichUserWithName(user);
            // Only update if we got new data
            if (
              (user.role === 'Candidate' && (enrichedUser.firstName || enrichedUser.lastName)) ||
              (user.role === 'Company' && enrichedUser.companyName) ||
              enrichedUser.name
            ) {
              dispatch(setCredentials({ user: enrichedUser, token }));
            }
          } catch (error) {
            // Silently fail - user data enrichment is optional
            console.error('Failed to enrich user:', error);
          }
        }
      }
    };
    enrichUser();
  }, [isAuthenticated, user?.email, user?.role, token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (!user) return null;
    if (user.role === 'Admin') return <Shield className="h-4 w-4" />;
    if (user.role === 'Company') return <Building2 className="h-4 w-4" />;
    return <Briefcase className="h-4 w-4" />;
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PunaBoost</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/jobs" className="hidden sm:block">
                  <Button variant="ghost" size="sm">Browse Jobs</Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                {/* Mobile Menu - Sidebar Links */}
                {sidebarItems.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="md:hidden">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                        return (
                          <DropdownMenuItem key={item.path} asChild>
                            <Link
                              to={item.path}
                              className={cn(
                                'flex items-center gap-2 cursor-pointer',
                                isActive && 'bg-accent'
                              )}
                            >
                              {item.icon}
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <ModeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user?.name || user?.companyName || user?.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getRoleIcon()}
                          <span>{user?.role}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

