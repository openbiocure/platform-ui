# External Agent Feature Proposal

## Overview

This proposal introduces an **External Agent** feature to OpenBioCure's Agent Builder, allowing users to configure agents that delegate their processing to external services via HTTP endpoints. This feature enhances OpenBioCure's flexibility by enabling integration with custom AI services, specialized processing pipelines, and third-party agent frameworks.

## Problem Statement

Currently, OpenBioCure agents are limited to using built-in LLM providers and local processing capabilities. Users who want to:
- Integrate with custom AI services
- Use specialized processing pipelines
- Delegate to external agent frameworks
- Implement custom business logic
- Use proprietary or specialized models

Must either modify the OpenBioCure codebase or work around these limitations. The External Agent feature provides a clean, configurable solution for these use cases.

## Proposed Solution

### Core Concept

An External Agent is a special type of agent that, instead of using OpenBioCure's built-in LLM processing, forwards requests to an external HTTP endpoint and returns the response. This allows seamless integration with any external service that can handle chat-like interactions.

### Key Features

1. **External URL Configuration**: Agents can be configured with an external HTTP endpoint
2. **Conditional UI**: The Agent Builder UI adapts based on whether an agent is external
3. **Request/Response Handling**: Proper forwarding of messages and context to external services
4. **Error Handling**: Graceful handling of external service failures
5. **Configuration Control**: Admin-level control over external agent capabilities
6. **Authentication Support**: Multiple authentication methods for external services

## Technical Implementation

### Database Schema Changes

Add two new fields to the Agent schema:

```typescript
// In packages/data-schemas/src/types/agent.ts
export interface IAgent extends Omit<Document, 'model'> {
  // ... existing fields ...
  isExternal?: boolean;
  externalUrl?: string;
  externalAuth?: {
    type: 'none' | 'api_key' | 'bearer' | 'basic' | 'custom_header';
    apiKey?: string; // Encrypted
    customHeaderName?: string;
    username?: string; // For basic auth
    password?: string; // Encrypted
  };
}
```

```javascript
// In packages/data-schemas/src/schema/agent.ts
const agentSchema = new Schema<IAgent>({
  // ... existing fields ...
  isExternal: {
    type: Boolean,
    default: false,
  },
  externalUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (this.isExternal && !v) return false;
        if (v && !/^https?:\/\/.+/.test(v)) return false;
        return true;
      },
      message: 'External URL is required for external agents and must be a valid HTTP/HTTPS URL'
    }
  },
  externalAuth: {
    type: {
      type: String,
      enum: ['none', 'api_key', 'bearer', 'basic', 'custom_header'],
      default: 'none'
    },
    apiKey: {
      type: String,
      // Will be encrypted before saving
    },
    customHeaderName: {
      type: String,
      default: 'X-API-Key'
    },
    username: {
      type: String,
      // For basic auth
    },
    password: {
      type: String,
      // Will be encrypted before saving
    }
  },
});
```

### API Validation

Update validation schemas to include external agent fields:

```typescript
// In packages/api/src/agents/validation.ts
export const agentBaseSchema = z.object({
  // ... existing fields ...
  isExternal: z.boolean().optional(),
  externalUrl: z.string().url().optional(),
  externalAuth: z.object({
    type: z.enum(['none', 'api_key', 'bearer', 'basic', 'custom_header']).optional(),
    apiKey: z.string().optional(),
    customHeaderName: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
  }).optional(),
});

export const agentCreateSchema = agentBaseSchema.extend({
  // ... existing fields ...
  externalUrl: z.string().url().optional().refine((val, ctx) => {
    if (ctx.parent?.isExternal && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "External URL is required when isExternal is true"
      });
      return false;
    }
    return true;
  }),
  externalAuth: z.object({
    type: z.enum(['none', 'api_key', 'bearer', 'basic', 'custom_header']).optional(),
    apiKey: z.string().optional().refine((val, ctx) => {
      const authType = ctx.parent?.type;
      if ((authType === 'api_key' || authType === 'bearer') && !val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "API key is required for this authentication type"
        });
        return false;
      }
      return true;
    }),
    customHeaderName: z.string().optional(),
    username: z.string().optional().refine((val, ctx) => {
      const authType = ctx.parent?.type;
      if (authType === 'basic' && !val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Username is required for basic authentication"
        });
        return false;
      }
      return true;
    }),
    password: z.string().optional().refine((val, ctx) => {
      const authType = ctx.parent?.type;
      if (authType === 'basic' && !val) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password is required for basic authentication"
        });
        return false;
      }
      return true;
    }),
  }).optional(),
});
```

