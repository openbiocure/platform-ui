import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users } from 'lucide-react';

interface Project {
  team: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
}

interface TeamCollaborationProps {
  project: Project;
}

export const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Team & Collaboration</h3>
      <Button className="bg-[#001E62] hover:bg-[#001E62]/90 text-white">
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
            {project.team.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#001E62] rounded-full flex items-center justify-center">
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
