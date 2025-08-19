import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Database, 
  FlaskConical, 
  Users, 
  Plus, 
  Zap, 
  BookOpen, 
  FileText, 
  Target, 
  BarChart3
} from 'lucide-react';
import { ProjectOverview } from './ProjectOverview';
import { LiteratureReview } from './LiteratureReview';
import { DataExperiments } from './DataExperiments';
import { AnalysisResults } from './AnalysisResults';
import { TeamCollaboration } from './TeamCollaboration';
import { Publications } from './Publications';

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

interface Project {
  id: string;
  name: string;
  status: string;
  phase: string;
  phaseName: string;
  phaseWeek: number;
  totalWeeks: number;
  progress: number;
  team: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
  collaborators: number;
  datasets: number;
  experiments: number;
  publications: number;
  lastUpdated: string;
  nextMilestone: string;
  nextMilestoneDate: string;
}

interface ProjectWorkspaceProps {
  project: Project;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ project }) => {
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
            <Button className="bg-[#001E62] hover:bg-[#001E62]/90 text-white px-6 py-2 font-semibold">
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
              className="bg-gradient-to-r from-[#001E62] to-[#00A3E0] h-3 rounded-full transition-all duration-500"
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
                    ? 'border-[#001E62] text-[#001E62]'
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
