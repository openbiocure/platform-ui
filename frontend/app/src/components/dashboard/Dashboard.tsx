import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, 
  User, 
  Building2, 
  Zap, 
  Shield, 
  Users, 
  BarChart3, 
  FileText, 
  Brain, 
  FlaskConical,
  Settings,
  Bell
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'basic_research':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'ai_assistant_limited':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'full_access':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'team_collaboration':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'custom_branding':
        return <Shield className="w-5 h-5 text-indigo-500" />;
      default:
        return <Zap className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFeatureName = (feature: string) => {
    switch (feature) {
      case 'basic_research':
        return 'Basic Research Tools';
      case 'ai_assistant_limited':
        return 'AI Assistant (Limited)';
      case 'full_access':
        return 'Full Platform Access';
      case 'team_collaboration':
        return 'Team Collaboration';
      case 'custom_branding':
        return 'Custom Branding';
      default:
        return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getFeatureDescription = (feature: string) => {
    switch (feature) {
      case 'basic_research':
        return 'Access to core research and analysis tools';
      case 'ai_assistant_limited':
        return 'AI-powered research assistance (10 queries/day)';
      case 'full_access':
        return 'Complete access to all platform features';
      case 'team_collaboration':
        return 'Work together with your team members';
      case 'custom_branding':
        return 'Customize the platform with your brand';
      default:
        return 'Platform feature';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#00239C] rounded-full flex items-center justify-center">
                <img src="/icon.svg" alt="OpenBioCure" className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">OpenBioCure Platform</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {user.type === 'individual' ? (
              <User className="w-12 h-12 text-[#00239C]" />
            ) : (
              <Building2 className="w-12 h-12 text-[#00239C]" />
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-lg text-gray-600">
                {user.type === 'individual' 
                  ? 'Your personal research platform is ready'
                  : `${user.organization} team platform is active`
                }
              </p>
            </div>
          </div>
          
          {/* Account Info */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Status: <span className="font-medium text-green-600">Active</span>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Type: <span className="font-medium text-blue-600">
                    {user.type === 'individual' ? 'Individual' : 'Organization'}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Tenant: <span className="font-medium text-purple-600">{user.tenant}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    {getFeatureIcon(feature)}
                    <CardTitle className="text-lg">{getFeatureName(feature)}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {getFeatureDescription(feature)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
              <Brain className="w-6 h-6" />
              <span>AI Assistant</span>
            </Button>
            
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
              <FileText className="w-6 h-6" />
              <span>Research Tools</span>
            </Button>
            
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <BarChart3 className="w-6 h-6" />
              <span>Analytics</span>
            </Button>
            
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
              <FlaskConical className="w-6 h-6" />
              <span>Workflows</span>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-medium">Account created</span> • {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium">Last login</span> • {new Date(user.lastLoginAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-medium">Platform access granted</span> • Today
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA for Individual Users */}
        {user.type === 'individual' && (
          <div className="bg-gradient-to-r from-[#00239C] to-[#001E62] rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to unlock more features?</h3>
                <p className="text-blue-100 mb-4">
                  Upgrade to an organization plan to access team collaboration, custom branding, and unlimited AI assistance.
                </p>
                <Button variant="outline" className="bg-white text-[#00239C] hover:bg-gray-100">
                  Upgrade Now
                </Button>
              </div>
              <div className="hidden md:block">
                <Building2 className="w-24 h-24 text-blue-200" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
