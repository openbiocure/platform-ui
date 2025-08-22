import { AnalyticsEvent, AnalyticsConfig, getDeviceInfo, generateCorrelationId } from '../utils/analytics';

// LocalStorage Manager for offline event storage
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
        while (events.length > 0 && JSON.stringify(events).length > this.MAX_STORAGE_SIZE) {
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

  // Remove specific events from storage
  removeEvents(eventIds: string[]): void {
    try {
      const events = this.getStoredEvents();
      const eventIdSet = new Set(eventIds);
      const filteredEvents = events.filter(e => !eventIdSet.has(e.event_id));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredEvents));
    } catch (error) {
      console.error('Failed to remove events from storage:', error);
    }
  }

  // Get storage usage statistics
  getStorageStats(): { eventCount: number; storageSize: number } {
    const events = this.getStoredEvents();
    const storageSize = JSON.stringify(events).length;
    return { eventCount: events.length, storageSize };
  }
}

// WebSocket Connection Manager
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

  get connectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CONNECTING: return 'connecting';
      default: return 'disconnected';
    }
  }
}

// Batch Processing Manager
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
      this.localStorageManager.removeEvents(eventsToSend.map(e => e.event_id));

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
    const authToken = localStorage.getItem('openbiocure_access_token') || '';
    
    const response = await fetch(`${this.config.endpoint}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-ID': this.config.tenant_id,
        'X-Correlation-ID': generateCorrelationId(),
      },
      body: JSON.stringify({
        events,
        batch_id: generateCorrelationId(),
        timestamp: Date.now(),
        tenant_id: this.config.tenant_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
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
        this.localStorageManager.removeEvents(chunk.map(e => e.event_id));
      } catch (error) {
        console.error(`Failed to process offline events chunk ${i}-${i + chunkSize}:`, error);
        break; // Stop processing on error
      }
    }
  }

  get batchSize(): number {
    return this.batch.length;
  }
}

// Main Analytics Service
export class OpenBioCureAnalytics {
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
      device_info: getDeviceInfo(),
      correlation_id: generateCorrelationId(),
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

  private handleWebSocketMessage(data: any): void {
    // Handle server messages (e.g., configuration updates, acknowledgments)
    if (this.config.enable_debug) {
      console.log('Analytics WebSocket message:', data);
    }
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
      connectionStatus: this.websocketManager.connectionStatus,
      batchSize: this.batchProcessor.batchSize,
    };
  }

  // Cleanup
  destroy(): void {
    this.websocketManager.disconnect();
    this.isInitialized = false;
  }
}
