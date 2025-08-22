import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkCurrentUser } from '@/store/slices/authSlice';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import ScholarDashboard from '@/components/scholar/ScholarDashboard';
import PublicationReviewAnalysis from '@/components/scholar/PublicationReviewAnalysis';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import OpenBioCureLoader from '@/components/ui/OpenBioCureLoader';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import './App.css';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check for existing user on mount
    dispatch(checkCurrentUser());
  }, [dispatch]);

  // Show loading while checking authentication
  if (isLoading) {
    return <OpenBioCureLoader fullPage={true} />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginForm /> : <Navigate to="/onboarding" replace />} />
      <Route path="/sign-up" element={!isAuthenticated ? <RegisterForm /> : <Navigate to="/onboarding" replace />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={isAuthenticated ? <ScholarDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/publication-review" element={isAuthenticated ? <PublicationReviewAnalysis /> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={isAuthenticated ? <ScholarDashboard /> : <Navigate to="/login" replace />} />
      <Route path="/onboarding" element={isAuthenticated ? <OnboardingFlow /> : <Navigate to="/login" replace />} />
      {/* Default redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AnalyticsProvider>
      <Router>
        <AppContent />
      </Router>
    </AnalyticsProvider>
  );
}

export default App;
