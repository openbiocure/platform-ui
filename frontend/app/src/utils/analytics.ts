import mixpanel from 'mixpanel-browser';

// Utility function for safe Mixpanel tracking
export const safeTrack = (event: string, properties?: Record<string, any>) => {
  try {
    if (mixpanel && typeof mixpanel.track === 'function') {
      mixpanel.track(event, properties);
    }
  } catch (error) {
    // Silently fail - analytics errors shouldn't break the app
    console.debug('Analytics tracking failed:', error);
  }
};

// Utility function for safe Mixpanel identify
export const safeIdentify = (distinctId: string) => {
  try {
    if (mixpanel && typeof mixpanel.identify === 'function') {
      mixpanel.identify(distinctId);
    }
  } catch (error) {
    console.debug('Analytics identify failed:', error);
  }
};

// Utility function for safe Mixpanel people set
export const safePeopleSet = (properties: Record<string, any>) => {
  try {
    if (mixpanel && typeof mixpanel.people?.set === 'function') {
      mixpanel.people.set(properties);
    }
  } catch (error) {
    console.debug('Analytics people set failed:', error);
  }
};

// Check if Mixpanel is available and working
export const isAnalyticsAvailable = (): boolean => {
  try {
    return !!(mixpanel && typeof mixpanel.track === 'function');
  } catch {
    return false;
  }
};
