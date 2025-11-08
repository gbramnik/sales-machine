import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  Layers,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePendingReviewCount } from '@/hooks/usePendingReviewCount';
import { NotificationBadge } from '@/components/atoms/NotificationBadge';
import { SkipLinks } from '@/components/accessibility/SkipLink';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Prospects',
    to: '/prospects',
    icon: Users,
  },
  {
    label: 'Review Queue',
    to: '/review-queue',
    icon: Inbox,
    hasBadge: true,
  },
  {
    label: 'Templates',
    to: '/templates',
    icon: Layers,
  },
  {
    label: 'Analytics',
    to: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: Settings,
  },
] as const;

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { count: pendingReviewCount } = usePendingReviewCount();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstNavItemRef = useRef<HTMLAnchorElement | null>(null);

  const content = children ?? <Outlet />;

  useEffect(() => {
    if (isSidebarOpen) {
      firstNavItemRef.current?.focus();
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <SkipLinks />
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-200 ease-in-out',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'lg:static lg:translate-x-0 lg:shadow-none'
          )}
          id="navigation"
          aria-label="Main navigation"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 lg:hidden">
              <span className="text-lg font-semibold">Sales Machine</span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden items-center px-6 py-6 lg:flex">
              <span className="text-2xl font-semibold tracking-tight">Sales Machine</span>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
              {NAV_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    ref={index === 0 ? firstNavItemRef : undefined}
                    className={({ isActive: navActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                        navActive || isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                  >
                    <Icon className={cn('h-5 w-5', isActive ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-700')} />
                    <span className="flex-1">{item.label}</span>
                    {item.hasBadge && (
                      <NotificationBadge count={pendingReviewCount} className="ml-auto" />
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 px-6 py-5">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <span className="text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">Authenticated</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not signed in</p>
              )}
            </div>
          </div>
        </div>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-30 lg:hidden"
            aria-hidden="true"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  ref={toggleButtonRef}
                  onClick={() => setIsSidebarOpen((open) => !open)}
                  className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 lg:hidden"
                  aria-expanded={isSidebarOpen}
                  aria-controls="navigation"
                  aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
                >
                  {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <p className="text-sm font-medium text-gray-500">
                  {NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Sales Machine'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {pendingReviewCount > 0 && (
                  <div className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 md:block">
                    {pendingReviewCount} reviews pending
                  </div>
                )}
                {user && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-7xl">{content}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