### Frontend Changes

#### Agent Builder UI Updates

1. **External Agent Toggle**: Add a toggle switch to enable/disable external agent mode
2. **Conditional Field Display**: Hide model selector, instructions, and capabilities when external mode is enabled
3. **External URL Input**: Add URL input field with validation
4. **Authentication Configuration**: Add authentication type selector and corresponding fields
5. **UI State Management**: Proper form state handling for external vs internal agents

#### Authentication UI Components

```typescript
// New component: ExternalAgentAuth.tsx
interface ExternalAgentAuthProps {
  authType: 'none' | 'api_key' | 'bearer' | 'basic' | 'custom_header';
  onAuthTypeChange: (type: string) => void;
  onAuthDataChange: (data: any) => void;
}

// Authentication type selector with conditional fields:
// - None: No additional fields
// - API Key: API key input + optional custom header name
// - Bearer: API key input (used as bearer token)
// - Basic: Username + password inputs
// - Custom Header: API key + custom header name inputs
```

#### Configuration Integration

Add configuration option to control external agent capabilities:

```yaml
# In openbiocure.yaml
endpoints:
  agents:
    # ... existing config ...
    allowExternalAgents: true  # Enable/disable external agent feature
    externalAgentAuthTypes: ['none', 'api_key', 'bearer', 'basic', 'custom_header']  # Allowed auth types
    externalAgentTimeout: 30000  # Timeout for external requests (ms)
    externalAgentMaxRetries: 3   # Max retry attempts for failed requests
```

### Request Processing

When an external agent is selected:

1. **Request Format**: Forward the conversation context to the external URL
2. **Authentication**: Apply configured authentication method
3. **Response Handling**: Process the response from the external service
4. **Error Handling**: Graceful fallback and user notification
5. **Streaming Support**: Support for streaming responses from external services

### Authentication Implementation

#### Encryption/Decryption

Use OpenBioCure's existing encryption utilities:

```javascript
// In api/models/Agent.js
const { encrypt, decrypt } = require('@openbiocure/api');

// Before saving agent
if (agentData.externalAuth?.apiKey) {
  agentData.externalAuth.apiKey = await encrypt(agentData.externalAuth.apiKey);
}
if (agentData.externalAuth?.password) {
  agentData.externalAuth.password = await encrypt(agentData.externalAuth.password);
}

// Before using agent
if (agent.externalAuth?.apiKey) {
  agent.externalAuth.apiKey = await decrypt(agent.externalAuth.apiKey);
}
if (agent.externalAuth?.password) {
  agent.externalAuth.password = await decrypt(agent.externalAuth.password);
}
```

#### Request Authentication

```javascript
// In api/server/services/Endpoints/agents/external.js
const buildAuthHeaders = (externalAuth) => {
  const headers = {};
  
  switch (externalAuth.type) {
    case 'api_key':
      headers[externalAuth.customHeaderName || 'X-API-Key'] = externalAuth.apiKey;
      break;
    case 'bearer':
      headers['Authorization'] = `Bearer ${externalAuth.apiKey}`;
      break;
    case 'basic':
      const credentials = Buffer.from(`${externalAuth.username}:${externalAuth.password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
      break;
    case 'custom_header':
      headers[externalAuth.customHeaderName] = externalAuth.apiKey;
      break;
  }
  
  return headers;
};
```

## User Experience

### Agent Builder Interface

1. **Toggle Switch**: Clear "External Agent" toggle in the builder
2. **Dynamic UI**: Fields show/hide based on external mode
3. **Validation**: Real-time URL validation with helpful error messages
4. **Authentication Setup**: Intuitive authentication configuration
5. **Visual Indicators**: Clear indication when an agent is external

### Chat Interface

1. **Transparent Usage**: External agents work seamlessly in conversations
2. **Error Handling**: Clear error messages when external services are unavailable
3. **Loading States**: Appropriate loading indicators during external processing

## Configuration Options

### Admin-Level Controls

```yaml
endpoints:
  agents:
    allowExternalAgents: true          # Master switch for external agents
    externalAgentValidation: true      # Enable URL validation
    allowedExternalDomains: []         # Whitelist of allowed domains
    externalAgentTimeout: 30000        # Timeout for external requests (ms)
    externalAgentMaxRetries: 3         # Max retry attempts
    externalAgentAuthTypes:            # Allowed authentication types
      - 'none'
      - 'api_key'
      - 'bearer'
      - 'basic'
      - 'custom_header'
    externalAgentRateLimit:            # Rate limiting for external requests
      requestsPerMinute: 60
      burstSize: 10
