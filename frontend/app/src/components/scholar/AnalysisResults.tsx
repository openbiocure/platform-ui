import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Project {
  // Add any specific props if needed
}

interface AnalysisResultsProps {
  project: Project;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ project }) => (
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
