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
import mixpanel from 'mixpanel-browser';
import { safeTrack } from '@/utils/analytics';
import './App.css';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize Mixpanel with error handling
    try {
      mixpanel.init("c5af23aadf294d488bddba30e20b48f7", {
        debug: false, // Set to false to reduce console noise
        track_pageview: true,
        persistence: "localStorage",
        api_host: "https://api-js.mixpanel.com" // Explicitly set API host
      });
      
      // Test if Mixpanel is working by checking if it can make requests
      try {
        safeTrack("App Loaded", {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        });
        console.log("Mixpanel initialized successfully");
      } catch (trackError) {
        console.warn("Mixpanel tracking failed, but initialization succeeded:", trackError);
        // Mixpanel is initialized but can't send data - this is common with ad blockers
      }
      
    } catch (error) {
      console.warn("Mixpanel failed to load, analytics disabled:", error);
      // App continues to work without analytics
    }
    
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
