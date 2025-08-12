# OpenBioCure Platform - Shell Application

This is the **Shell Application** for the OpenBioCure bioinformatics platform, built with React 18 and TypeScript. The application is currently running with Create React App and is ready for Module Federation integration.

## 🎯 Current Status

✅ **Completed:**
- React 18 + TypeScript application initialized
- Modern, responsive UI with professional design
- React Router navigation structure
- Micro frontend architecture planning
- Component structure for future integration

🔄 **In Progress:**
- Module Federation configuration
- Webpack setup for micro frontend loading

## 🚀 Quick Start

### Development
```bash
npm start
# or
npm run dev
```

The application will start on **http://localhost:3000**

### Production Build
```bash
npm run build
```

### Testing
```bash
npm test
```

## 🏗️ Architecture

### Current Structure
The shell app is designed as a **consumer** that will load remote micro frontends:

- **Research Core App** (Port 3001) - AI Assistant, Document Ingestion, Research Tools
- **Analysis App** (Port 3002) - Data analysis and visualization
- **Workflow App** (Port 3003) - Workflow management and execution

### Routing Structure
- `/` - Home page with platform overview
- `/research` - Research Core micro frontend (placeholder)
- `/analysis` - Analysis micro frontend (placeholder)
- `/workflow` - Workflow micro frontend (placeholder)

## 🔧 Technology Stack

- **React 18** - Latest React with concurrent features
- **TypeScript** - Full type safety
- **React Router** - Client-side routing
- **Create React App** - Development environment (temporary)
- **CSS3** - Modern styling with responsive design

## 📱 Features

- **Responsive Navigation** - Modern gradient design with hover effects
- **Professional UI** - Clean, modern interface following best UX practices
- **Component Structure** - Ready for micro frontend integration
- **TypeScript Support** - Full type safety across the application

## 🔌 Next Steps for Module Federation

### 1. Webpack Configuration
The application currently uses Create React App. To enable Module Federation:

```bash
npm run eject
# Then configure webpack.config.js with ModuleFederationPlugin
```

### 2. Module Federation Setup
```typescript
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

### 3. Remote Component Loading
```typescript
// Enable these imports when Module Federation is configured
const RemoteComponent = React.lazy(() => import('research-core-app/AIAssistant'));
```

## 🚀 Development Workflow

1. **Current**: Start the shell application with `npm start`
2. **Next**: Configure Module Federation and webpack
3. **Future**: Start individual micro frontends on their respective ports
4. **Integration**: Test micro frontend loading and communication

## 📚 Related Documentation

- [Main Platform README](../README.md)
- [Module Federation Guide](https://webpack.js.org/concepts/module-federation/)
- [React Documentation](https://react.dev/)
- [Create React App](https://create-react-app.dev/)

## 🤝 Contributing

When developing the shell application:

1. **Current Phase**: Focus on UI/UX and component structure
2. **Next Phase**: Implement Module Federation configuration
3. **Future**: Test integration with remote micro frontends
4. **Maintenance**: Ensure responsive design and type safety

## 🔍 Troubleshooting

### Common Issues
- **Port 3000 already in use**: Change port in package.json or kill existing process
- **TypeScript errors**: Check tsconfig.json and ensure all dependencies are installed
- **Build failures**: Use `npm start` for development, `npm run build` for production

### Getting Help
- Check the browser console for runtime errors
- Review the terminal output for build errors
- Ensure all dependencies are properly installed
