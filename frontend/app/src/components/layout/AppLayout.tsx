import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import ScholarProfile from '../dashboard/ScholarProfile';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState('Project Alpha');

  // Actual projects from dashboard
  const projects = [
    { id: 'alpha', name: 'Project Alpha', active: true },
    { id: 'beta', name: 'Project Beta', active: false },
    { id: 'panCancer', name: 'Pan-Cancer Atlas Initiative', active: false }
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Click outside handlers for menus
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close profile menu if clicking outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      
      // Close notifications menu if clicking outside
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }

      // Close project dropdown if clicking outside
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Render content based on current route
  const renderContent = () => {
    if (location.pathname === '/profile') {
      return <ScholarProfile />;
    }
    return children;
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    // Here you would implement actual theme switching logic
    console.log('Theme changed to:', newTheme);
  };

  const handleProjectChange = (projectId: string) => {
    setCurrentProject(projects.find(p => p.id === projectId)?.name || 'Project Alpha');
    setProjectDropdownOpen(false);
    // Here you would implement actual project switching logic
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation Drawer */}
      <aside className={`${drawerOpen ? 'w-64' : 'w-16'} bg-[#001E62] text-white flex flex-col fixed h-full transition-all duration-300 ease-in-out z-40`}>
        {/* Top Section - Branding and Project Selection */}
        <div className="p-4 border-b border-gray-700">
          {drawerOpen ? (
            <>
              <div className="flex items-center space-x-2 mb-3">
                <img src="icon-white.svg" className="h-8 w-8" alt="OpenBioCure Logo" />
                <span className="text-lg font-bold text-white">OpenBioCure</span>
              </div>
              
              {/* Project Dropdown */}
              <div className="relative mb-3" ref={projectDropdownRef}>
                <button
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="w-full flex items-center justify-between p-2 bg-[#001E62] hover:bg-[#001E62]/80 text-white rounded-md text-sm transition-colors border border-gray-600"
                >
                  <span className="text-gray-300">{currentProject}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {projectDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#001E62] border border-gray-600 rounded-md shadow-lg z-50">
                    <div className="p-2 border-b border-gray-600">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Projects ({projects.length})</span>
                    </div>
                    <div className="py-1">
                      {projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectChange(project.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm text-left transition-colors ${
                            project.active 
                              ? 'bg-[#E76900] text-white' 
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {project.name}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-600 my-1"></div>
                    <div className="p-2">
                      <button className="w-full bg-[#001E62] hover:bg-[#001E62]/80 text-white px-3 py-2 rounded text-sm font-medium transition-colors border border-gray-600">
                        Create Project
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full bg-white hover:bg-gray-100 text-[#001E62] px-3 py-2 rounded-md text-sm font-medium transition-colors border border-gray-300">
                + Create New
              </button>
            </>
          ) : (
            <img src="icon-white.svg" className="h-8 w-8 mx-auto" alt="OpenBioCure Logo" />
          )}
        </div>
        
        {/* Main Navigation */}
        <nav className={`flex-grow space-y-1 ${drawerOpen ? 'p-4' : 'p-2'}`}>
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex items-center px-3 py-2 text-white rounded-md w-full ${drawerOpen ? 'justify-start' : 'justify-center'} transition-colors ${location.pathname === '/dashboard' ? 'bg-[#E76900] text-white' : 'hover:bg-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            {drawerOpen && <span className="ml-3 text-sm font-medium">Dashboard</span>}
          </button>
          
          <button 
            onClick={() => navigate('/publication-review')}
            className={`flex items-center px-3 py-2 rounded-md w-full ${drawerOpen ? 'justify-start' : 'justify-center'} transition-colors ${location.pathname === '/publication-review' ? 'bg-[#E76900] text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {drawerOpen && <span className="ml-3 text-sm font-medium">Publications</span>}
          </button>
        </nav>
        
        {/* Bottom Section - Just Close Toggle */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={`w-full flex items-center justify-center p-2 text-gray-300 hover:text-white transition-colors ${drawerOpen ? 'justify-start' : 'justify-center'}`}
          >
            {drawerOpen ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
                <span className="ml-2 text-sm font-medium">Close</span>
              </>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`${drawerOpen ? 'ml-64' : 'ml-16'} flex-1 overflow-y-auto transition-all duration-300 ease-in-out`}>
        <div className="p-8">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {location.pathname === '/dashboard' ? 'OpenBioCure Platform' : location.pathname === '/publication-review' ? 'Publications' : 'Profile'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-500 text-sm">No new notifications</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img 
                    src="https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png" 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-700 font-medium">Dr. Sarah Chen</span>
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <img 
                          src="https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png" 
                          alt="Dr. Sarah Chen" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">Dr. Sarah Chen</p>
                          <p className="text-sm text-gray-500 break-words">sarah.chen@university.edu</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help & Support
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={() => handleThemeChange('light')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Sun className="w-4 h-4 mr-3 text-gray-400" />
                        Light Mode
                      </button>
                      <button 
                        onClick={() => handleThemeChange('dark')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Moon className="w-4 h-4 mr-3 text-gray-400" />
                        Dark Mode
                      </button>
                      <button 
                        onClick={() => handleThemeChange('auto')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Monitor className="w-4 h-4 mr-3 text-gray-400" />
                        Auto
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
