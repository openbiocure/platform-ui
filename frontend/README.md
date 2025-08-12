# OpenBioCure Platform - Frontend

The frontend application for the OpenBioCure bioinformatics platform, built with **React 18** and **Micro Frontend Architecture** using Module Federation.

## 🏗️ Architecture Overview

The frontend follows a **Micro Frontend Architecture** pattern, allowing independent teams to develop, deploy, and maintain separate parts of the application:

```
┌─────────────────────────────────────────────────────────────┐
│                    Shell Application                       │
│                     (Port 3000)                           │
├─────────────────────────────────────────────────────────────┤
│  Research Core App  │  Analysis App  │  Workflow App      │
│     (Port 3001)     │   (Port 3002)  │   (Port 3003)     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Micro Frontends

### **1. Shell Application** (`shell-app/`)
- **Port**: 3000
- **Role**: Main container and navigation
- **Features**: Routing, shared layout, micro frontend orchestration
- **Technology**: React 18 + React Router + Create React App

### **2. Research Core App** (`research-core-app/`)
- **Port**: 3001
- **Role**: AI Assistant, Document Ingestion, Research Tools
- **Exposes**: AIAssistant, DocumentIngestion, EntityExtraction, ResearchDashboard, TopicSubscription
- **Technology**: React 18 + Create React App

### **3. Analysis App** (`analysis-app/`)
- **Port**: 3002
- **Role**: Data analysis and visualization
- **Exposes**: AnalysisDashboard, WorkflowBuilder, ResultsViewer
- **Technology**: React 18 + Create React App

### **4. Workflow App** (`workflow-app/`)
- **Port**: 3003
- **Role**: Workflow management and execution
- **Exposes**: WorkflowList, WorkflowEditor, WorkflowExecution
- **Technology**: React 18 + Create React App

### **5. Shared Library** (`shared/`)
- **Role**: Common components, types, and utilities
- **Usage**: Imported by all micro frontends
- **Technology**: TypeScript + React 18

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm 9+ or yarn

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Start all micro frontends in development mode
npm run dev
```

### Individual Development
```bash
# Start only the shell application
npm run start:shell

# Start only research core app
npm run start:research-core

# Start only analysis app
npm run start:analysis

# Start only workflow app
npm run start:workflow
```

### Build Commands
```bash
# Build all applications
npm run build

# Build specific applications
npm run build:shell
npm run build:research-core
npm run build:analysis
npm run build:workflow

# Build shared library first (required for other builds)
npm run build:shared
```

## 🔧 Module Federation Configuration

### Shell App (Consumer)
```typescript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'shell-app',
  remotes: {
    'research-core-app': 'research-core-app@http://localhost:3001/remoteEntry.js',
    'analysis-app': 'analysis-app@http://localhost:3002/remoteEntry.js',
    'workflow-app': 'workflow-app@http://localhost:3003/remoteEntry.js'
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

### Micro Frontend (Producer)
```typescript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'research-core-app',
  filename: 'remoteEntry.js',
  exposes: {
    './AIAssistant': './src/components/AIAssistant',
    './DocumentIngestion': './src/components/DocumentIngestion'
  },
  shared: ['react', 'react-dom', 'react-router-dom']
})
```

## 📱 Using Micro Frontends

### Loading Remote Components
```jsx
// In shell application
import React, { Suspense } from 'react';

const RemoteComponent = React.lazy(() => import('research-core-app/AIAssistant'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteComponent />
    </Suspense>
  );
}
```

### Component Integration
```jsx
import React, { Suspense } from 'react';

function ResearchView() {
  return (
    <div className="micro-frontend-container">
      <Suspense fallback={<div>Loading Research Core...</div>}>
        <RemoteComponent />
      </Suspense>
    </div>
  );
}
```

## 🧪 Testing

### Unit Tests
```bash
# Test all applications
npm run test --workspaces

# Test specific application
npm run test --workspace=shell-app
```

### End-to-End Tests
```bash
# Run e2e tests for shell app
cd shell-app && npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
# Build all applications
npm run build

# Deploy each application independently
# - shell-app/build → Main domain
# - research-core-app/build → CDN or subdomain
# - analysis-app/build → CDN or subdomain
# - workflow-app/build → CDN or subdomain
```

### Environment Configuration
```env
# Shell App
REACT_APP_API_URL=https://api.openbiocure.com

# Micro Frontends
REACT_APP_SHELL_URL=https://platform.openbiocure.com
REACT_APP_SHARED_URL=https://shared.openbiocure.com
```

## 🔒 Security & Best Practices

- **CORS Configuration**: Each micro frontend runs on different ports
- **Shared Dependencies**: React, React Router are shared to prevent duplication
- **Type Safety**: Full TypeScript support across all applications
- **Error Boundaries**: Graceful fallbacks when micro frontends fail to load
- **Performance**: Lazy loading for better perceived performance

## 📚 Documentation

- [Module Federation Guide](https://webpack.js.org/concepts/module-federation/)
- [React Documentation](https://react.dev/)
- [Create React App](https://create-react-app.dev/)
- [Micro Frontend Patterns](https://micro-frontends.org/)

## 🤝 Contributing

1. **Team Independence**: Each team can work on their micro frontend independently
2. **Shared Contracts**: Use the shared library for common interfaces
3. **Versioning**: Each micro frontend can be versioned independently
4. **Testing**: Ensure your micro frontend works with the shell application

## 📄 License

Part of the OpenBioCure Platform - see main repository for license information.
