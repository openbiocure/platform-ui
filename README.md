# <img src="client/public/assets/logo.svg" alt="OpenBioCure Logo" width="40" height="40" style="vertical-align: middle; margin-right: 10px;" /> OpenBioCure Platform UI

[![Version](https://img.shields.io/badge/version-v0.7.9--rc1-blue.svg)](https://github.com/openbiocure/OpenBioCure)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Homepage](https://img.shields.io/badge/homepage-openbiocure.ai-orange.svg)](https://openbiocure.ai)
[![Node.js](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5+-blue.svg)](https://www.typescriptlang.org/)

A modern, feature-rich AI chat platform built with React, Node.js, and MongoDB. OpenBioCure provides a comprehensive interface for AI-powered conversations, agents, assistants, and external integrations with a beautiful OpenBioCure-branded design.

## 🎨 Brand Colors

OpenBioCure features a distinctive color palette:
- **Deep Blue**: `#00239c` (Primary brand color)
- **Navy Blue**: `#001e62` (Dark mode backgrounds)
- **Vibrant Orange**: `#e76900` (Accent color)
- **Bright Cyan**: `#00a3e0` (Secondary accent)

## 🚀 Features

### Core Features
- **Multi-Provider AI Support**: Integration with OpenAI, Anthropic, Google, and other AI providers
- **Advanced Chat Interface**: Real-time messaging with markdown support, code highlighting, and LaTeX rendering
- **Agent System**: Create and configure custom AI agents with specific capabilities
- **Assistant Builder**: Build and manage AI assistants with custom instructions and tools
- **File Management**: Upload, process, and manage files with AI analysis capabilities
- **Multi-Conversation Support**: Handle multiple concurrent conversations
- **Bookmarks & Presets**: Save and organize conversations and configurations

### Advanced Features
- **External Agent Support**: Delegate processing to external HTTP endpoints
- **MCP (Model Context Protocol) Servers**: Integration with external tools and services
- **Authentication**: Multiple login options including OAuth providers (GitHub, Google, Discord, etc.)
- **Rate Limiting**: Configurable rate limits for API endpoints and file uploads
- **Real-time Updates**: WebSocket support for live conversation updates
- **Internationalization**: Multi-language support with i18next
- **Accessibility**: WCAG compliant with comprehensive a11y features

### Developer Features
- **TypeScript Support**: Full type safety across the entire stack
- **Testing**: Comprehensive test suite with Jest and Playwright
- **Code Quality**: ESLint, Prettier, and Husky for code formatting and linting
- **Docker Support**: Containerized deployment options
- **API Documentation**: RESTful API with comprehensive endpoints

## 🏗️ Architecture

### Frontend (`client/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: Recoil + React Query
- **Routing**: React Router DOM
- **Testing**: Jest + React Testing Library + Playwright

### Backend (`api/`)
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with multiple strategies
- **File Storage**: Support for local, S3, and Firebase storage
- **Caching**: Redis integration
- **Rate Limiting**: Express rate limit with Redis backend

### Packages (`packages/`)
- **`data-provider`**: Shared data layer and API client
- **`data-schemas`**: MongoDB schemas and TypeScript types
- **`api`**: Backend API package

## 📦 Installation

### Prerequisites
- Node.js 18+ or Bun
- MongoDB 6.0+
- Redis (optional, for caching)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/openbiocure/OpenBioCure.git
   cd OpenBioCure
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using Bun
   bun install
   ```

3. **Configure environment**
   ```bash
   cp openbiocure.yaml.example openbiocure.yaml
   # Edit openbiocure.yaml with your configuration
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in api/ directory
   cp api/.env.example api/.env
   # Configure your environment variables
   ```

5. **Start the development servers**
   ```bash
   # Start backend
   npm run backend:dev
   
   # In another terminal, start frontend
   npm run frontend:dev
   ```

### Production Deployment

#### Using Docker
```bash
# Build and start with Docker Compose
npm run start:deployed

# Stop services
npm run stop:deployed
```

#### Manual Deployment
```bash
# Build all packages
npm run frontend

# Start production backend
npm run backend
```

## 🔧 Configuration

### Main Configuration (`openbiocure.yaml`)

The main configuration file supports various options:

```yaml
# Basic settings
version: 1.2.1
cache: true

# Interface customization
interface:
  customWelcome: "Welcome to OpenBioCure!"
  modelSelect: true
  parameters: true
  sidePanel: true
  agents: true
  assistants: true

# Authentication
registration:
  socialLogins: ["github", "google", "discord", "openid", "facebook", "apple", "saml"]

# External agents configuration
endpoints:
  agents:
    allowExternalAgents: true
    externalAgentAuthTypes: ["none", "api_key", "bearer", "basic", "custom_header"]
    allowedExternalDomains: ["example.com", "api.example.com"]
    externalAgentTimeout: 30000
    externalAgentMaxRetries: 3
```

### Environment Variables

Key environment variables for the backend:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/openbiocure

# Authentication
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# AI Providers
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key

# File Storage
S3_BUCKET=your-s3-bucket
S3_ACCESS_KEY_ID=your-s3-access-key
S3_SECRET_ACCESS_KEY=your-s3-secret-key

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## 🧪 Testing

### Unit Tests
```bash
# Test frontend
npm run test:client

# Test backend
npm run test:api

# Test with Bun
npm run b:test:client
npm run b:test:api
```

### End-to-End Tests
```bash
# Run E2E tests
npm run e2e

# Run with UI
npm run e2e:headed

# Accessibility tests
npm run e2e:a11y

# Debug mode
npm run e2e:debug
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📚 API Documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/logout` - User logout

#### Conversations
- `GET /api/convos` - List conversations
- `POST /api/convos` - Create conversation
- `PUT /api/convos/:id` - Update conversation
- `DELETE /api/convos/:id` - Delete conversation

#### Agents
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

#### Assistants
- `GET /api/assistants` - List assistants
- `POST /api/assistants` - Create assistant
- `PUT /api/assistants/:id` - Update assistant
- `DELETE /api/assistants/:id` - Delete assistant

## 🚀 Development

### Project Structure
```
platform-ui/
├── api/                 # Backend server
│   ├── server/         # Express server and routes
│   ├── models/         # MongoDB schemas
│   ├── middleware/     # Express middleware
│   └── services/       # Business logic
├── client/             # Frontend React app
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── store/      # State management
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
│       └── assets/
│           └── logo.svg # OpenBioCure logo
├── packages/           # Shared packages
│   ├── data-provider/  # API client and data layer
│   ├── data-schemas/   # TypeScript types and schemas
│   └── api/           # Backend API package
└── e2e/               # End-to-end tests
```

### Available Scripts

#### Development
```bash
npm run backend:dev      # Start backend in development mode
npm run frontend:dev     # Start frontend in development mode
npm run b:api:dev        # Start backend with Bun in watch mode
npm run b:client:dev     # Start frontend with Bun
```

#### Building
```bash
npm run frontend         # Build all packages and frontend
npm run build:data-provider  # Build data provider package
npm run build:api        # Build API package
npm run build:data-schemas   # Build data schemas package
```

#### Management
```bash
npm run create-user      # Create a new user
npm run invite-user      # Invite a user
npm run ban-user         # Ban a user
npm run add-balance      # Add balance to user
npm run list-balances    # List user balances
```

## 🎨 UI/UX Features

### Design System
- **OpenBioCure Brand Colors**: Consistent color palette throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

### Interactive Elements
- **Hover Effects**: Smooth transitions and visual feedback
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: User-friendly feedback messages
- **Modal Dialogs**: Clean, accessible modal components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Follow the OpenBioCure brand guidelines for UI changes

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://openbiocure.ai/docs](https://openbiocure.ai/docs)
- **Issues**: [GitHub Issues](https://github.com/openbiocure/OpenBioCure/issues)
- **Discussions**: [GitHub Discussions](https://github.com/openbiocure/OpenBioCure/discussions)
- **Homepage**: [https://openbiocure.ai](https://openbiocure.ai)

## 🙏 Acknowledgments

- Built on top of the openbiocure platform
- Uses various open-source libraries and tools
- Community contributors and maintainers
- OpenBioCure brand design and color palette

---

**OpenBioCure** - Empowering AI conversations with flexibility, extensibility, and beautiful design.

*Built with ❤️ and the OpenBioCure brand colors*
