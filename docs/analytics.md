# 📊 Self-Hosted Analytics Architecture

## Overview
OpenBioCure implements a self-hosted analytics solution that provides Mixpanel-like functionality while maintaining complete data ownership and privacy. The system uses localStorage for client-side data collection, WebSocket for real-time transmission, and batch processing for reliable data delivery.

## 🏗️ Architecture Overview

### **System Components**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Analytics     │    │   Data          │
│   (React App)   │◄──►│   Service       │◄──►│   Warehouse     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   localStorage  │    │   WebSocket     │    │   PostgreSQL    │
│   (Offline)     │    │   (Real-time)   │    │   (Analytics)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Data Flow**
1. **Client Collection**: Events stored in localStorage
2. **Real-time Push**: WebSocket for immediate transmission
3. **Batch Processing**: Fallback for offline/queued events
4. **Data Processing**: Server-side aggregation and analysis
5. **Storage**: PostgreSQL with time-series optimization

## 🔧 Frontend Implementation

### **Analytics Service (TypeScript)**
```typescript
interface AnalyticsEvent {
  event_id: string;           // UUID v4
  tenant_id: string;          // Tenant identifier
  user_id: string;            // User identifier
  session_id: string;         // Session identifier
  event_name: string;         // Event name (e.g., 'page_view', 'button_click')
  event_category: string;     // Event category (e.g., 'navigation', 'interaction')
  properties: Record<string, any>; // Custom properties
  timestamp: number;          // Unix timestamp
  page_url: string;           // Current page URL
  referrer: string;           // Referrer URL
  user_agent: string;         // Browser user agent
  device_info: DeviceInfo;    // Device information
  correlation_id: string;     // Request correlation ID
}

interface DeviceInfo {
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

interface AnalyticsConfig {
  endpoint: string;           // Analytics service endpoint
  websocket_url: string;      // WebSocket endpoint
  batch_size: number;         // Batch size for offline events
  flush_interval: number;     // Flush interval in milliseconds
  max_retries: number;        // Maximum retry attempts
  enable_debug: boolean;      // Enable debug logging
  tenant_id: string;          // Current tenant ID
  user_id: string;            // Current user ID
}
```

### **LocalStorage Management**
```typescript
class LocalStorageManager {
  private readonly STORAGE_KEY = 'obc_analytics_events';
  private readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly MAX_EVENTS = 10000;

  // Store event in localStorage
  storeEvent(event: AnalyticsEvent): void {
    try {
      const events = this.getStoredEvents();
      events.push(event);
      
      // Cleanup if storage is full
      if (events.length > this.MAX_EVENTS) {
        events.splice(0, events.length - this.MAX_EVENTS);
      }
      
      // Check storage size
      const storageSize = JSON.stringify(events).length;
      if (storageSize > this.MAX_STORAGE_SIZE) {
        // Remove oldest events until under limit
        while (events.length > 0 && storageSize > this.MAX_STORAGE_SIZE) {
          events.shift();
        }
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  // Retrieve stored events
  getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve stored events:', error);
      return [];
    }
  }

  // Clear stored events
  clearStoredEvents(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear stored events:', error);
    }
  }

  // Get storage usage statistics
  getStorageStats(): { eventCount: number; storageSize: number } {
    const events = this.getStoredEvents();
    const storageSize = JSON.stringify(events).length;
    return { eventCount: events.length, storageSize };
  }
}
```

