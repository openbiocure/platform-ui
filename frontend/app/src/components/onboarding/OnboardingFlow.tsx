import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Target, SkipForward, CheckCircle, User, Linkedin, Upload, Sparkles, Search, Globe } from 'lucide-react';

interface OnboardingData {
  fullName: string;
  title: string;
  company: string;
  location: string;
  profilePicture: string;
  researchInterests: string[];
  experience: string;
  education: string;
  skills: string[];
}

const OnboardingFlow: React.FC = () => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fullName: '',
    title: '',
    company: '',
    location: '',
    profilePicture: '',
    researchInterests: [],
    experience: '',
    education: '',
    skills: []
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [importSource, setImportSource] = useState<'linkedin' | 'researchgate' | null>(null);
  const [showResearchGateModal, setShowResearchGateModal] = useState(false);
  const [researchGateUrl, setResearchGateUrl] = useState('');

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof OnboardingData, value: string, action: 'add' | 'remove') => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: action === 'add'
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleLinkedinLogin = async () => {
    // Redirect to LinkedIn OAuth
    const linkedinAuthUrl = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=r_liteprofile%20r_emailaddress&state=random_state_string';
    window.location.href = linkedinAuthUrl;
  };

  const handleResearchGateImport = async () => {
    setShowResearchGateModal(true);
  };

  const handleResearchGateSubmit = async () => {
    if (!researchGateUrl.trim()) return;
    
    setImportSource('researchgate');
    setIsAnalyzing(true);
    setShowResearchGateModal(false);
    
    try {
      // In real app, this would call your backend API to analyze the ResearchGate URL
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data from ResearchGate analysis
      const mockResearchGateData = {
        fullName: 'Dr. Sarah Chen',
        title: 'Principal Investigator',
        company: 'University of California, San Francisco',
        location: 'San Francisco, CA',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
        researchInterests: ['Cancer Biomarkers', 'Immunotherapy', 'Early Detection', 'Precision Medicine', 'Drug Discovery'],
        experience: 'Principal Investigator at UCSF Cancer Research Institute. Leading research on cancer biomarkers and immunotherapy approaches.',
        education: 'PhD in Molecular Biology, Stanford University; Postdoc at Harvard Medical School',
        skills: ['Cancer Research', 'Biomarker Discovery', 'Immunotherapy', 'Clinical Trials', 'Data Analysis', 'Team Leadership', 'Grant Writing']
      };
      
      setOnboardingData(mockResearchGateData);
      setManualMode(false);
    } catch (error) {
      console.error('ResearchGate import failed:', error);
      setManualMode(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    console.log('Onboarding completed:', onboardingData);
    window.location.href = '/dashboard';
  };

  const handleSkip = () => {
    console.log('Onboarding skipped');
    window.location.href = '/dashboard';
  };

  const renderImportOptions = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-[#00239C] to-[#00A3E0] rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#00239C] mb-2">Import Your Profile</h2>
        <p className="text-gray-600">Choose how you'd like to populate your profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LinkedIn Option */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-[#0077B5] transition-colors text-center flex flex-col">
          <div className="w-16 h-16 bg-[#0077B5] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Linkedin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">LinkedIn</h3>
          <p className="text-sm text-gray-600 mb-6 flex-grow">Import from your professional network</p>
          <Button
            onClick={handleLinkedinLogin}
            disabled={isAnalyzing}
            className="w-full bg-[#0077B5] hover:bg-[#0077B5]/90 text-white"
          >
            {isAnalyzing && importSource === 'linkedin' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <Linkedin className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* ResearchGate Option */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-[#00CCAA] transition-colors text-center flex flex-col">
          <div className="w-16 h-16 bg-[#00CCAA] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ResearchGate</h3>
          <p className="text-sm text-gray-600 mb-6 flex-grow">Import from your research profile</p>
          <Button
            onClick={handleResearchGateImport}
            disabled={isAnalyzing}
            className="w-full bg-[#00CCAA] hover:bg-[#00CCAA]/90 text-white"
          >
            {isAnalyzing && importSource === 'researchgate' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Importing...
              </>
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Manual Option */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-[#00A3E0] transition-colors text-center flex flex-col">
          <div className="w-16 h-16 bg-[#00A3E0] rounded-lg flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Entry</h3>
          <p className="text-sm text-gray-600 mb-6 flex-grow">Fill out your profile manually</p>
          <Button
            onClick={() => setManualMode(true)}
            variant="outline"
            className="w-full border-[#00A3E0] text-[#00A3E0] hover:bg-[#00A3E0] hover:text-white"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderProfileForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-[#00239C] to-[#00A3E0] rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#00239C] mb-2">Complete Your Profile</h2>
        <p className="text-gray-600">
          {importSource === 'linkedin' && 'Profile imported from LinkedIn'}
          {importSource === 'researchgate' && 'Profile imported from ResearchGate'}
          {!importSource && 'Help us personalize your OpenBioCure experience'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={onboardingData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              placeholder="Dr. Sarah Chen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
            <input
              type="text"
              value={onboardingData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              placeholder="Principal Investigator"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company/Institution</label>
            <input
              type="text"
              value={onboardingData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              placeholder="University of California"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={onboardingData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              placeholder="San Francisco, CA"
            />
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
          {onboardingData.profilePicture ? (
            <div className="flex items-center space-x-4">
              <img
                src={onboardingData.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#00A3E0] shadow-lg"
              />
              <div>
                <p className="text-sm text-gray-600">Profile picture uploaded</p>
                <button
                  onClick={() => handleInputChange('profilePicture', '')}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Remove picture
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#00A3E0] transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => handleInputChange('profilePicture', e.target?.result);
                    reader.readAsDataURL(file);
                  }
                }} 
                className="hidden" 
                id="profile-upload" 
              />
              <label htmlFor="profile-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload profile picture
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, or GIF (max 5MB)
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Research Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Research Interests <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter research interest..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleArrayChange('researchInterests', e.currentTarget.value.trim(), 'add');
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter research interest..."]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleArrayChange('researchInterests', input.value.trim(), 'add');
                    input.value = '';
                  }
                }}
                className="px-6 py-3 bg-[#00239C] hover:bg-[#00239C]/90 text-white"
              >
                Add
              </Button>
            </div>
            
            {onboardingData.researchInterests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {onboardingData.researchInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#00A3E0] text-white text-sm rounded-full flex items-center space-x-2"
                  >
                    <span>{interest}</span>
                    <button
                      onClick={() => handleArrayChange('researchInterests', interest, 'remove')}
                      className="ml-2 hover:text-red-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Experience & Education */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Experience</label>
            <textarea
              value={onboardingData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent h-24 resize-none"
              placeholder="Brief description of your research experience..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
            <textarea
              value={onboardingData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent h-24 resize-none"
              placeholder="Your educational background..."
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills & Expertise</label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter skill..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleArrayChange('skills', e.currentTarget.value.trim(), 'add');
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter skill..."]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleArrayChange('skills', input.value.trim(), 'add');
                    input.value = '';
                  }
                }}
                className="px-6 py-3 bg-[#00239C] hover:bg-[#00239C]/90 text-white"
              >
                Add
              </Button>
            </div>
            
            {onboardingData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {onboardingData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleArrayChange('skills', skill, 'remove')}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResearchGateModal = () => (
    showResearchGateModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#00CCAA] rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Import from ResearchGate</h3>
            <p className="text-sm text-gray-600">Enter your ResearchGate profile URL to import your research information</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">ResearchGate Profile URL</label>
            <input
              type="url"
              value={researchGateUrl}
              onChange={(e) => setResearchGateUrl(e.target.value)}
              placeholder="https://www.researchgate.net/profile/your-name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00CCAA] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              We'll analyze your public ResearchGate profile to extract relevant information
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowResearchGateModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResearchGateSubmit}
              disabled={!researchGateUrl.trim()}
              className="bg-[#00CCAA] hover:bg-[#00CCAA]/90 text-white"
            >
              Import Profile
            </Button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
        {!manualMode && !onboardingData.fullName ? renderImportOptions() : renderProfileForm()}
        
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="px-6 py-2 text-gray-600 hover:text-gray-800"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
          
          <Button
            onClick={handleComplete}
            disabled={onboardingData.researchInterests.length === 0}
            className="px-6 py-2 bg-[#00A3E0] hover:bg-[#00A3E0]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Setup
          </Button>
        </div>
      </div>
      
      {renderResearchGateModal()}
    </div>
  );
};

export default OnboardingFlow;
