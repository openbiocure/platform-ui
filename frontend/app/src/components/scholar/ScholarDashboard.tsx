import React, { useEffect, useState } from 'react';
import { ScholarDashboardSkeleton } from './ScholarDashboardSkeleton';
import { ScholarHomeDashboard } from './ScholarHomeDashboard';
import ScholarProfile from '../dashboard/ScholarProfile';
import AppLayout from '../layout/AppLayout';

const ScholarDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AppLayout>
      {isLoading ? (
        <ScholarDashboardSkeleton />
      ) : (
        <>
          {currentView === 'dashboard' ? (
            <ScholarHomeDashboard />
          ) : (
            <ScholarProfile />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default ScholarDashboard;
