import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ScholarDashboardSkeleton } from './ScholarDashboardSkeleton';
import { ScholarHomeDashboard } from './ScholarHomeDashboard';
import ScholarProfile from '../dashboard/ScholarProfile';
import AppLayout from '../layout/AppLayout';

const ScholarDashboard: React.FC = () => {
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
