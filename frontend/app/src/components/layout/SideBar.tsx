import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface SideBarProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const SideBar: React.FC<SideBarProps> = ({ drawerOpen, setDrawerOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState('Project Alpha');

  // Actual projects from dashboard
  const projects = [
    { id: 'alpha', name: 'Project Alpha', active: true },
    { id: 'beta', name: 'Project Beta', active: false },
    { id: 'panCancer', name: 'Pan-Cancer Atlas Initiative', active: false }
  ];

  // Click outside handler for project dropdown
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const handleProjectChange = (projectId: string) => {
    setCurrentProject(projects.find(p => p.id === projectId)?.name || 'Project Alpha');
    setProjectDropdownOpen(false);
    // Here you would implement actual project switching logic
  };

  return (
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
          onClick={() => navigate('/workspace')}
          className={`flex items-center px-3 py-2 rounded-md w-full ${drawerOpen ? 'justify-start' : 'justify-center'} transition-colors ${location.pathname === '/workspace' ? 'bg-[#E76900] text-white' : 'text-gray-300 hover:bg-gray-700'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
          </svg>
          {drawerOpen && <span className="ml-3 text-sm font-medium">Workspace</span>}
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
  );
};

export default SideBar;