### **WebSocket Connection Manager**
```typescript
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventQueue: AnalyticsEvent[] = [];

  constructor(
    private url: string,
    private onMessage: (data: any) => void,
    private onError: (error: Event) => void
  ) {}

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('Analytics WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushEventQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Analytics WebSocket disconnected');
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Analytics WebSocket error:', error);
        this.onError(error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  // Send event via WebSocket
  sendEvent(event: AnalyticsEvent): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(event));
        return true;
      } catch (error) {
        console.error('Failed to send event via WebSocket:', error);
        this.eventQueue.push(event);
        return false;
      }
    } else {
      this.eventQueue.push(event);
      return false;
    }
  }

  // Flush queued events
  private flushEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  // Heartbeat to keep connection alive
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      setTimeout(() => this.connect(), delay);
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

### **Batch Processing Manager**
```typescript
class BatchProcessor {
  private batch: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private config: AnalyticsConfig,
    private localStorageManager: LocalStorageManager,
    private websocketManager: WebSocketManager
  ) {}

  // Add event to batch
  addEvent(event: AnalyticsEvent): void {
    // Try WebSocket first
    if (this.websocketManager.sendEvent(event)) {
      return; // Successfully sent via WebSocket
    }

    // Add to batch if WebSocket failed
    this.batch.push(event);
    
    // Store in localStorage as backup
    this.localStorageManager.storeEvent(event);

    // Schedule flush if batch is full or timer is set
    if (this.batch.length >= this.config.batch_size) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.config.flush_interval);
    }
  }

  // Flush batch to server
  async flush(): Promise<void> {
    if (this.isProcessing || this.batch.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      // Clear timer
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
        this.flushTimer = null;
      }

      // Get events to send
      const eventsToSend = [...this.batch];
      this.batch = [];

      // Send batch to server
      await this.sendBatch(eventsToSend);

      // Clear from localStorage on successful send
      this.clearFromLocalStorage(eventsToSend);

    } catch (error) {
      console.error('Failed to flush batch:', error);
      
      // Restore events to batch for retry
      this.batch.unshift(...this.batch);
      
      // Schedule retry
      setTimeout(() => this.flush(), this.config.flush_interval);
    } finally {
      this.isProcessing = false;
    }
  }

  // Send batch to server
  private async sendBatch(events: AnalyticsEvent[]): Promise<void> {
    const response = await fetch(`${this.config.endpoint}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'X-Tenant-ID': this.config.tenant_id,
        'X-Correlation-ID': this.generateCorrelationId(),
      },
      body: JSON.stringify({
        events,
        batch_id: this.generateBatchId(),
        timestamp: Date.now(),
        tenant_id: this.config.tenant_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  // Clear events from localStorage after successful send
  private clearFromLocalStorage(events: AnalyticsEvent[]): void {
    const storedEvents = this.localStorageManager.getStoredEvents();
    const eventIds = new Set(events.map(e => e.event_id));
    
    const remainingEvents = storedEvents.filter(e => !eventIds.has(e.event_id));
    
    if (remainingEvents.length !== storedEvents.length) {
      localStorage.setItem('obc_analytics_events', JSON.stringify(remainingEvents));
    }
  }

  private getAuthToken(): string {
    // Get auth token from your auth system
    return localStorage.getItem('auth_token') || '';
  }

  private generateCorrelationId(): string {
    return crypto.randomUUID();
  }

  private generateBatchId(): string {
    return crypto.randomUUID();
  }

  // Process offline events from localStorage
  async processOfflineEvents(): Promise<void> {
    const storedEvents = this.localStorageManager.getStoredEvents();
    
    if (storedEvents.length === 0) {
      return;
    }

    console.log(`Processing ${storedEvents.length} offline events`);

    // Process in chunks to avoid overwhelming the server
    const chunkSize = this.config.batch_size;
    for (let i = 0; i < storedEvents.length; i += chunkSize) {
      const chunk = storedEvents.slice(i, i + chunkSize);
      
      try {
        await this.sendBatch(chunk);
        this.clearFromLocalStorage(chunk);
      } catch (error) {
        console.error(`Failed to process offline events chunk ${i}-${i + chunkSize}:`, error);
        break; // Stop processing on error
      }
    }
  }
}
```

### **Main Analytics Service**
```typescript
class OpenBioCureAnalytics {
  private localStorageManager: LocalStorageManager;
  private websocketManager: WebSocketManager;
  private batchProcessor: BatchProcessor;
  private config: AnalyticsConfig;
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.localStorageManager = new LocalStorageManager();
    this.websocketManager = new WebSocketManager(
      config.websocket_url,
      this.handleWebSocketMessage.bind(this),
      this.handleWebSocketError.bind(this)
    );
    this.batchProcessor = new BatchProcessor(
      config,
      this.localStorageManager,
      this.websocketManager
    );
  }

  // Initialize analytics service
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Connect WebSocket
      this.websocketManager.connect();

      // Process any offline events
      await this.batchProcessor.processOfflineEvents();

      // Set up periodic offline event processing
      setInterval(() => {
        this.batchProcessor.processOfflineEvents();
      }, 5 * 60 * 1000); // Every 5 minutes

      this.isInitialized = true;
      console.log('OpenBioCure Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  // Track event
  track(
    eventName: string,
    properties: Record<string, any> = {},
    category: string = 'general'
  ): void {
    const event: AnalyticsEvent = {
      event_id: crypto.randomUUID(),
      tenant_id: this.config.tenant_id,
      user_id: this.config.user_id,
      session_id: this.getSessionId(),
      event_name: eventName,
      event_category: category,
      properties,
      timestamp: Date.now(),
      page_url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      device_info: this.getDeviceInfo(),
      correlation_id: this.generateCorrelationId(),
    };

    this.batchProcessor.addEvent(event);
  }

  // Track page view
  trackPageView(pageName: string, properties: Record<string, any> = {}): void {
    this.track('page_view', {
      page_name: pageName,
      page_title: document.title,
      page_url: window.location.href,
      referrer: document.referrer,
      ...properties,
    }, 'navigation');
  }

  // Track user action
  trackAction(
    actionName: string,
    elementType: string,
    elementId: string,
    properties: Record<string, any> = {}
  ): void {
    this.track('user_action', {
      action_name: actionName,
      element_type: elementType,
      element_id: elementId,
      ...properties,
    }, 'interaction');
  }

  // Track performance metrics
  trackPerformance(metricName: string, value: number, properties: Record<string, any> = {}): void {
    this.track('performance_metric', {
      metric_name: metricName,
      metric_value: value,
      ...properties,
    }, 'performance');
  }

  // Track error
  trackError(error: Error, context: Record<string, any> = {}): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    }, 'error');
  }

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('obc_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('obc_session_id', sessionId);
    }
    return sessionId;
  }

  // Get device information
  private getDeviceInfo(): DeviceInfo {
    return {
      screen_width: screen.width,
      screen_height: screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      device_type: this.getDeviceType(),
      browser: this.getBrowserInfo(),
      browser_version: this.getBrowserVersion(),
      os: this.getOSInfo(),
      os_version: this.getOSVersion(),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(): string {
    // Extract browser version from user agent
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private getOSInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getOSVersion(): string {
    // Extract OS version from user agent
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(Windows NT|Mac OS X|Linux|Android|iOS)\/?([\d.]+)?/);
    return match ? (match[2] || 'Unknown') : 'Unknown';
  }

  private generateCorrelationId(): string {
    return crypto.randomUUID();
  }

  private handleWebSocketMessage(data: any): void {
    // Handle server messages (e.g., configuration updates, acknowledgments)
    console.log('Analytics WebSocket message:', data);
  }

  private handleWebSocketError(error: Event): void {
    console.error('Analytics WebSocket error:', error);
  }

  // Get analytics statistics
  getStats(): {
    storageStats: { eventCount: number; storageSize: number };
    connectionStatus: 'connected' | 'disconnected' | 'connecting';
    batchSize: number;
  } {
    return {
      storageStats: this.localStorageManager.getStorageStats(),
      connectionStatus: this.websocketManager.ws?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected',
      batchSize: this.batchProcessor.batch.length,
    };
  }

  // Cleanup
  destroy(): void {
    this.websocketManager.disconnect();
    this.isInitialized = false;
  }
}
```

## 🚀 Usage Examples

### **React Hook for Analytics**
```typescript
import { useEffect, useCallback } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

export const usePageTracking = (pageName: string) => {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackPageView(pageName);
  }, [pageName, analytics]);

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

  return { trackEvent, trackAction };
};
```

### **Component Integration**
```typescript
import React from 'react';
import { usePageTracking, useEventTracking } from '../hooks/useAnalytics';

export const DashboardPage: React.FC = () => {
  usePageTracking('dashboard');
  const { trackEvent, trackAction } = useEventTracking();

  const handleButtonClick = () => {
    trackAction('click', 'button', 'create-project-btn', {
      button_text: 'Create Project',
      page_section: 'header',
    });
  };

  const handleProjectCreate = (projectData: any) => {
    trackEvent('project_created', {
      project_type: projectData.type,
      project_name: projectData.name,
      user_role: 'admin',
    }, 'project_management');
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Create Project</button>
      {/* Rest of dashboard content */}
    </div>
  );
};
```

### **Analytics Provider Setup**
```typescript
import React, { createContext, useContext, useEffect } from 'react';
import { OpenBioCureAnalytics } from '../services/analytics';

interface AnalyticsContextType {
  analytics: OpenBioCureAnalytics;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const analytics = new OpenBioCureAnalytics({
    endpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT || 'http://localhost:8000/api/analytics',
    websocket_url: process.env.REACT_APP_ANALYTICS_WS || 'ws://localhost:8000/ws/analytics',
    batch_size: 50,
    flush_interval: 30000, // 30 seconds
    max_retries: 3,
    enable_debug: process.env.NODE_ENV === 'development',
    tenant_id: getCurrentTenantId(), // Get from your auth system
    user_id: getCurrentUserId(), // Get from your auth system
  });

  useEffect(() => {
    analytics.initialize();
    return () => analytics.destroy();
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={{ analytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context.analytics;
};
```

## 🔒 Privacy & Security

### **Data Privacy Features**
- **No PII Collection**: User IDs are UUIDs, not personal information
- **Data Anonymization**: IP addresses and user agents are hashed
- **Tenant Isolation**: Complete data separation between tenants
- **Local Storage**: Data stored locally until successfully transmitted
- **User Consent**: Respects user privacy preferences

### **Security Measures**
- **Authentication**: All API calls require valid auth tokens
- **Tenant Validation**: Server validates tenant context on all requests
- **Encryption**: Data encrypted in transit and at rest
- **Rate Limiting**: Prevents abuse and DoS attacks
- **Audit Logging**: Complete audit trail for compliance

## 📊 Backend Requirements

### **API Endpoints**
- `POST /api/analytics/batch` - Batch event processing
- `GET /api/analytics/events` - Event retrieval (with filtering)
- `GET /api/analytics/metrics` - Aggregated metrics
- `GET /api/analytics/dashboard` - Analytics dashboard data

### **WebSocket Endpoints**
- `ws://host/ws/analytics` - Real-time event transmission
- `ws://host/ws/analytics/{tenant_id}` - Tenant-specific WebSocket

### **Database Schema**
```sql
-- Events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    event_id VARCHAR(255) NOT NULL,
    user_id UUID,
    session_id VARCHAR(255),
    event_name VARCHAR(255) NOT NULL,
    event_category VARCHAR(100),
    properties JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    device_info JSONB,
    correlation_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_analytics_events_tenant_id ON analytics_events(tenant_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);

-- Partition by tenant for large datasets
CREATE TABLE analytics_events_tenant_1 PARTITION OF analytics_events
    FOR VALUES IN ('tenant-uuid-1');
```

## 🚀 Performance Optimization

### **Client-Side Optimizations**
- **Event Batching**: Group events to reduce HTTP requests
- **Local Storage**: Offline event storage with size limits
- **WebSocket**: Real-time transmission when available
- **Lazy Loading**: Load analytics only when needed
- **Memory Management**: Clean up old events and sessions

### **Server-Side Optimizations**
- **Database Partitioning**: Partition by tenant and time
- **Indexing Strategy**: Optimized indexes for common queries
- **Caching**: Redis for frequently accessed metrics
- **Async Processing**: Background job processing for heavy operations
- **CDN Integration**: Static assets served via CDN

## 📈 Analytics Dashboard

### **Key Metrics**
- **User Engagement**: Page views, session duration, bounce rate
- **Feature Usage**: Button clicks, form submissions, navigation patterns
- **Performance**: Page load times, error rates, API response times
- **User Journey**: User flow analysis, conversion funnels
- **Tenant Analytics**: Per-tenant usage and performance metrics

### **Real-Time Monitoring**
- **Live User Count**: Current active users per tenant
- **Event Stream**: Real-time event feed
- **Error Tracking**: Live error monitoring and alerting
- **Performance Metrics**: Real-time performance data
- **System Health**: Service status and performance

## 🔧 Configuration

### **Environment Variables**
```bash
# Analytics Service
REACT_APP_ANALYTICS_ENDPOINT=https://analytics.openbiocure.com/api
REACT_APP_ANALYTICS_WS=wss://analytics.openbiocure.com/ws
REACT_APP_ANALYTICS_BATCH_SIZE=50
REACT_APP_ANALYTICS_FLUSH_INTERVAL=30000
REACT_APP_ANALYTICS_MAX_RETRIES=3
REACT_APP_ANALYTICS_DEBUG=false

# Backend
ANALYTICS_DATABASE_URL=postgresql://user:pass@localhost/analytics
ANALYTICS_REDIS_URL=redis://localhost:6379
ANALYTICS_BATCH_SIZE=100
ANALYTICS_PROCESSING_INTERVAL=60
ANALYTICS_RETENTION_DAYS=365
```

### **Tenant Configuration**
```typescript
interface TenantAnalyticsConfig {
  tenant_id: string;
  enabled: boolean;
  tracking_level: 'minimal' | 'standard' | 'detailed';
  retention_days: number;
  data_export_enabled: boolean;
  real_time_enabled: boolean;
  custom_properties: string[];
  excluded_events: string[];
  sampling_rate: number; // 0.0 to 1.0
}
```

## 🚀 Deployment

### **Docker Compose**
```yaml
version: '3.8'
services:
  analytics-api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres/analytics
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  analytics-worker:
    build: ./backend
    command: python -m worker
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres/analytics
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=analytics
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: analytics-api
  template:
    metadata:
      labels:
        app: analytics-api
    spec:
      containers:
      - name: analytics-api
        image: openbiocure/analytics-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: analytics-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: analytics-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 📊 Monitoring & Alerting

### **Health Checks**
- **API Health**: `/health` endpoint for load balancer health checks
- **Database Health**: Connection pool monitoring
- **Redis Health**: Cache service availability
- **WebSocket Health**: Connection status monitoring
- **Worker Health**: Background job processing status

### **Alerting Rules**
- **High Error Rate**: >5% error rate for 5 minutes
- **High Latency**: >2s response time for 5 minutes
- **Storage Issues**: >90% storage utilization
- **Connection Failures**: >10 failed connections per minute
- **Batch Processing Delays**: >5 minute delay in event processing

## 🔮 Future Enhancements

### **Advanced Features**
- **Machine Learning**: Predictive analytics and anomaly detection
- **A/B Testing**: Built-in experimentation framework
- **User Segmentation**: Advanced user behavior analysis
- **Funnel Analysis**: Conversion optimization tools
- **Heatmaps**: Visual user interaction analysis
- **Session Recording**: User session playback (with consent)

### **Integration Capabilities**
- **Third-Party Tools**: Export to external analytics platforms
- **Webhook Support**: Real-time data push to external systems
- **API Access**: RESTful API for custom integrations
- **Data Export**: CSV, JSON, and SQL export capabilities
- **Real-Time Dashboards**: Custom dashboard creation tools

---

## 📞 Support & Documentation

**Analytics Team**: analytics@openbiocure.com  
**Documentation**: https://docs.openbiocure.com/analytics  
**API Reference**: https://api.openbiocure.com/analytics/docs  
**Dashboard**: https://analytics.openbiocure.com  

---

*Last Updated: August 19, 2024*  
*Version: 1.0*  
*Author: OpenBioCure Analytics Team*  
*Self-Hosted Analytics Architecture*