```

### User Permissions

- Regular users can create external agents if enabled
- Admins can restrict external agent creation
- Domain whitelisting for security
- Authentication type restrictions

## Security Considerations

### Authentication Security

1. **Encryption**: All sensitive credentials (API keys, passwords) are encrypted at rest
2. **Secure Transmission**: Use HTTPS for all external communications
3. **Credential Rotation**: Support for credential expiration and rotation
4. **Access Control**: User-level credential isolation

### Request Security

1. **URL Validation**: Strict validation of external URLs
2. **Domain Whitelisting**: Optional domain restriction
3. **Request Sanitization**: Proper sanitization of forwarded data
4. **Timeout Protection**: Prevent hanging requests
5. **Rate Limiting**: Apply rate limits to external requests
6. **Input Validation**: Validate all inputs before forwarding

### Data Protection

1. **Minimal Data Exposure**: Only forward necessary conversation data
2. **User Privacy**: Respect user privacy settings
3. **Audit Logging**: Log external agent usage for security monitoring
4. **Data Retention**: Clear policies for external service data

### Network Security

1. **HTTPS Enforcement**: Require HTTPS for external endpoints
2. **Certificate Validation**: Validate SSL certificates
3. **Proxy Support**: Support for corporate proxy configurations
4. **Network Isolation**: Optional network isolation for sensitive external services

## Migration Strategy

1. **Backward Compatibility**: Existing agents continue to work unchanged
2. **Gradual Rollout**: Feature can be enabled/disabled via configuration
3. **Database Migration**: Simple schema addition with defaults
4. **Credential Migration**: Secure migration of existing credentials

## Testing Strategy

1. **Unit Tests**: Validation logic and schema changes
2. **Integration Tests**: End-to-end external agent functionality
3. **UI Tests**: Agent builder interface behavior
4. **Security Tests**: URL validation and request handling
5. **Authentication Tests**: All authentication methods
6. **Encryption Tests**: Credential encryption/decryption
7. **Rate Limiting Tests**: Rate limiting functionality

## Documentation Updates

1. **Configuration Guide**: Update openbiocure.yaml documentation
2. **User Guide**: External agent creation and usage
3. **API Documentation**: New fields and validation rules
4. **Security Guide**: Best practices for external agents
5. **Authentication Guide**: Setting up authentication for external services

## Benefits

1. **Flexibility**: Support for any external AI service
2. **Extensibility**: Easy integration with custom solutions
3. **Scalability**: Distribute processing across multiple services
4. **Specialization**: Use domain-specific external agents
5. **Cost Optimization**: Leverage different pricing models
6. **Security**: Proper authentication and encryption

## Risks and Mitigation

1. **Security**: URL validation, domain whitelisting, credential encryption
2. **Reliability**: Timeout handling, retry logic, and error recovery
3. **Performance**: Request caching and optimization
4. **Complexity**: Clear UI and comprehensive documentation
5. **Credential Management**: Secure storage and rotation policies

## Future Enhancements

1. **OAuth Support**: OAuth 2.0 authentication flow
2. **Custom Headers**: Configurable request headers beyond authentication
3. **Response Transformation**: Custom response processing
4. **Load Balancing**: Multiple external endpoints
5. **Monitoring**: External service health checks
6. **Credential Vault**: Integration with external credential management systems
7. **Request Signing**: Digital signature support for enhanced security

## Conclusion

The External Agent feature provides a powerful, flexible way to extend OpenBioCure's capabilities while maintaining security and usability. It opens up new possibilities for integration and customization without requiring code modifications.

The comprehensive authentication system ensures secure communication with external services, while the encryption and access controls protect sensitive credentials. This feature aligns with OpenBioCure's goal of being a flexible, extensible biomedical AI platform while maintaining the security and reliability that users expect. 