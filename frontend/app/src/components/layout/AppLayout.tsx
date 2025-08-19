import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ScholarProfile from '../dashboard/ScholarProfile';
import Header from './Header';
import SideBar from './SideBar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Render content based on current route
  const renderContent = () => {
    if (location.pathname === '/profile') {
      return <ScholarProfile />;
    }
    return children;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation Drawer */}
      <SideBar drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />

      {/* Main Content Area with Header */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${drawerOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header - Positioned above main content, next to sidebar */}
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            {/* Page Content */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
