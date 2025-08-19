import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus } from 'lucide-react';

interface Project {
  // Add any specific props if needed
}

interface LiteratureReviewProps {
  project: Project;
}

export const LiteratureReview: React.FC<LiteratureReviewProps> = ({ project }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">Literature Review & Analysis</h3>
      <Button className="bg-[#001E62] hover:bg-[#001E62]/90 text-white">
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
