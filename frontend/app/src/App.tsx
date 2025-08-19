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
import mixpanel from "mixpanel-browser";
import './App.css';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize Mixpanel
    mixpanel.init("c5af23aadf294d488bddba30e20b48f7", {
      debug: true,
      track_pageview: true,
      persistence: "localStorage",
    });
    
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
      <Route path="/onboarding" element={isAuthenticated ? <OnboardingFlow /> : <Navigate to="/onboarding" replace />} />
      {/* Default redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
