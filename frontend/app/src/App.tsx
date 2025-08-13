import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Lazy load remote components (will be enabled when Module Federation is configured)
// const RemoteComponent = React.lazy(() => import('research-core-app/AIAssistant'));

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="App-nav">
          <h1>OpenBioCure Platform</h1>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/research">Research Core</Link></li>
            <li><Link to="/analysis">Analysis</Link></li>
            <li><Link to="/workflow">Workflow</Link></li>
          </ul>
        </nav>
        
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/research" element={<ResearchView />} />
            <Route path="/analysis" element={<AnalysisView />} />
            <Route path="/workflow" element={<WorkflowView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home-view">
      <h2>Welcome to OpenBioCure Platform</h2>
      <p>Your comprehensive bioinformatics platform with Micro Frontend Architecture</p>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>Research Core</h3>
          <p>AI Assistant, Document Ingestion, Research Tools</p>
        </div>
        <div className="feature-card">
          <h3>Analysis</h3>
          <p>Data analysis and visualization</p>
        </div>
        <div className="feature-card">
          <h3>Workflow</h3>
          <p>Workflow management and execution</p>
        </div>
      </div>
    </div>
  );
}

function ResearchView() {
  return (
    <div className="micro-frontend-container">
      <h2>Research Core Application</h2>
      <p>Research Core micro frontend will be loaded here when Module Federation is configured</p>
    </div>
  );
}

function AnalysisView() {
  return (
    <div className="micro-frontend-container">
      <h2>Analysis Application</h2>
      <p>Analysis micro frontend will be loaded here</p>
    </div>
  );
}

function WorkflowView() {
  return (
    <div className="micro-frontend-container">
      <h2>Workflow Application</h2>
      <p>Workflow micro frontend will be loaded here</p>
    </div>
  );
}

export default App;
