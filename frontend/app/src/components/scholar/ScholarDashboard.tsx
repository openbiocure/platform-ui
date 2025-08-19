import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../ui/button';
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
import { ScholarDashboardSkeleton } from './ScholarDashboardSkeleton';
import { ScholarHomeDashboard } from './ScholarHomeDashboard';
import ScholarProfile from '../dashboard/ScholarProfile';

const ScholarDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation Drawer */}
      <aside className={`${drawerOpen ? 'w-64' : 'w-16'} bg-[#001E62] text-white flex flex-col fixed h-full transition-all duration-300 ease-in-out`}>
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
          <button 
            className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${drawerOpen ? 'justify-start' : 'justify-center'} bg-[#E76900]`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {drawerOpen && <span className="ml-3">Dashboard</span>}
          </button>
          <a className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg w-full ${drawerOpen ? 'justify-start' : 'justify-center'}`} href="/publication-review">
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
          {isLoading ? (
            <ScholarDashboardSkeleton />
          ) : (
            <>
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
                  
                  <div>
                    <h2 className="text-3xl font-bold text-[#00239C]">Scholar Dashboard</h2>
                    <p className="text-gray-500">Welcome back, Dr. Chen. Here's your research overview.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button 
                      className="relative p-2 rounded-full hover:bg-gray-200" 
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                    >
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="absolute top-0 right-0 h-4 w-4 bg-[#E76900] text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                    </button>
                    
                    {notificationsOpen && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                        <div className="p-4 border-b border-gray-100">
                          <h4 className="font-bold text-[#00239C] text-lg">Notifications</h4>
                          <p className="text-sm text-gray-500">You have 5 new notifications</p>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          {/* Collaboration Request */}
                          <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#00A3E0]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#00239C] text-sm">Collaboration Request</p>
                                <p className="text-sm text-gray-700 mt-1">Dr. Kenji Tanaka wants to collaborate on "Glyco-engineering of Antibodies"</p>
                                <p className="text-xs text-gray-500 mt-1">University of Tokyo • 2 hours ago</p>
                                <div className="mt-2 space-x-2">
                                  <Button size="sm" className="bg-[#00A3E0] text-white hover:bg-opacity-90 text-xs">Accept</Button>
                                  <Button size="sm" variant="outline" className="text-xs">Decline</Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Project Invitation */}
                          <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Target className="w-5 h-5 text-[#00A3E0]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#00239C] text-sm">Project Invitation</p>
                                <p className="text-sm text-gray-700 mt-1">Dr. Lena Vogel invites you to "Pan-Cancer Atlas Initiative"</p>
                                <p className="text-xs text-gray-500 mt-1">Charité - Universitätsmedizin Berlin • 1 day ago</p>
                                <div className="mt-2 space-x-2">
                                  <Button size="sm" className="bg-[#00A3E0] text-white hover:bg-opacity-90 text-xs">Join Project</Button>
                                  <Button size="sm" variant="outline" className="text-xs">Learn More</Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Publication Alert */}
                          <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <ArticleIcon className="w-5 h-5 text-[#00A3E0]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#00239C] text-sm">Publication Alert</p>
                                <p className="text-sm text-gray-700 mt-1">New paper published: "KRAS mutations in pancreatic cancer"</p>
                                <p className="text-xs text-gray-500 mt-1">Nature Medicine • 3 hours ago</p>
                                <div className="mt-2">
                                  <Button size="sm" className="bg-[#00A3E0] text-white hover:bg-opacity-90 text-xs">Read Paper</Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Data Update */}
                          <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-[#00A3E0]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#00239C] text-sm">Dataset Update</p>
                                <p className="text-sm text-gray-700 mt-1">TCGA database updated with 500 new lung cancer samples</p>
                                <p className="text-xs text-gray-500 mt-1">Cancer Genome Atlas • 6 hours ago</p>
                                <div className="mt-2">
                                  <Button size="sm" className="bg-[#00A3E0] text-white hover:bg-opacity-90 text-xs">Explore Data</Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Conference Reminder */}
                          <div className="p-4 hover:bg-gray-50">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-[#00A3E0]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#00239C] text-sm">Conference Reminder</p>
                                <p className="text-sm text-gray-700 mt-1">AACR Conference abstract deadline in 3 days</p>
                                <p className="text-xs text-gray-500 mt-1">American Association for Cancer Research • 1 day ago</p>
                                <div className="mt-2">
                                  <Button size="sm" className="bg-[#00A3E0] text-white hover:bg-opacity-90 text-xs">Submit Abstract</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                          <a className="block text-center text-[#00A3E0] font-semibold hover:text-[#00239C] transition-colors" href="#">
                            View All Notifications (12)
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Menu */}
                  <div className="relative">
                    <button 
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    >
                      <img 
                        src="https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png" 
                        alt="Dr. Sarah Chen" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-0 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
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
                            onClick={() => setCurrentView('profile')}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </button>
                          <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                          </a>
                          <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Help & Support
                          </a>
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

              <div className="flex">
                {/* Main Content Area */}
                <main className="flex-1 p-8 bg-gray-50">
                  {currentView === 'dashboard' ? (
                    <ScholarHomeDashboard />
                  ) : (
                    <ScholarProfile />
                  )}
                </main>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScholarDashboard;
