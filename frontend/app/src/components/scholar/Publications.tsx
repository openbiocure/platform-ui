import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus } from 'lucide-react';

interface Project {
  // Add any specific props if needed
}

interface PublicationsProps {
  project: Project;
}

export const Publications: React.FC<PublicationsProps> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Publications & Outputs</h3>
      <Button className="bg-[#001E62] hover:bg-[#001E62]/90 text-white">
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
