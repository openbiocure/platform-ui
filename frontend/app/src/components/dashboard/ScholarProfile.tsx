import React from 'react';
import { Card, CardContent } from '../ui/card';
import { 
  MapPin, 
  Mail, 
  Globe, 
  Linkedin, 
  Twitter, 
  User
} from 'lucide-react';

// Simple profile data for configuration
const mockProfile = {
  personal: {
    name: 'Dr. Sarah Chen',
    title: 'Principal Investigator & Cancer Researcher',
    avatar: 'https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png',
    email: 'sarah.chen@university.edu',
    phone: '+1 (555) 123-4567',
    location: 'Stanford University, CA',
    website: 'https://sarahchenlab.stanford.edu',
    linkedin: 'linkedin.com/in/sarahchen',
    twitter: '@DrSarahChen',
    bio: 'Dr. Sarah Chen is a leading cancer researcher specializing in early detection biomarkers and precision medicine.',
    expertise: ['Cancer Biomarkers', 'Precision Medicine', 'Early Detection', 'Immunotherapy', 'Clinical Trials', 'Bioinformatics']
  }
};

const ScholarProfile: React.FC = () => {

  return (
    <div className="space-y-6">
      {/* Profile Header with Blue Gradient */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">Profile Configuration</h3>
          </div>
        </div>

        <div className="p-4">
          {/* Profile Info Row */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <img 
                src={mockProfile.personal.avatar} 
                alt={mockProfile.personal.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{mockProfile.personal.name}</h1>
              <p className="text-sm text-gray-600">{mockProfile.personal.title}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{mockProfile.personal.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{mockProfile.personal.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-4">
            <p className="text-sm text-gray-700">{mockProfile.personal.bio}</p>
          </div>

          {/* Expertise Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {mockProfile.personal.expertise.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-[#00239C]/10 text-[#00239C] rounded-full text-xs font-medium border border-[#00239C]/20"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-3 text-xs">
            <a href={mockProfile.personal.website} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:text-[#00239C] flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Website</span>
            </a>
            <a href={`https://${mockProfile.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:text-[#00239C] flex items-center space-x-1">
              <Linkedin className="w-3 h-3" />
              <span>LinkedIn</span>
            </a>
            <a href={`https://twitter.com/${mockProfile.personal.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-[#00A3E0] hover:text-[#00239C] flex items-center space-x-1">
              <Twitter className="w-3 h-3" />
              <span>Twitter</span>
            </a>
          </div>
        </div>
      </div>

      {/* Configuration Section with Blue Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-white font-semibold text-sm">Research Configuration</h3>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Research Focus Areas */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Research Focus Areas</label>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Primary Focus</h4>
                  <p className="text-xs text-gray-600">Cancer Biomarkers & Early Detection</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Secondary Focus</h4>
                  <p className="text-xs text-gray-600">Precision Medicine & Immunotherapy</p>
                </div>
              </div>
            </div>

            {/* Institution & Contact */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Institution & Contact</label>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Institution</h4>
                  <p className="text-xs text-gray-600">{mockProfile.personal.location}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">Phone</h4>
                  <p className="text-xs text-gray-600">{mockProfile.personal.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default ScholarProfile;
