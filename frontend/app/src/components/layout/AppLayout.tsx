import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { 
  Users, 
  LogOut, 
  BarChart3,
  Calendar,
  Bell,
  LayoutDashboard,
  Search as SearchIcon,
  FlaskConical as ScienceIcon,
  FileText as ArticleIcon,
  FileText,
  Bot,
  Target
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Click outside handlers for menus
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation Drawer */}
      <aside className={`${drawerOpen ? 'w-64' : 'w-16'} bg-[#001E62] text-white flex flex-col fixed h-full transition-all duration-300 ease-in-out z-40`}>
        <div className="flex items-center justify-center p-4 border-b border-gray-700">
          {drawerOpen ? (
            <>
              <img src="icon-white.svg" className="h-12 w-12" alt="OpenBioCure Logo" />
              <h1 className="text-xl font-bold ml-2">OpenBioCure</h1>
            </>
          ) : (
            <img src="icon-white.svg" className="h-12 w-12" alt="OpenBioCure Logo" />
          )}
        </div>
        
        <nav className={`flex-grow space-y-2 ${drawerOpen ? 'p-4' : 'p-2'}`}>
          <a 
            href="/dashboard"
            className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${drawerOpen ? 'justify-start' : 'justify-center'} hover:bg-gray-700 transition-colors`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {drawerOpen && <span className="ml-3">Dashboard</span>}
          </a>
          <a 
            href="/publication-review"
            className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg w-full ${drawerOpen ? 'justify-start' : 'justify-center'} transition-colors`}
          >
            <ArticleIcon className="w-5 h-5" />
            {drawerOpen && <span className="ml-3">Publications</span>}
          </a>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center ${drawerOpen ? 'justify-start' : 'justify-center'}`}>
            <img 
              src="https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png" 
              alt="Dr. Sarah Chen" 
              className="w-10 h-10 rounded-full object-cover"
            />
            {drawerOpen && (
              <div className="ml-3">
                <p className="font-semibold">Dr. Sarah Chen</p>
                <p className="text-sm text-gray-400">Cancer Researcher</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`${drawerOpen ? 'ml-64' : 'ml-16'} flex-1 overflow-y-auto transition-all duration-300 ease-in-out`}>
        <div className="p-8">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              {/* Drawer Toggle Button */}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900">OpenBioCure Platform</h1>
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
