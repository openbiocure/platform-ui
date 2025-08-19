import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  BarChart3,
  Calendar,
  Bell,
  LayoutDashboard,
  Search as SearchIcon,
  FlaskConical,
  FlaskConical as ScienceIcon,
  FileText,
  Bot,
  Edit,
  BarChart,
  Megaphone,
  Lightbulb,
  Play,
  Bookmark,
  X,
  Target,
  Database,
  Users
} from 'lucide-react';

export const ScholarHomeDashboard: React.FC = () => {
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());
  const [activeProjectTab, setActiveProjectTab] = useState('alpha');

  const toggleInsight = (insightId: string) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(insightId)) {
        newSet.delete(insightId);
      } else {
        newSet.add(insightId);
      }
      return newSet;
    });
  };

  // Project workflow data
  const projectWorkflows: Record<string, {
    name: string;
    currentPhase: number;
    phases: Array<{
      phase: number;
      name: string;
      status: 'active' | 'completed' | 'pending';
      weeks: string;
      description: string;
      currentFocus?: string;
      insights?: string;
      icon: React.ReactElement;
    }>;
  }> = {
    alpha: {
      name: 'Project Alpha',
      currentPhase: 1,
      phases: [
        {
          phase: 1,
          name: 'Discovery & Hypothesis',
          status: 'active',
          weeks: 'Weeks 1-16',
          description: 'Literature review, gap analysis, and hypothesis formation.',
          currentFocus: 'Novel biomarkers for early-stage lung cancer detection',
          insights: 'AI has identified 50+ relevant papers and 3 promising datasets.',
          icon: <Lightbulb className="w-5 h-5" />
        },
        {
          phase: 2,
          name: 'Project Planning',
          status: 'pending',
          weeks: 'Weeks 17-24',
          description: 'Study design, resource planning, and risk assessment.',
          icon: <Edit className="w-5 h-5" />
        },
        {
          phase: 3,
          name: 'Execution',
          status: 'pending',
          weeks: 'Weeks 25-52',
          description: 'Data collection and experimentation.',
          icon: <FlaskConical className="w-5 h-5" />
        },
        {
          phase: 4,
          name: 'Analysis & Synthesis',
          status: 'pending',
          weeks: 'Weeks 53-78',
          description: 'Statistical analysis and knowledge synthesis.',
          icon: <BarChart className="w-5 h-5" />
        },
        {
          phase: 5,
          name: 'Publication & Dissemination',
          status: 'pending',
          weeks: 'Weeks 79-104',
          description: 'Manuscript writing and knowledge sharing.',
          icon: <Megaphone className="w-5 h-5" />
        }
      ]
    },
    beta: {
      name: 'Project Beta',
      currentPhase: 3,
      phases: [
        {
          phase: 1,
          name: 'Discovery & Hypothesis',
          status: 'completed',
          weeks: 'Weeks 1-16',
          description: 'Literature review, gap analysis, and hypothesis formation.',
          icon: <Lightbulb className="w-5 h-5" />
        },
        {
          phase: 2,
          name: 'Project Planning',
          status: 'completed',
          weeks: 'Weeks 17-24',
          description: 'Study design, resource planning, and risk assessment.',
          icon: <Edit className="w-5 h-5" />
        },
        {
          phase: 3,
          name: 'Execution',
          status: 'active',
          weeks: 'Weeks 25-52',
          description: 'Data collection and experimentation.',
          currentFocus: 'CRISPR gene editing validation in cell lines',
          insights: 'Week 35: 3/8 experiments completed, 2 cell lines showing promising results.',
          icon: <FlaskConical className="w-5 h-5" />
        },
        {
          phase: 4,
          name: 'Analysis & Synthesis',
          status: 'pending',
          weeks: 'Weeks 53-78',
          description: 'Statistical analysis and knowledge synthesis.',
          icon: <BarChart className="w-5 h-5" />
        },
        {
          phase: 5,
          name: 'Publication & Dissemination',
          status: 'pending',
          weeks: 'Weeks 79-104',
          description: 'Manuscript writing and knowledge sharing.',
          icon: <Megaphone className="w-5 h-5" />
        }
      ]
    },
    panCancer: {
      name: 'Pan-Cancer Atlas Initiative',
      currentPhase: 5,
      phases: [
        {
          phase: 1,
          name: 'Discovery & Hypothesis',
          status: 'completed',
          weeks: 'Weeks 1-16',
          description: 'Literature review, gap analysis, and hypothesis formation.',
          icon: <Lightbulb className="w-5 h-5" />
        },
        {
          phase: 2,
          name: 'Project Planning',
          status: 'completed',
          weeks: 'Weeks 17-24',
          description: 'Study design, resource planning, and risk assessment.',
          icon: <Edit className="w-5 h-5" />
        },
        {
          phase: 3,
          name: 'Execution',
          status: 'completed',
          weeks: 'Weeks 25-52',
          description: 'Data collection and experimentation.',
          icon: <FlaskConical className="w-5 h-5" />
        },
        {
          phase: 4,
          name: 'Analysis & Synthesis',
          status: 'completed',
          weeks: 'Weeks 53-78',
          description: 'Statistical analysis and knowledge synthesis.',
          icon: <BarChart className="w-5 h-5" />
        },
        {
          phase: 5,
          name: 'Publication & Dissemination',
          status: 'active',
          weeks: 'Weeks 79-104',
          description: 'Manuscript writing and knowledge sharing.',
          currentFocus: 'Multi-institutional paper submission to Nature',
          insights: 'Final manuscript 95% complete, coordinating with 12 partner institutions.',
          icon: <Megaphone className="w-5 h-5" />
        }
      ]
    }
  };

  return (
    <div className="space-y-8">
      {/* Trending Topics Section */}
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-[#001E62] mb-4">Trending Topics</h3>
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-lg text-[#001E62] mb-2">CRISPR Gene Editing</h4>
              <div className="flex items-center text-green-500 mb-3">
                <TrendingUp className="w-5 h-5" />
                <span className="ml-1 font-semibold">Trending Up</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">Recent breakthroughs in application for single-gene disorders.</p>
              <a className="text-[#00A3E0] font-semibold hover:underline flex items-center" href="#">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-lg text-[#001E62] mb-2">AI in Drug Discovery</h4>
              <div className="flex items-center text-green-500 mb-3">
                <TrendingUp className="w-5 h-5" />
                <span className="ml-1 font-semibold">Trending Up</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">ML models are accelerating candidate identification and validation.</p>
              <a className="text-[#00A3E0] font-semibold hover:underline flex items-center" href="#">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-lg text-[#001E62] mb-2">Immunotherapy Side Effects</h4>
              <div className="flex items-center text-red-500 mb-3">
                <TrendingDown className="w-5 h-5" />
                <span className="ml-1 font-semibold">Trending Down</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">Focus shifting towards mitigation strategies and patient stratification.</p>
              <a className="text-[#00A3E0] font-semibold hover:underline flex items-center" href="#">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-lg text-[#001E62] mb-2">Microbiome & Mental Health</h4>
              <div className="flex items-center text-green-500 mb-3">
                <TrendingUp className="w-5 h-5" />
                <span className="ml-1 font-semibold">Trending Up</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Growing evidence linking gut bacteria to neurological disorders.</p>
              <a className="text-[#00A3E0] font-semibold hover:underline flex items-center" href="#">
                View Details <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-[#001E62]">New Publications</h4>
            <div className="flex items-center text-gray-500">
              <span className="text-2xl font-bold text-[#001E62] mr-2">12</span>
              <span className="text-sm">As of Oct 26, 2023</span>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=96&h=96&fit=crop&crop=center&auto=format" 
              alt="Pancreatic Cancer Research" 
              className="w-24 h-24 rounded-md object-cover border border-gray-200"
            />
            <div className="ml-4">
              <p className="font-semibold text-[#001E62]">"Targeting KRAS mutations in pancreatic cancer with novel small molecule inhibitors"</p>
              <p className="text-sm text-gray-600 mt-2">Highlights: &gt;50% tumor regression in xenograft models, favorable toxicity profile.</p>
            </div>
          </div>
          <a className="mt-4 text-[#00A3E0] font-semibold hover:underline flex items-center self-start" href="#">
            View Details <ArrowRight className="w-4 h-4 ml-1" />
          </a>
          <div className="mt-auto pt-4 text-right">
            <a className="text-[#00A3E0] font-semibold hover:underline" href="#">View All Publications</a>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-[#001E62]">Citations</h4>
            <div className="flex items-center text-gray-500">
              <span className="text-2xl font-bold text-[#E76900] mr-2">8</span>
              <span className="text-sm">This week</span>
            </div>
          </div>
          <div className="mt-4 space-y-3 flex-grow">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-semibold text-[#001E62] truncate">Cited by "Nature Reviews Cancer" in an editorial on immunotherapy.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-semibold text-[#001E62] truncate">"Cell" publication from a lab in Stanford cites your 2021 paper.</p>
            </div>
          </div>
          <div className="mt-auto pt-4 text-right">
            <a className="text-[#00A3E0] font-semibold hover:underline" href="#">View All Citations</a>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-[#001E62]">Active Projects</h4>
            <div className="flex items-center text-gray-500">
              <span className="text-2xl font-bold text-green-500 mr-2">3</span>
              <span className="text-sm">In progress</span>
            </div>
          </div>
          <div className="mt-4 space-y-3 flex-grow">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-semibold text-sm text-[#001E62]">Pan-Cancer Atlas Initiative</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="font-semibold text-sm text-[#001E62]">Glyco-engineering of Antibodies</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-4 text-right">
            <a className="text-[#00A3E0] font-semibold hover:underline" href="#">View All Projects</a>
          </div>
        </div>
      </section>

      {/* AI Research Insights - Modern Card Design */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#001E62] to-[#00A3E0] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">AI Generated Research Insights</h4>
                  <p className="text-white/80 text-sm">Latest discoveries from 47 analyzed papers</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/90 text-sm">Updated 2h ago</div>
                <div className="text-white/70 text-xs">47 papers analyzed</div>
              </div>
            </div>
          </div>

          {/* Research Insight Cards Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* High Confidence Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    High Confidence
                  </span>
                  <span className="text-2xl font-bold text-green-600">89%</span>
                </div>
                <h6 className="text-base font-bold text-gray-900 mb-3 leading-tight">
                  Novel biomarkers for early-stage lung cancer detection
                </h6>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  AI analysis identified promising biomarker combinations that could detect lung cancer 6-12 months earlier than current methods. Strong evidence from multiple studies with consistent results.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    <span>23 supporting papers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Database className="w-4 h-4 mr-2 text-green-500" />
                    <span>3 relevant datasets</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
              </div>

              {/* Medium Confidence Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    Medium Confidence
                  </span>
                  <span className="text-2xl font-bold text-blue-600">76%</span>
                </div>
                <h6 className="text-base font-bold text-gray-900 mb-3 leading-tight">
                  CRISPR-based immunotherapy for KRAS mutations
                </h6>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Emerging evidence suggests CRISPR technology could enhance T-cell therapy for KRAS-mutated cancers. Preliminary results show promise but require further validation in larger studies.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    <span>18 supporting papers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FlaskConical className="w-4 h-4 mr-2 text-purple-500" />
                    <span>2 experimental protocols</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
              </div>

              {/* Low Confidence Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    Low Confidence
                  </span>
                  <span className="text-2xl font-bold text-orange-600">64%</span>
                </div>
                <h6 className="text-base font-bold text-gray-900 mb-3 leading-tight">
                  Metabolic reprogramming in cancer stem cells
                </h6>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Early-stage research indicates potential for targeting metabolic pathways in cancer stem cells. Limited data available, but preliminary results suggest this could be a novel therapeutic approach.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    <span>12 supporting papers</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4 mr-2 text-orange-500" />
                    <span>1 preliminary study</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-lg">⋯</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* View All Link */}
            <div className="mt-6 text-center">
              <a href="#" className="text-[#001E62] text-sm font-medium hover:text-[#001E62]/80 transition-colors underline decoration-dotted underline-offset-4">
                View all research insights →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Research Workflow Section */}
      <section>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header with Blue Gradient */}
          <div className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] px-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-sm">Projects Overview</h3>
            </div>
          </div>
          
          {/* Project Tabs and Workflow Body - Connected */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Project Tabs">
              {Object.entries(projectWorkflows).map(([key, project]) => (
                <button 
                  key={key}
                  onClick={() => setActiveProjectTab(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeProjectTab === key 
                      ? 'border-[#E76900] text-[#00239C]' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            <div className="relative">
              {/* Continuous timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="transition-opacity duration-300 ease-in-out">
                {projectWorkflows[activeProjectTab as keyof typeof projectWorkflows].phases.map((phase, index) => (
                  <div key={phase.phase} className="relative flex items-start mb-8 last:mb-0">
                    {/* Phase icon with connection line */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                        phase.status === 'active' 
                          ? 'bg-[#00A3E0] text-white' 
                          : phase.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-white'
                      }`}>
                        {phase.icon}
                      </div>
                    </div>
                    
                    {/* Phase content */}
                    <div className="ml-6 w-full">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={`font-bold text-lg ${
                          phase.status === 'active' 
                            ? 'text-[#001E62]' 
                            : phase.status === 'completed'
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}>
                          Phase {phase.phase}: {phase.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          phase.status === 'active' 
                            ? 'bg-blue-100 text-blue-800' 
                            : phase.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {phase.status === 'active' ? 'Active' : phase.status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{phase.weeks} • {phase.description}</p>
                      
                      {phase.status === 'active' && phase.currentFocus && (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                          <p className="font-semibold text-sm text-[#001E62] mb-2">
                            Current Focus: <span className="text-[#E76900]">"{phase.currentFocus}"</span>
                          </p>
                          <p className="text-xs text-gray-600 mb-3">{phase.insights}</p>
                          <button className="text-xs bg-[#00A3E0] text-white px-3 py-1.5 rounded hover:bg-opacity-90">
                            View Insights
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
