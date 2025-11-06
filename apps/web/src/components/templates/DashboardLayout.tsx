import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { usePendingReviewCount } from '@/hooks/usePendingReviewCount';
import { NotificationBadge } from '@/components/atoms/NotificationBadge';
import { FileText } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuthStore();
  const { count: pendingReviewCount } = usePendingReviewCount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">Sales Machine</h1>
              <nav className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/review-queue"
                  className="relative text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Review Queue
                  <NotificationBadge count={pendingReviewCount} className="absolute -top-1 -right-1" />
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-700">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

