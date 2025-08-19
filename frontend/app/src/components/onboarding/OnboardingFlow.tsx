import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Target, SkipForward, CheckCircle, User, Linkedin, Upload, Sparkles, Search, Globe, X } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface OnboardingData {
  title: string;
  profilePicture: string;
  researchInterests: string[];
  experience: string;
  education: string;
  skills: string[];
}

const OnboardingFlow: React.FC = () => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    title: '',
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
  
  // Image crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

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

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImage(e.target?.result as string);
      setShowCropModal(true);
      // Initialize crop to center
      const image = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 80,
            },
            1,
            img.width,
            img.height,
          ),
          img.width,
          img.height,
        );
        setCrop(crop);
      };
      img.src = image;
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1,
        width,
        height,
      ),
      width,
      height,
    );
    setCrop(crop);
  };

  const handleCropComplete = () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = 200;
    canvas.height = 200;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      200,
      200,
    );

    const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
    handleInputChange('profilePicture', croppedImage);
    setShowCropModal(false);
    setCropImage('');
    setCrop(undefined);
    setCompletedCrop(undefined);
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
        <div className="w-20 h-20 bg-[#00239C] rounded-lg flex items-center justify-center mx-auto mb-4">
          <Globe className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#00239C] mb-2">Import Your Profile</h2>
        <p className="text-sm text-gray-600 font-normal">Choose how you'd like to populate your profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LinkedIn Option */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-[#00239C] transition-colors text-center flex flex-col">
          <div className="w-16 h-16 bg-[#00239C] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Linkedin className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-[#001E62] mb-2">LinkedIn</h3>
          <p className="text-sm text-gray-600 mb-6 flex-grow font-normal">Import from your professional network</p>
          <Button
            onClick={handleLinkedinLogin}
            disabled={isAnalyzing}
            className="w-full bg-[#00239C] hover:bg-[#00239C]/90 text-white"
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
          <h3 className="text-lg font-semibold text-[#001E62] mb-2">ResearchGate</h3>
          <p className="text-sm text-gray-600 mb-6 flex-grow font-normal">Import from your research profile</p>
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
          <h3 className="text-lg font-semibold text-[#001E62] mb-2">Manual Entry</h3>
          <p className="text-sm text-gray-600 mb-6 flex-grow font-normal">Fill out your profile manually</p>
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
        <div className="w-20 h-20 bg-[#00239C] rounded-full flex items-center justify-center mx-auto mb-4">
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
        {/* Professional Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title</label>
          <input
            type="text"
            value={onboardingData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
            placeholder="Principal Investigator, Research Scientist, etc."
          />
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
                  if (file) handleFileUpload(file);
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
            <input
              type="text"
              placeholder="Enter research interest and press Enter..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleArrayChange('researchInterests', e.currentTarget.value.trim(), 'add');
                  e.currentTarget.value = '';
                }
              }}
            />
            
                                  {onboardingData.researchInterests.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {onboardingData.researchInterests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-[#00239C] text-white text-sm rounded-full flex items-center space-x-2"
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
            <div className="relative">
              <textarea
                value={onboardingData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent h-24 resize-none"
                placeholder="Brief description of your research experience..."
              />
              <button
                onClick={() => console.log('AI rewrite experience')}
                className="absolute right-2 top-2 px-3 py-1 bg-[#00A3E0] text-white text-xs rounded-md hover:bg-[#00A3E0]/90 transition-colors"
              >
                ✨ AI
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
            <div className="relative">
              <textarea
                value={onboardingData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent h-24 resize-none"
              />
              <button
                onClick={() => console.log('AI rewrite education')}
                className="absolute right-2 top-2 px-3 py-1 bg-[#00A3E0] text-white text-xs rounded-md hover:bg-[#00A3E0]/90 transition-colors"
              >
                ✨ AI
              </button>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills & Expertise</label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter skill and press Enter..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleArrayChange('skills', e.currentTarget.value.trim(), 'add');
                  e.currentTarget.value = '';
                }
              }}
            />
            
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
            <h3 className="text-lg font-semibold text-[#001E62] mb-2">Import from ResearchGate</h3>
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

  const renderCropModal = () => (
    showCropModal && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Crop Profile Picture</h3>
            <button 
              onClick={() => setShowCropModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4 text-center">
              Drag to position the crop area over your face. The image will be cropped to a perfect circle.
            </p>
            
            <div className="flex justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-w-md max-h-96"
              >
                <img
                  ref={imgRef}
                  alt="Crop"
                  src={cropImage}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-96 object-contain"
                />
              </ReactCrop>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCropModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              disabled={!completedCrop}
              className="bg-[#00239C] hover:bg-[#00239C]/90 text-white"
            >
              Crop & Save
            </Button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-[rgb(249,250,251)] flex items-center justify-center p-4 font-['Montserrat']">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        {!manualMode && !onboardingData.title ? renderImportOptions() : renderProfileForm()}
        
        <div className="flex justify-between items-center pt-6">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="px-6 py-2 border-[#001E62] text-[#001E62] hover:bg-[#001E62] hover:text-white font-medium"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for Now
          </Button>
          
          <Button
            onClick={handleComplete}
            disabled={onboardingData.researchInterests.length === 0}
            className="px-6 py-2 bg-[#00239C] hover:bg-[#00239C]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Setup
          </Button>
        </div>
      </div>
      
      {renderResearchGateModal()}
      {renderCropModal()}
    </div>
  );
};

export default OnboardingFlow;
