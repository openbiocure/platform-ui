import { useContext, useCallback, useEffect } from 'react';
import { AnalyticsContext } from '../contexts/AnalyticsContext';

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context.analytics;
};

export const usePageTracking = (pageName: string, properties: Record<string, any> = {}) => {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView(pageName, properties);
  }, [pageName, properties, analytics]);

  return analytics;
};

export const useEventTracking = () => {
  const analytics = useAnalytics();

  const trackEvent = useCallback((
    eventName: string,
    properties: Record<string, any> = {},
    category: string = 'general'
  ) => {
    analytics.track(eventName, properties, category);
  }, [analytics]);

  const trackAction = useCallback((
    actionName: string,
    elementType: string,
    elementId: string,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackAction(actionName, elementType, elementId, properties);
  }, [analytics]);

  const trackPerformance = useCallback((
    metricName: string,
    value: number,
    properties: Record<string, any> = {}
  ) => {
    analytics.trackPerformance(metricName, value, properties);
  }, [analytics]);

  const trackError = useCallback((
    error: Error,
    context: Record<string, any> = {}
  ) => {
    analytics.trackError(error, context);
  }, [analytics]);

  return { 
    trackEvent, 
    trackAction, 
    trackPerformance, 
    trackError 
  };
};

export const useAnalyticsStats = () => {
  const analytics = useAnalytics();
  
  const getStats = useCallback(() => {
    return analytics.getStats();
  }, [analytics]);

  return { getStats };
};

// Custom hook for component lifecycle tracking
export const useComponentTracking = (componentName: string) => {
  const { trackEvent } = useEventTracking();

  useEffect(() => {
    trackEvent('component_mounted', {
      component_name: componentName,
      mount_time: Date.now()
    }, 'lifecycle');

    return () => {
      trackEvent('component_unmounted', {
        component_name: componentName,
        unmount_time: Date.now()
      }, 'lifecycle');
    };
  }, [componentName, trackEvent]);
};

// Custom hook for form tracking
export const useFormTracking = (formName: string) => {
  const { trackEvent } = useEventTracking();

  const trackFormStart = useCallback(() => {
    trackEvent('form_started', {
      form_name: formName,
      start_time: Date.now()
    }, 'form');
  }, [formName, trackEvent]);

  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    trackEvent('form_submitted', {
      form_name: formName,
      success,
      errors: errors || [],
      submit_time: Date.now()
    }, 'form');
  }, [formName, trackEvent]);

  const trackFieldInteraction = useCallback((fieldName: string, action: string) => {
    trackEvent('field_interaction', {
      form_name: formName,
      field_name: fieldName,
      action,
      interaction_time: Date.now()
    }, 'form');
  }, [formName, trackEvent]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldInteraction
  };
};

// Custom hook for navigation tracking
export const useNavigationTracking = () => {
  const { trackEvent } = useEventTracking();

  const trackNavigation = useCallback((
    fromPath: string,
    toPath: string,
    method: 'click' | 'browser' | 'programmatic' = 'click'
  ) => {
    trackEvent('navigation', {
      from_path: fromPath,
      to_path: toPath,
      navigation_method: method,
      navigation_time: Date.now()
    }, 'navigation');
  }, [trackEvent]);

  const trackExternalLink = useCallback((url: string, context?: string) => {
    trackEvent('external_link_click', {
      url,
      context,
      click_time: Date.now()
    }, 'navigation');
  }, [trackEvent]);

  return {
    trackNavigation,
    trackExternalLink
  };
};
