import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Brain, 
  Database, 
  FlaskConical, 
  TrendingUp, 
  Users, 
  User, 
  Building2, 
  Clock, 
  Calendar, 
  Award, 
  BarChart3, 
  Plus, 
  LogOut, 
  Search, 
  Zap, 
  BookOpen, 
  MessageSquare, 
  Bell, 
  UserCircle, 
  CheckCircle, 
  Lightbulb, 
  Sparkles,
  Send,
  Network,
  ZoomIn,
  Filter,
  GripVertical,
  X,
  Settings,
  Save,
  RotateCcw,
  Activity,
  FileText,
  Tag,
  Eye,
  Star,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Target
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topicTrends, setTopicTrends] = useState<any[]>([]);
  const [workspaceChanges, setWorkspaceChanges] = useState<any[]>([]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Mock personalized data based on US-001 requirements
  useEffect(() => {
    // Simulate loading personalized data
    setNotifications([
      {
        id: 1,
        type: 'publication',
        title: 'New paper published in your field',
        summary: 'AI-generated summary: "Breakthrough in cancer biomarker research shows 23% improvement in early detection rates"',
        priority: 'high',
        time: '2 hours ago',
        read: false
      },
      {
        id: 2,
        type: 'workspace',
        title: 'Team workspace updated',
        summary: 'AI-generated summary: "Dr. Smith added new dataset to Alzheimer\'s research project"',
        priority: 'medium',
        time: '4 hours ago',
        read: false
      },
      {
        id: 3,
        type: 'trending',
        title: 'Topic trend alert',
        summary: 'AI-generated summary: "Protein-protein interactions gaining 15% more citations this week"',
        priority: 'low',
        time: '6 hours ago',
        read: true
      }
    ]);

    setRecentActivity([
      {
        id: 1,
        type: 'publication',
        title: 'Published: "Novel Biomarkers in Alzheimer\'s Disease"',
        topic: 'Neuroscience',
        impact: 'high',
        time: '1 day ago',
        citations: 12
      },
      {
        id: 2,
        type: 'dataset',
        title: 'Uploaded: Cancer Biomarker Dataset v2.1',
        topic: 'Oncology',
        impact: 'medium',
        time: '2 days ago',
        samples: 1200
      },
      {
        id: 3,
        type: 'experiment',
        title: 'Completed: Drug Efficacy Analysis',
        topic: 'Pharmacology',
        impact: 'high',
        time: '3 days ago',
        success: '85%'
      }
    ]);

    setTopicTrends([
      {
        id: 1,
        topic: 'Cancer Biomarkers',
        trend: 'up',
        change: '+23%',
        publications: 156,
        citations: 1247,
        color: '#00239C'
      },
      {
        id: 2,
        topic: 'Protein Structures',
        trend: 'up',
        change: '+15%',
        publications: 89,
        citations: 892,
        color: '#00A3E0'
      },
      {
        id: 3,
        topic: 'Drug Discovery',
        trend: 'down',
        change: '-8%',
        publications: 234,
        citations: 1890,
        color: '#E76900'
      },
      {
        id: 4,
        topic: 'Genomics',
        trend: 'up',
        change: '+31%',
        publications: 67,
        citations: 456,
        color: '#001E62'
      }
    ]);

    setWorkspaceChanges([
      {
        id: 1,
        type: 'invite',
        title: 'Team Invitation',
        description: 'Dr. Sarah Chen invited you to join "Cancer Research Consortium"',
        workspace: 'Cancer Research',
        time: '1 hour ago',
        action: 'accept'
      },
      {
        id: 2,
        type: 'update',
        title: 'Workspace Updated',
        description: 'New dataset added to "Alzheimer\'s Study" workspace',
        workspace: 'Alzheimer\'s Study',
        time: '3 hours ago',
        action: 'view'
      },
      {
        id: 3,
        type: 'collaboration',
        title: 'Collaboration Request',
        description: 'Prof. Mike Rodriguez wants to share findings on protein interactions',
        workspace: 'Protein Analysis',
        time: '5 hours ago',
        action: 'review'
      }
    ]);
  }, []);

  // Mock research projects
  const researchProjects = [
    {
      id: 'alzheimers-study',
      name: 'Alzheimer\'s Biomarker Research',
      status: 'active',
      type: 'Genomics',
      datasets: 3,
      experiments: 2,
      collaborators: 2,
      lastUpdated: '2 hours ago',
      impact: 'High'
    },
    {
      id: 'cancer-drug-discovery',
      name: 'Cancer Drug Discovery Pipeline',
      status: 'active',
      type: 'Drug Discovery',
      datasets: 5,
      experiments: 3,
      collaborators: 4,
      lastUpdated: '1 day ago',
      impact: 'High'
    },
    {
      id: 'protein-structure-analysis',
      name: 'Protein Structure Analysis',
      status: 'planning',
      type: 'Structural Biology',
      datasets: 1,
      experiments: 0,
      collaborators: 1,
      lastUpdated: '3 days ago',
      impact: 'Medium'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'publication': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'dataset': return <Database className="w-5 h-5 text-green-600" />;
      case 'experiment': return <FlaskConical className="w-5 h-5 text-purple-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top App Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Logo + Search */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-[#00239C]" />
              <h1 className="text-xl font-bold text-gray-900">OpenBioCure</h1>
            </div>
            
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search diseases, proteins, genes, drugs, pathways..."
                className="w-96 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00239C] focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: Actions + User */}
          <div className="flex items-center space-x-4">
            <Button size="sm" className="bg-[#00239C] hover:bg-[#001E62] text-white">
              <Brain className="w-4 h-4 mr-2" />
              AI Generated Publication
            </Button>
            <Button size="sm" variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Data Explorer
            </Button>
            <Button size="sm" variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              New Experiment
            </Button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-[#00239C] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Research Scientist</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out h-screen sticky top-16`}>
          <div className="p-6">
            {/* New Project Button */}
            <Button className="w-full bg-[#00239C] hover:bg-[#001E62] mb-8 font-semibold py-3">
              <Plus className="w-5 h-5 mr-2" />
              {sidebarOpen && 'New Research Project'}
            </Button>

            {/* Projects Section */}
            <div className="space-y-6">
              <div>
                <h3 className={`font-bold text-gray-900 text-sm uppercase tracking-wide mb-3 ${!sidebarOpen && 'hidden'}`}>Research Workspace</h3>
                
                {researchProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 mb-3 ${
                      selectedProject === project.id 
                        ? 'bg-[#00239C] text-white shadow-lg' 
                        : 'hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedProject === project.id ? 'bg-white' : 'bg-green-500'
                      }`} />
                      <div className={`flex-1 min-w-0 ${!sidebarOpen && 'hidden'}`}>
                        <p className={`font-semibold truncate ${
                          selectedProject === project.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {project.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            selectedProject === project.id 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {project.datasets} datasets
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            selectedProject === project.id 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {project.experiments} experiments
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area - Personalized Home Screen */}
        <main className="flex-1 p-8 bg-gray-50">
          {selectedProject ? (
            // Project Workspace View
            <div className="space-y-8">
              {/* Project Header */}
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {researchProjects.find(p => p.id === selectedProject)?.name}
                    </h1>
                    <p className="text-gray-600 text-lg mt-2">
                      {researchProjects.find(p => p.id === selectedProject)?.type} • 
                      {researchProjects.find(p => p.id === selectedProject)?.collaborators} collaborators
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2">
                      <Users className="w-4 h-4 mr-2" />
                      Invite Team
                    </Button>
                    <Button className="bg-[#00239C] hover:bg-[#001E62] text-white px-6 py-2 font-semibold">
                      <Zap className="w-4 h-4 mr-2" />
                      Start Experiment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Project KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">3</div>
                      <div className="text-sm text-gray-600">Datasets</div>
                    </div>
                    <Database className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">2</div>
                      <div className="text-sm text-gray-600">Active Experiments</div>
                    </div>
                    <FlaskConical className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">5</div>
                      <div className="text-sm text-gray-600">Hypotheses</div>
                    </div>
                    <Brain className="w-10 h-10 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">12</div>
                      <div className="text-sm text-gray-600">Insights</div>
                    </div>
                    <TrendingUp className="w-10 h-10 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Personalized Home Screen - US-001 Implementation
            <div className="space-y-8">
              {/* Welcome Header */}
              <div className="text-center py-8">
                <div className="max-w-3xl mx-auto">
                  <Brain className="w-16 h-16 text-[#00239C] mx-auto mb-4" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'Scholar'}!</h1>
                  <p className="text-xl text-gray-600">
                    Here's what's happening in your research world today
                  </p>
                </div>
              </div>

              {/* Notification Center with AI Summarizer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-white shadow-lg border border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-[#00239C] to-[#001E62] text-white">
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="w-5 h-5" />
                        <span>AI Notification Center</span>
                      </CardTitle>
                      <CardDescription className="text-blue-100">
                        AI-generated summaries of your important updates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div key={notification.id} className={`p-4 rounded-lg border ${getPriorityColor(notification.priority)} ${!notification.read ? 'ring-2 ring-[#00239C]' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">{notification.title}</h4>
                                <p className="text-sm text-gray-700 mb-3">{notification.summary}</p>
                                <div className="flex items-center space-x-4">
                                  <span className="text-xs text-gray-500">{notification.time}</span>
                                  {!notification.read && (
                                    <span className="text-xs bg-[#00239C] text-white px-2 py-1 rounded-full">New</span>
                                  )}
                                </div>
                              </div>
                              <button className="ml-4 p-2 rounded-lg hover:bg-gray-100">
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  <Card className="bg-white shadow-lg border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full bg-[#00239C] hover:bg-[#001E62] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Research Project
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Database className="w-4 h-4 mr-2" />
                        Upload Dataset
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FlaskConical className="w-4 h-4 mr-2" />
                        Start Experiment
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Users className="w-4 h-4 mr-2" />
                        Find Collaborators
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Workspace Changes */}
                  <Card className="bg-white shadow-lg border border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Workspace Updates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {workspaceChanges.map((change) => (
                        <div key={change.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <h4 className="font-medium text-gray-900 text-sm mb-1">{change.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{change.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{change.time}</span>
                            <Button size="sm" variant="outline" className="text-xs">
                              {change.action === 'accept' ? 'Accept' : change.action === 'view' ? 'View' : 'Review'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <Card className="bg-white shadow-lg border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity Timeline</CardTitle>
                  <CardDescription>Your latest research activities and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">{activity.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span>{activity.topic}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>Impact: {activity.impact}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock3 className="w-4 h-4" />
                              <span>{activity.time}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {activity.citations && (
                            <div className="text-sm font-medium text-blue-600">{activity.citations} citations</div>
                          )}
                          {activity.samples && (
                            <div className="text-sm font-medium text-green-600">{activity.samples} samples</div>
                          )}
                          {activity.success && (
                            <div className="text-sm font-medium text-purple-600">{activity.success} success</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Topic Trends */}
              <Card className="bg-white shadow-lg border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Topic Trends</CardTitle>
                  <CardDescription>Research areas gaining momentum in your field</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {topicTrends.map((topic) => (
                      <div key={topic.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                          {getTrendIcon(topic.trend)}
                        </div>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-gray-900">{topic.change}</div>
                          <div className="text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Publications</span>
                              <span className="font-medium">{topic.publications}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Citations</span>
                              <span className="font-medium">{topic.citations}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

