import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { 
  FileText,
  Eye,
  Clock,
  LayoutDashboard,
  Search as SearchIcon,
  FlaskConical as ScienceIcon,
  Users,
  Bot,
  LogOut,
  Bell,
  Menu,
  MoreVertical,
  Upload,
  FileText as FileTextIcon,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Trash2,
  Presentation,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';

const PublicationReviewAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [quickSummaryModalOpen, setQuickSummaryModalOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<any>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [publicationsPerPage] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [priorityFilter, setPriorityFilter] = useState('all');


  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleQuickSummary = (publication: any) => {
    setSelectedPublication(publication);
    setQuickSummaryModalOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = () => {
    // Here you would typically send the file to your backend for processing
    console.log('Uploading file:', uploadedFile);
    // Close modal and reset
    setUploadModalOpen(false);
    setUploadedFile(null);
  };

  // Click outside handler for publication menu
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedPublication(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filters = [
    { id: 'all', label: 'All Publications', count: 12 },
    { id: 'high-priority', label: 'High Priority', count: 3 },
    { id: 'recent', label: 'Recent (Last 7 days)', count: 5 },
    { id: 'cancer-biomarkers', label: 'Cancer Biomarkers', count: 4 },
    { id: 'immunotherapy', label: 'Immunotherapy', count: 3 },
    { id: 'early-detection', label: 'Early Detection', count: 2 }
  ];

  const publications = [
    {
      id: 1,
      title: "Novel Biomarker Combinations for Early-Stage Lung Cancer Detection",
      journal: "Nature Medicine",
      published: "March 2024",
      authors: "Dr. Elena Rodriguez et al., Memorial Sloan Kettering Cancer Center",
      priority: "high",
      relevance: 94,
      impact: "High",
      analysisTime: "2 hours ago",
      isAI: true,
      tags: ["cancer-biomarkers", "early-detection", "lung-cancer"],
      keyFindings: "Identified 3-protein biomarker panel (CEA, CYFRA21-1, ProGRP) with 89% sensitivity and 94% specificity for early-stage detection, 6 months earlier than current methods.",
      clinicalOutcomes: "Retrospective analysis of 1,200 patients showed 23% improvement in 5-year survival rates when cancer detected using new biomarker panel vs. standard screening.",
      strengths: [
        "Large patient cohort (1,200+ participants)",
        "Prospective validation in multiple centers",
        "Clear statistical significance (p &lt; 0.001)",
        "Practical clinical implementation pathway"
      ],
      gaps: [
        "No cost-effectiveness analysis provided",
        "Limited ethnic diversity in study population",
        "Biomarker stability over time not assessed",
        "Integration with existing screening protocols unclear"
      ]
    },
    {
      id: 2,
      title: "Combination Immunotherapy Strategies in Advanced Pancreatic Cancer",
      journal: "Cell",
      published: "February 2024",
      authors: "Dr. Michael Chang et al., Dana-Farber Cancer Institute",
      priority: "high",
      relevance: 97,
      impact: "Very High",
      analysisTime: "1 day ago",
      isAI: true,
      tags: ["immunotherapy", "pancreatic-cancer", "checkpoint-inhibition"],
      keyFindings: "Dual checkpoint inhibition (anti-PD-1 + anti-CTLA-4) combined with gemcitabine showed 31% objective response rate in previously treated pancreatic cancer patients.",
      clinicalOutcomes: "Median progression-free survival improved from 3.2 to 6.8 months, with manageable toxicity profile. Biomarker analysis revealed T-cell infiltration as predictive factor.",
      strengths: [
        "Novel combination approach for resistant disease",
        "Comprehensive biomarker analysis included",
        "Clear mechanistic insights provided",
        "Phase II trial design with proper controls"
      ],
      gaps: [
        "Small sample size (n=45) limits generalizability",
        "No comparison with standard second-line therapy",
        "Long-term survival data not yet available",
        "Cost implications not addressed"
      ]
    },
    {
      id: 3,
      title: "KRAS-Targeted Therapies: Overcoming Resistance Mechanisms",
      journal: "Science",
      published: "February 2024",
      authors: "Dr. Jennifer Park et al., MD Anderson Cancer Center",
      priority: "medium",
      relevance: 89,
      impact: "High",
      analysisTime: "3 days ago",
      isAI: false,
      tags: ["kras-mutations", "targeted-therapy", "resistance"],
      keyFindings: "Novel KRAS G12C inhibitors combined with MEK inhibitors show synergistic effects in overcoming acquired resistance in colorectal cancer models.",
      clinicalOutcomes: "Preclinical models demonstrated 40% reduction in tumor growth and delayed resistance development compared to single-agent therapy.",
      strengths: [
        "Mechanistic insights into resistance pathways",
        "Comprehensive preclinical validation",
        "Clear therapeutic strategy proposed",
        "Multiple cancer type applicability"
      ],
      gaps: [
        "Limited in vivo validation data",
        "Toxicity profile not fully characterized",
        "Clinical translation timeline unclear",
        "Biomarker selection criteria undefined"
      ]
    },
    {
      id: 4,
      title: "Liquid Biopsy for Minimal Residual Disease Detection",
      journal: "Nature Biotechnology",
      published: "January 2024",
      authors: "Dr. Robert Kim et al., Johns Hopkins University",
      priority: "medium",
      relevance: 87,
      impact: "Medium",
      analysisTime: "1 week ago",
      tags: ["liquid-biopsy", "minimal-residual-disease", "circulating-tumor-dna"],
      keyFindings: "Multi-analyte liquid biopsy panel detects minimal residual disease with 92% sensitivity and 88% specificity across multiple cancer types.",
      clinicalOutcomes: "Early detection of recurrence led to 3-month earlier intervention and 15% improvement in progression-free survival in breast cancer cohort.",
      strengths: [
        "Multi-cancer type applicability",
        "High sensitivity and specificity",
        "Clinical validation in multiple cohorts",
        "Non-invasive monitoring approach"
      ],
      gaps: [
        "Cost-effectiveness not established",
        "Standardization protocols needed",
        "False positive rate in healthy controls",
        "Integration with existing surveillance unclear"
      ]
    },
    {
      id: 5,
      title: "Machine Learning in Drug Discovery and Development",
      journal: "Cell",
      published: "December 2023",
      authors: "Dr. Lisa Wang et al., Stanford University",
      priority: "low",
      relevance: 78,
      impact: "Medium",
      analysisTime: "2 weeks ago",
      isAI: true,
      tags: ["machine-learning", "drug-discovery", "ai-applications"],
      keyFindings: "Deep learning models accelerate lead compound identification by 40% and improve success rates in early-stage drug development.",
      clinicalOutcomes: "AI-assisted drug screening reduced time to clinical trials by 18 months and increased compound viability by 25%.",
      strengths: [
        "Significant time reduction in drug discovery",
        "Improved success rates",
        "Cost-effective approach",
        "Scalable methodology"
      ],
      gaps: [
        "Limited validation in complex diseases",
        "Regulatory approval pathways unclear",
        "Requires extensive training data",
        "Black box interpretability issues"
      ]
    }
  ];

  const filteredPublications = publications.filter(pub => {
    // Filter by selected category
    let matchesCategory = true;
    if (selectedFilter === 'all') matchesCategory = true;
    else if (selectedFilter === 'high-priority') matchesCategory = pub.priority === 'high';
    else if (selectedFilter === 'recent') matchesCategory = pub.analysisTime.includes('hours') || pub.analysisTime.includes('day');
    else matchesCategory = pub.tags.includes(selectedFilter);
    
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.journal.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by priority
    const matchesPriority = priorityFilter === 'all' || pub.priority === priorityFilter;
    
    return matchesCategory && matchesSearch && matchesPriority;
  });

  // Sort publications
  const sortedPublications = [...filteredPublications].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      case 'oldest':
        return new Date(a.published).getTime() - new Date(b.published).getTime();
      case 'relevance':
        return b.relevance - a.relevance;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  const searchedPublications = sortedPublications;
  
  // Pagination logic
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = searchedPublications.slice(indexOfFirstPublication, indexOfLastPublication);
  const totalPages = Math.ceil(searchedPublications.length / publicationsPerPage);
  
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedPublication(null); // Close any open menus when changing pages
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation Drawer */}
      <aside className={`${drawerOpen ? 'w-64' : 'w-16'} bg-[#001E62] text-white flex flex-col fixed h-full transition-all duration-300 ease-in-out z-30`}>
        <div className="flex items-center justify-center p-4 border-b border-gray-700">
          {drawerOpen ? (
            <>
              <img src="/icon-white.svg" className="h-12 w-12" alt="OpenBioCure Logo" />
              <h1 className="text-xl font-bold ml-2">OpenBioCure</h1>
            </>
          ) : (
            <img src="/icon-white.svg" className="h-12 w-12" alt="OpenBioCure Logo" />
          )}
        </div>
        
        <nav className={`flex-grow space-y-2 ${drawerOpen ? 'p-4' : 'p-2'}`}>
          <a href="/dashboard" className={`flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg w-full ${drawerOpen ? 'justify-start' : 'justify-center'}`}>
            <LayoutDashboard className="w-5 h-5" />
            {drawerOpen && <span className="ml-3">Dashboard</span>}
          </a>
          
          <a href="/publication-review" className={`flex items-center px-4 py-2 text-white rounded-lg w-full ${drawerOpen ? 'justify-start' : 'justify-center'} bg-[#E76900]`}>
            <FileText className="w-5 h-5" />
            {drawerOpen && <span className="ml-3">Publications</span>}
          </a>
        
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center ${drawerOpen ? 'justify-start' : 'justify-center'}`}>
            <img 
              src="https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png" 
              alt="Dr. Sarah Chen" 
              className="w-10 h-10 rounded-full object-cover"
            />
            {drawerOpen && (
              <div className="ml-3">
                <p className="font-semibold">Dr. Sarah Chen</p>
                <p className="text-sm text-gray-400">Cancer Researcher</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`${drawerOpen ? 'ml-64' : 'ml-16'} flex-1 overflow-y-auto transition-all duration-300 ease-in-out`}>
        <div className="p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                {/* Drawer Toggle Button */}
                <button
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-600" />
                </button>
                
                <div>
                  <h1 className="text-4xl font-bold text-[#00239C] mb-2">Publication Review & Analysis</h1>
                  <p className="text-lg text-gray-600">AI-powered analysis of publications in your research domain</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Add Publication Button */}
                <Button
                  variant="outline"
                  onClick={() => setUploadModalOpen(true)}
                  className="border-[#00A3E0] text-[#00A3E0] hover:bg-[#00A3E0] hover:text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Add Publication
                </Button>
                
                {/* Notifications */}
                <div className="relative">
                  <button className="relative p-2 rounded-full hover:bg-gray-200">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-0 right-0 h-4 w-4 bg-[#E76900] text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                  </button>
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  >
                    <img 
                      src="https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png" 
                      alt="Dr. Sarah Chen" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-0 w-64 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img 
                            src="https://pfpassets.fra1.cdn.digitaloceanspaces.com/media/v1/prompts/scientist_face1_female_1.png" 
                            alt="Dr. Sarah Chen" 
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900">Dr. Sarah Chen</p>
                            <p className="text-sm text-gray-500 break-words">sarah.chen@university.edu</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </a>
                        <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </a>
                        <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Help & Support
                        </a>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>


              </div>
            </div>



        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search publications, authors, journals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Priority Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3E0]"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="relevance">Relevance Score</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
            
            {/* Results Count */}
            <div className="ml-auto text-sm text-gray-600">
              {searchedPublications.length} publications found
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-[#00239C] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-4">
        {currentPublications.map((pub) => (
          <div key={pub.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Publication Header */}
            <div className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-sm flex items-center">
                    {pub.isAI ? (
                      <>
                        <Bot className="w-4 h-4 mr-2" />
                        AI Generated Publication
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Manual Upload
                      </>
                    )}
                  </span>
                  <Clock className="w-4 h-4 text-white/80" />
                  <span className="text-xs text-white/80">{pub.analysisTime}</span>
                  

                </div>
                
                {pub.priority === 'high' && (
                  <span className="px-3 py-1 bg-[#E76900] text-white text-xs rounded-full font-medium">
                    High Priority
                  </span>
                )}
              </div>
            </div>
            
            {/* Publication Summary */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[#00239C] mb-3 leading-tight">
                  "{pub.title}"
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Journal:</strong> {pub.journal} • <strong>Published:</strong> {pub.published}</p>
                  <p><strong>Authors:</strong> {pub.authors}</p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {pub.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-[#00A3E0]/10 text-[#00A3E0] text-xs rounded-full border border-[#00A3E0]/20">
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-200">
                {/* Details Button */}
                <button
                  onClick={() => handleQuickSummary(pub)}
                  className="p-2 rounded-lg border border-[#00239C] text-[#00239C] hover:bg-[#00239C] hover:text-white transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {/* Publication Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setSelectedPublication(pub)}
                    className="p-2 rounded-lg border border-[#00A3E0] text-[#00A3E0] hover:bg-[#00A3E0] hover:text-white transition-colors flex items-center justify-center"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {selectedPublication?.id === pub.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => handleQuickSummary(pub)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <FileTextIcon className="w-4 h-4 mr-2" />
                          Quick Summary
                        </button>
                        <button
                          onClick={() => window.open('#', '_blank')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Abstract
                        </button>
                        <button
                          onClick={() => window.open('#', '_blank')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Paper
                        </button>
                        
                        {/* Generate PowerPoint Button */}
                        <button
                          onClick={() => {
                            // Add PowerPoint generation functionality here
                            console.log('Generate PowerPoint for publication:', pub.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Presentation className="w-4 h-4 mr-2" />
                          Export PowerPoint
                        </button>
                        
                        {/* Delete Button for Manual Uploads */}
                        {!pub.isAI && (
                          <>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => {
                                setSelectedPublication(null);
                                // Add delete functionality here
                                console.log('Delete publication:', pub.id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Publication
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
                ))}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            // Show current page, first page, last page, and pages around current
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-[#00239C] text-white shadow-md'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-[#00A3E0]'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            } else if (
              pageNumber === currentPage - 2 ||
              pageNumber === currentPage + 2
            ) {
              return <span key={pageNumber} className="px-2 text-gray-500">...</span>;
            }
            return null;
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Empty State */}
      {searchedPublications.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No publications found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
          <Button className="bg-[#00A3E0] hover:bg-[#00A3E0]/90 text-white">
            <FileText className="w-4 h-4 mr-2" />
            Track Your First Publication
          </Button>
          </div>
        )}
        </div>
      </main>

      {/* Quick Summary Modal */}
      {quickSummaryModalOpen && selectedPublication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Quick Summary</h2>
                <button
                  onClick={() => setQuickSummaryModalOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#00239C] mb-3">
                  "{selectedPublication.title}"
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Journal:</strong> {selectedPublication.journal} • <strong>Published:</strong> {selectedPublication.published}</p>
                  <p><strong>Authors:</strong> {selectedPublication.authors}</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Key Findings */}
                <div>
                  <h4 className="font-semibold text-[#00239C] text-sm mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-[#00A3E0]" />
                    Key Findings
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedPublication.keyFindings}</p>
                </div>

                {/* Clinical Outcomes */}
                <div>
                  <h4 className="font-semibold text-[#00239C] text-sm mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-[#00A3E0]" />
                    Clinical Outcomes
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedPublication.clinicalOutcomes}</p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-green-700 text-sm mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {selectedPublication.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Research Gaps */}
                <div>
                  <h4 className="font-semibold text-[#E76900] text-sm mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-[#E76900]" />
                    Research Gaps & Limitations
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {selectedPublication.gaps.map((gap: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#E76900] mr-2">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Publication Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Add Publication</h2>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Add a publication by uploading a document or pasting text content. Our AI will analyze the content and provide insights.
                </p>
                
                {/* File Upload Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Upload Document</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00A3E0] transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, or DOCX (max 10MB)
                      </p>
                    </label>
                  </div>
                </div>
                
                {/* Text Input Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Or Paste Text Content</h3>
                  <textarea
                    placeholder="Paste publication text, abstract, or content here..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadSubmit}
                  className="bg-[#00239C] hover:bg-[#00239C]/90 text-white"
                >
                  Add & Analyze
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationReviewAnalysis;
