import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { OpenBioCureAnalytics } from '../services/analytics';
import { AnalyticsConfig } from '../utils/analytics';

interface AnalyticsContextType {
  analytics: OpenBioCureAnalytics;
  isInitialized: boolean;
}

export const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  config?: Partial<AnalyticsConfig>;
}

// Helper function to get current user info
const getCurrentUserInfo = () => {
  try {
    const userStr = localStorage.getItem('openbiocure_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      user_id: user?.id || 'anonymous',
      tenant_id: user?.tenant_id || 'default'
    };
  } catch {
    return {
      user_id: 'anonymous', 
      tenant_id: 'default'
    };
  }
};

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const analyticsRef = useRef<OpenBioCureAnalytics | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        const userInfo = getCurrentUserInfo();
        
        const defaultConfig: AnalyticsConfig = {
          endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT || 'http://localhost:8000/api/v1/analytics',
          websocket_url: process.env.REACT_APP_ANALYTICS_WS || 'ws://localhost:8002/ws/analytics',
          batch_size: 50,
          flush_interval: 30000, // 30 seconds
          max_retries: 3,
          enable_debug: process.env.NODE_ENV === 'development',
          tenant_id: userInfo.tenant_id,
          user_id: userInfo.user_id,
          ...config
        };

        analyticsRef.current = new OpenBioCureAnalytics(defaultConfig);
        await analyticsRef.current.initialize();
        
        setIsInitialized(true);
        console.log('✅ OpenBioCure Analytics initialized successfully');

        // Track app initialization
        analyticsRef.current.track('app_initialized', {
          environment: process.env.NODE_ENV || 'development',
          user_agent: navigator.userAgent,
          timestamp: Date.now()
        }, 'application');

      } catch (error) {
        console.error('❌ Failed to initialize analytics:', error);
        setIsInitialized(false);
      }
    };

    initializeAnalytics();

    return () => {
      if (analyticsRef.current) {
        analyticsRef.current.destroy();
      }
    };
  }, [config]);

  // Update user context when authentication changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'openbiocure_user' && analyticsRef.current) {
        const userInfo = getCurrentUserInfo();
        // Re-initialize with new user context
        analyticsRef.current.destroy();
        
        const newConfig: AnalyticsConfig = {
          endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT || 'http://localhost:8000/api/v1/analytics',
          websocket_url: process.env.REACT_APP_ANALYTICS_WS || 'ws://localhost:8002/ws/analytics',
          batch_size: 50,
          flush_interval: 30000,
          max_retries: 3,
          enable_debug: process.env.NODE_ENV === 'development',
          tenant_id: userInfo.tenant_id,
          user_id: userInfo.user_id,
          ...config
        };

        analyticsRef.current = new OpenBioCureAnalytics(newConfig);
        analyticsRef.current.initialize();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [config]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (analyticsRef.current) {
        analyticsRef.current.track('page_visibility_change', {
          visibility_state: document.visibilityState,
          timestamp: Date.now()
        }, 'application');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Track unload event
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (analyticsRef.current) {
        analyticsRef.current.track('app_unload', {
          timestamp: Date.now(),
          session_duration: Date.now() - (performance.timing?.navigationStart || Date.now())
        }, 'application');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track performance metrics
  useEffect(() => {
    if (analyticsRef.current && 'performance' in window) {
      const trackPerformanceMetrics = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          analyticsRef.current?.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
          analyticsRef.current?.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          analyticsRef.current?.trackPerformance('first_paint', navigation.responseStart - navigation.fetchStart);
        }
      };

      // Track after page load
      if (document.readyState === 'complete') {
        trackPerformanceMetrics();
      } else {
        window.addEventListener('load', trackPerformanceMetrics);
      }
    }
  }, [isInitialized]);

  // Global error tracking
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (analyticsRef.current) {
        analyticsRef.current.trackError(new Error(event.message), {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: 'window.onerror'
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (analyticsRef.current) {
        analyticsRef.current.trackError(
          new Error(`Unhandled Promise Rejection: ${event.reason}`),
          {
            source: 'unhandledrejection',
            reason: event.reason
          }
        );
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (!analyticsRef.current) {
    return <>{children}</>;
  }

  return (
    <AnalyticsContext.Provider value={{ 
      analytics: analyticsRef.current, 
      isInitialized 
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
