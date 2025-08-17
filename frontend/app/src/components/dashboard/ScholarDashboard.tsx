import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Brain, 
  Database, 
  FlaskConical, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Plus, 
  LogOut, 
  Search, 
  Zap, 
  BookOpen, 
  FileText, 
  Target, 
  Play, 
  Pause, 
  CheckCircle2,
  Circle,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Share,
  Globe,
  Calendar
} from 'lucide-react';

// Mock data based on the research workflow
const mockProjects = [
  {
    id: 'lung-cancer-biomarkers',
    name: 'Early Detection Biomarkers for Lung Cancer',
    status: 'active',
    phase: 'execution',
    phaseName: 'Data Collection & Experimentation',
    phaseWeek: 28,
    totalWeeks: 104,
    progress: 27,
    team: [
      { name: 'Dr. Sarah Chen', role: 'Principal Investigator', avatar: 'SC' },
      { name: 'Dr. Michael Rodriguez', role: 'Biostatistician', avatar: 'MR' },
      { name: 'Dr. Emily Watson', role: 'Clinical Coordinator', avatar: 'EW' }
    ],
    collaborators: 6,
    datasets: 3,
    experiments: 2,
    publications: 1,
    lastUpdated: '2 hours ago',
    nextMilestone: 'Complete Phase 2 data collection',
    nextMilestoneDate: '2024-02-15'
  }
];

const ScholarDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch(logoutUser());
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top App Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-[#00239C]" />
              <h1 className="text-xl font-bold text-gray-900">OpenBioCure</h1>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search publications, datasets, research topics..."
                className="w-96 pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00239C] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Tools Menu */}
            <div className="relative group">
              <Button size="sm" variant="outline" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Tools</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Brain className="w-4 h-4 mr-3 text-[#00239C]" />
                    AI Research Assistant
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Database className="w-4 h-4 mr-3 text-blue-600" />
                    Data Explorer
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Plus className="w-4 h-4 mr-3 text-green-600" />
                    New Project
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <BookOpen className="w-4 h-4 mr-3 text-purple-600" />
                    Literature Review
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Users className="w-4 h-4 mr-3 text-orange-600" />
                    Find Collaborators
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-[#00239C] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">Research Scientist</p>
              </div>
              <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Project Navigation */}
        <aside className="w-80 bg-white border-r border-gray-200 h-screen sticky top-16">
          <div className="p-6">
            <Button className="w-full bg-[#00239C] hover:bg-[#001E62] mb-8 font-semibold py-3">
              <Plus className="w-5 h-5 mr-2" />
              New Research Project
            </Button>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Active Research Projects</h3>
                
                {mockProjects.map((project) => (
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
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate text-sm ${
                          selectedProject === project.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {project.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            selectedProject === project.id 
                              ? 'bg-white/20 text-white' 
                              : getPhaseColor(project.phase)
                          }`}>
                            {project.phaseName}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <p className={`text-xs mt-1 ${
                            selectedProject === project.id ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            Week {project.phaseWeek} of {project.totalWeeks} ({project.progress}% complete)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-gray-50">
          {selectedProject ? (
            <ProjectWorkspace project={mockProjects.find(p => p.id === selectedProject)!} />
          ) : (
            <ScholarHomeDashboard />
          )}
        </main>
      </div>
    </div>
  );
};

// Helper function for phase colors
const getPhaseColor = (phase: string) => {
  switch (phase) {
    case 'discovery': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'execution': return 'bg-green-100 text-green-800 border-green-200';
    case 'analysis': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'publication': return 'bg-indigo-100 text-indigo-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Project Workspace Component
const ProjectWorkspace: React.FC<{ project: any }> = ({ project }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Project Overview', icon: <Target className="w-4 h-4" /> },
    { id: 'literature', name: 'Literature Review', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'data', name: 'Data & Experiments', icon: <Database className="w-4 h-4" /> },
    { id: 'analysis', name: 'Analysis & Results', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'collaboration', name: 'Team & Collaboration', icon: <Users className="w-4 h-4" /> },
    { id: 'publications', name: 'Publications', icon: <FileText className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-8">
      {/* Project Header */}
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(project.phase)}`}>
                {project.phaseName}
              </span>
              <span className="text-gray-600">Week {project.phaseWeek} of {project.totalWeeks}</span>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2">
              <Users className="w-4 h-4 mr-2" />
              Invite Team Member
            </Button>
            <Button className="bg-[#00239C] hover:bg-[#001E62] text-white px-6 py-2 font-semibold">
              <Zap className="w-4 h-4 mr-2" />
              Start Experiment
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Project Progress</span>
            <span className="text-sm font-medium text-gray-700">{project.progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] h-3 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Next Milestone */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Next Milestone</h4>
              <p className="text-sm text-blue-700">{project.nextMilestone}</p>
              <p className="text-xs text-blue-600">Due: {project.nextMilestoneDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-[#00239C] text-[#00239C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && <ProjectOverview project={project} />}
          {activeTab === 'literature' && <LiteratureReview project={project} />}
          {activeTab === 'data' && <DataExperiments project={project} />}
          {activeTab === 'analysis' && <AnalysisResults project={project} />}
          {activeTab === 'collaboration' && <TeamCollaboration project={project} />}
          {activeTab === 'publications' && <Publications project={project} />}
        </div>
      </div>
    </div>
  );
};

// Tab Components
const ProjectOverview: React.FC<{ project: any }> = ({ project }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{project.datasets}</div>
            <div className="text-sm text-gray-600">Datasets</div>
          </div>
          <Database className="w-10 h-10 text-blue-500" />
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{project.experiments}</div>
            <div className="text-sm text-gray-600">Active Experiments</div>
          </div>
          <FlaskConical className="w-10 h-10 text-green-500" />
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{project.publications}</div>
            <div className="text-sm text-gray-600">Publications</div>
          </div>
          <FileText className="w-10 h-10 text-purple-500" />
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900">{project.collaborators}</div>
            <div className="text-sm text-gray-600">Team Members</div>
          </div>
          <Users className="w-10 h-10 text-orange-500" />
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Team</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {project.team.map((member: any, index: number) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#00239C] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{member.avatar}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const LiteratureReview: React.FC<{ project: any }> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Literature Review & Analysis</h3>
      <Button className="bg-[#00239C] hover:bg-[#001E62] text-white">
        <Plus className="w-4 h-4 mr-2" />
        Add Publication Review
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Publications Reviewed</CardTitle>
          <CardDescription>AI-powered analysis of relevant literature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900 mb-2">47</div>
          <p className="text-blue-700 text-sm">Papers analyzed with AI extraction</p>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Research Gaps Identified</CardTitle>
          <CardDescription>Key opportunities for investigation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900 mb-2">12</div>
          <p className="text-green-700 text-sm">Areas requiring further research</p>
        </CardContent>
      </Card>
    </div>
  </div>
);

const DataExperiments: React.FC<{ project: any }> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Data & Experiments</h3>
      <Button className="bg-[#00239C] hover:bg-[#001E62] text-white">
        <Plus className="w-4 h-4 mr-2" />
        New Experiment
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Phase 1 Biomarker Data</h4>
                <p className="text-sm text-gray-600">800 samples, 15 biomarkers</p>
              </div>
              <span className="text-green-600 text-sm">✓ Complete</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Biomarker Validation Study</h4>
                <p className="text-sm text-gray-600">Week 3 of 8</p>
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '37%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const AnalysisResults: React.FC<{ project: any }> = ({ project }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Analysis & Results</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Statistical Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Sample Size</span>
              <span className="font-medium">800</span>
            </div>
            <div className="flex justify-between">
              <span>Statistical Power</span>
              <span className="font-medium">85%</span>
            </div>
            <div className="flex justify-between">
              <span>Significance Level</span>
              <span className="font-medium">p &lt; 0.05</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900">Biomarker Combination A</h4>
              <p className="text-sm text-green-700">Sensitivity: 89%, Specificity: 92%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const TeamCollaboration: React.FC<{ project: any }> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Team & Collaboration</h3>
      <Button className="bg-[#00239C] hover:bg-[#001E62] text-white">
        <Users className="w-4 h-4 mr-2" />
        Invite Collaborator
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.team.map((member: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#00239C] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{member.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <span className="text-green-600 text-sm">Active</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              <p>Dr. Rodriguez uploaded new dataset</p>
              <p className="text-xs">2 hours ago</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>Team meeting scheduled for tomorrow</p>
              <p className="text-xs">4 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const Publications: React.FC<{ project: any }> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Publications & Outputs</h3>
      <Button className="bg-[#00239C] hover:bg-[#001E62] text-white">
        <Plus className="w-4 h-4 mr-2" />
        New Publication
      </Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Published Papers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">"Early Detection Biomarkers in Lung Cancer"</h4>
              <p className="text-sm text-gray-600">Nature Medicine, 2024</p>
              <p className="text-sm text-gray-600">Citations: 23</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium">Phase 2 Results Paper</h4>
              <p className="text-sm text-yellow-700">Draft in progress</p>
              <p className="text-sm text-yellow-600">Target: March 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Scholar Home Dashboard
const ScholarHomeDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const mockTrendingTopics = [
    {
      id: 1,
      topic: 'Novel Biomarkers for Early-Stage Lung Cancer Detection',
      trend: 'up',
      change: '+45%',
      publications: 23,
      citations: 156,
      relevance: 'high',
      chartData: [12, 15, 18, 23, 28, 23]
    },
    {
      id: 2,
      topic: 'Traditional Chemotherapy Approaches',
      trend: 'down',
      change: '-18%',
      publications: 15,
      citations: 67,
      relevance: 'low',
      chartData: [25, 22, 18, 15, 12, 15]
    },
    {
      id: 3,
      topic: 'CRISPR Gene Editing for Rare Genetic Disorders',
      trend: 'up',
      change: '+67%',
      publications: 42,
      citations: 312,
      relevance: 'high',
      chartData: [15, 22, 28, 35, 42, 42]
    }
  ];

  return (
    <div className="space-y-8">

      {/* AI Research Search - Compact Top Section */}
      <Card className="bg-gradient-to-r from-[#00239C] to-[#001E62] text-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Brain className="w-8 h-8 text-white/90" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">AI Research Assistant</h3>
              <p className="text-sm text-white/80 mb-3">
                Ask me anything about your research. I can help with literature, data analysis, and collaboration.
              </p>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about latest breakthroughs, find studies, discover collaborators..."
                  className="w-full pl-4 pr-20 py-2 text-gray-900 bg-white rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-sm placeholder-gray-500"
                />
                <Button className="absolute right-1 top-1 bg-[#00239C] hover:bg-[#001E62] text-white px-3 py-1 rounded text-sm">
                  <Zap className="w-4 h-4 mr-1" />
                  Ask
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Trending Research Topics</CardTitle>
          <CardDescription>Emerging areas gaining momentum in your field</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockTrendingTopics.map((topic) => (
              <div key={topic.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                  {topic.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                {/* Mini Line Chart */}
                <div className="mb-4">
                  <div className="h-16 bg-gray-50 p-2 rounded border relative">
                    <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={topic.trend === 'up' ? '#10B981' : '#EF4444'}
                        strokeWidth="2"
                        points={topic.chartData.map((value, index) => {
                          const x = (index / (topic.chartData.length - 1)) * 100;
                          const maxValue = Math.max(...topic.chartData);
                          const y = 60 - ((value / maxValue) * 60);
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">6-month trend</div>
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
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      topic.relevance === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-xs text-gray-600">
                      {topic.relevance === 'high' ? 'High Relevance' : 'Medium Relevance'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Requests */}
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#00239C]" />
            <span>Collaboration Requests</span>
          </CardTitle>
          <CardDescription>New opportunities from colleagues and research partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* High Priority - Cancer Research Consortium */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-semibold text-sm">SC</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">Cancer Research Consortium Invitation</h3>
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">High Priority</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Dr. Sarah Chen</strong> invited you to join the "Early Detection Biomarkers Consortium" - a multi-institutional effort to develop novel cancer screening methods. Your expertise in lung cancer biomarkers would be invaluable.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>8 institutions, 24 researchers</span>
                      </span>
                      <span>•</span>
                      <span>Funding: $2.4M NIH Grant</span>
                      <span>•</span>
                      <span>Duration: 3 years</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Accept Invitation
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
              </div>
            </div>

            {/* Medium Priority - Data Sharing Collaboration */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">MR</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">Dataset Collaboration Request</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Medium Priority</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Dr. Michael Rodriguez</strong> from Stanford wants to share his Phase 3 clinical trial data on immunotherapy combinations. He's interested in combining it with your biomarker findings for a comprehensive analysis.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Database className="w-3 h-3" />
                        <span>1,200 patient samples</span>
                      </span>
                      <span>•</span>
                      <span>Phase 3 clinical trial</span>
                      <span>•</span>
                      <span>Potential publication</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        Accept Collaboration
                      </Button>
                      <Button size="sm" variant="outline">
                        Review Data
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>

            {/* Medium Priority - International Research Network */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-semibold text-sm">EW</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">International Precision Medicine Network</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Medium Priority</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Dr. Emily Watson</strong> from Oxford invites you to join a global network studying precision medicine approaches. Your biomarker research aligns perfectly with their European patient cohort studies.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>12 countries, 45 researchers</span>
                      </span>
                      <span>•</span>
                      <span>EU Horizon funding</span>
                      <span>•</span>
                      <span>Data sharing agreement</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Join Network
                      </Button>
                      <Button size="sm" variant="outline">
                        Learn More
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">3 days ago</span>
                </div>
              </div>
            </div>

            {/* Low Priority - Conference Presentation */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-semibold text-sm">JW</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">Joint Conference Presentation</h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Low Priority</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Dr. James Wilson</strong> suggests presenting your combined findings at the upcoming American Association for Cancer Research conference. He'll handle logistics if you provide the biomarker data.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>AACR Conference, April 2024</span>
                      </span>
                      <span>•</span>
                      <span>San Diego, CA</span>
                      <span>•</span>
                      <span>Abstract deadline: Feb 15</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Discuss Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">5 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Research Stories */}
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#00239C]" />
            <span>Research Stories</span>
          </CardTitle>
          <CardDescription>Inspiring research narratives and breakthrough discoveries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FlaskConical className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">The Accidental Discovery</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    How a failed experiment led to a breakthrough in cancer immunotherapy. Dr. Sarah Chen's team discovered that a "failed" drug combination actually activated the immune system in unexpected ways.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Cancer Research</span>
                    <span>•</span>
                    <span>2 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Cross-Continental Collaboration</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    How researchers from 5 countries solved a rare disease mystery in just 6 months. The power of global collaboration and shared data platforms.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Rare Diseases</span>
                    <span>•</span>
                    <span>1 week ago</span>
                    </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Drug Discovery</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    How machine learning identified a new drug target in 3 weeks instead of 3 years. The future of pharmaceutical research is here.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>AI Research</span>
                    <span>•</span>
                    <span>3 days ago</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Precision Medicine Breakthrough</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    A personalized treatment approach that cured 80% of patients with a previously untreatable form of leukemia.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Precision Medicine</span>
                    <span>•</span>
                    <span>5 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
};

export default ScholarDashboard;
