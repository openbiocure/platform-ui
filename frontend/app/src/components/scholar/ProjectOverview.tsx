import React from 'react';
import { Database, FlaskConical, FileText, Users } from 'lucide-react';

interface Project {
  datasets: number;
  experiments: number;
  publications: number;
  collaborators: number;
  team: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
}

interface ProjectOverviewProps {
  project: Project;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => (
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
        {project.team.map((member, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#001E62] rounded-full flex items-center justify-center">
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
