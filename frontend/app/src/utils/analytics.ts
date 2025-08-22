// OpenBioCure Self-Hosted Analytics Types
export interface AnalyticsEvent {
  event_id: string;
  tenant_id: string;
  user_id: string;
  session_id: string;
  event_name: string;
  event_category: string;
  properties: Record<string, any>;
  timestamp: number;
  page_url: string;
  referrer: string;
  user_agent: string;
  device_info: DeviceInfo;
  correlation_id: string;
}

export interface DeviceInfo {
  screen_width: number;
  screen_height: number;
  viewport_width: number;
  viewport_height: number;
  device_type: 'desktop' | 'tablet' | 'mobile';
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  language: string;
  timezone: string;
}

export interface AnalyticsConfig {
  endpoint: string;
  websocket_url: string;
  batch_size: number;
  flush_interval: number;
  max_retries: number;
  enable_debug: boolean;
  tenant_id: string;
  user_id: string;
}

// Utility functions for device detection
export const getDeviceType = (): 'desktop' | 'tablet' | 'mobile' => {
  const width = window.innerWidth;
  if (width >= 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
};

export const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

export const getBrowserVersion = (): string => {
  const userAgent = navigator.userAgent;
  const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
  return match ? match[2] : 'Unknown';
};

export const getOSInfo = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

export const getOSVersion = (): string => {
  const userAgent = navigator.userAgent;
  const match = userAgent.match(/(Windows NT|Mac OS X|Linux|Android|iOS)\/?([\d.]+)?/);
  return match ? (match[2] || 'Unknown') : 'Unknown';
};

export const getDeviceInfo = (): DeviceInfo => {
  return {
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    device_type: getDeviceType(),
    browser: getBrowserInfo(),
    browser_version: getBrowserVersion(),
    os: getOSInfo(),
    os_version: getOSVersion(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

export const generateCorrelationId = (): string => {
  return crypto.randomUUID();
};