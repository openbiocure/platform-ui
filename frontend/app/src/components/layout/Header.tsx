import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Palette
} from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [appearanceMenuOpen, setAppearanceMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0); // Track unread notifications

  // Click outside handlers for menus
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close notifications menu if clicking outside
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      
      // Close profile menu if clicking outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }

      // Close appearance menu if clicking outside
      if (appearanceMenuOpen) {
        setAppearanceMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [appearanceMenuOpen]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    // Handle theme change logic here
    console.log('Theme changed to:', theme);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-8 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {location.pathname === '/dashboard' ? 'Dashboard' : 
               location.pathname === '/workspace' ? 'Workspace' :
               location.pathname === '/publication-review' ? 'Publications' : 'Profile'}
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
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
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
                    {/* Organisation Settings - New item at top */}
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                      Organisation Settings
                      <ChevronDown className="w-4 h-4 ml-auto text-gray-400" />
                    </button>
                    
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
                      Personal Settings
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Help & Support
                    </button>
                    
                    {/* Appearance Section */}
                    <button 
                      onClick={() => setAppearanceMenuOpen(!appearanceMenuOpen)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Palette className="w-4 h-4 mr-3 text-gray-400" />
                      Appearance
                      <ChevronDown className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${appearanceMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Appearance Submenu */}
                    {appearanceMenuOpen && (
                      <div className="ml-4 border-l border-gray-200">
                        <button 
                          onClick={() => handleThemeChange('light')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        >
                          <Sun className="w-4 h-4 mr-3 text-gray-400" />
                          Light Mode
                        </button>
                        <button 
                          onClick={() => handleThemeChange('dark')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        >
                          <Moon className="w-4 h-4 mr-3 text-gray-400" />
                          Dark Mode
                        </button>
                        <button 
                          onClick={() => handleThemeChange('auto')}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                        >
                          <Monitor className="w-4 h-4 mr-3 text-gray-400" />
                          Auto
                        </button>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={() => console.log('Logout clicked')}
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
        </div>
      </div>
    </header>
  );
};

export default Header;
