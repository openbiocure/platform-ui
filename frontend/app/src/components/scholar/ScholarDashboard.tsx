import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageTracking, useEventTracking } from '../../hooks/useAnalytics';
import { ScholarDashboardSkeleton } from './ScholarDashboardSkeleton';
import { ScholarHomeDashboard } from './ScholarHomeDashboard';
import ScholarProfile from '../dashboard/ScholarProfile';
import AppLayout from '../layout/AppLayout';

const ScholarDashboard: React.FC = () => {
  // Analytics tracking
  usePageTracking('scholar_dashboard');
  const { trackEvent, trackAction } = useEventTracking();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

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
          {location.pathname === '/profile' ? (
            <ScholarProfile />
          ) : (
            <ScholarHomeDashboard />
          )}
        </>
      )}
    </AppLayout>
  );
};

export default ScholarDashboard;
