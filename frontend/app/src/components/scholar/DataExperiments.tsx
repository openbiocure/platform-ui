import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus } from 'lucide-react';

interface Project {
  // Add any specific props if needed
}

interface DataExperimentsProps {
  project: Project;
}

export const DataExperiments: React.FC<DataExperimentsProps> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Data & Experiments</h3>
      <Button className="bg-[#001E62] hover:bg-[#001E62]/90 text-white">
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
