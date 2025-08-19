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
  ArrowUpDown,
  Target
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import AppLayout from '../layout/AppLayout';

const PublicationReviewAnalysis: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedFilter, setSelectedFilter] = useState('all');

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
      authors: "Chen, S., Tanaka, K., Vogel, L., et al.",
      date: "2024-01-15",
      journal: "Nature Medicine",
      impact: "High",
      priority: "High",
      isAIGenerated: true,
      tags: ["Lung Cancer", "Biomarkers", "Early Detection"],
      summary: "This study identifies novel biomarker combinations that significantly improve early-stage lung cancer detection sensitivity and specificity.",
      keyFindings: [
        "Combination of 5 biomarkers achieved 94% sensitivity",
        "Reduced false positive rate by 60%",
        "Validated across multiple ethnic populations"
      ],
      outcomes: [
        "Potential for routine screening implementation",
        "Cost-effective diagnostic approach",
        "Improved patient survival rates"
      ],
      positives: [
        "High statistical significance (p < 0.001)",
        "Large sample size (n = 2,500)",
        "Multi-center validation study"
      ],
      gaps: [
        "Limited long-term follow-up data",
        "Cost analysis not included",
        "Regulatory approval pathway unclear"
      ]
    },
    {
      id: 2,
      title: "Immunotherapy Response Prediction in Triple-Negative Breast Cancer",
      authors: "Vogel, L., Chen, S., Rodriguez, M., et al.",
      date: "2024-01-10",
      journal: "Cell",
      impact: "Very High",
      priority: "High",
      isAIGenerated: false,
      tags: ["Breast Cancer", "Immunotherapy", "Biomarkers"],
      summary: "AI-driven analysis of tumor microenvironment reveals predictive markers for immunotherapy response in triple-negative breast cancer patients.",
      keyFindings: [
        "TIL density predicts response with 87% accuracy",
        "PD-L1 expression alone insufficient",
        "Novel immune signature identified"
      ],
      outcomes: [
        "Personalized treatment selection",
        "Reduced unnecessary treatment",
        "Improved patient outcomes"
      ],
      positives: [
        "Cutting-edge AI methodology",
        "Clinical validation cohort",
        "Clear therapeutic implications"
      ],
      gaps: [
        "Mechanism not fully understood",
        "Long-term survival data pending",
        "Cost-effectiveness analysis needed"
      ]
    }
  ];

  // Filter and search logic
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pub.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'high-priority' && pub.priority === 'High') ||
                         (selectedFilter === 'recent' && pub.date >= '2024-01-08') ||
                         pub.tags.some(tag => tag.toLowerCase().includes(selectedFilter.toLowerCase()));
    
    return matchesSearch && matchesFilter;
  });

  // Sorting logic
  const sortedPublications = [...filteredPublications].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'impact':
        const impactOrder = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return impactOrder[b.impact as keyof typeof impactOrder] - impactOrder[a.impact as keyof typeof impactOrder];
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedPublications.length / publicationsPerPage);
  const startIndex = (currentPage - 1) * publicationsPerPage;
  const endIndex = startIndex + publicationsPerPage;
  const currentPublications = sortedPublications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#00239C]">AI Generated Publication</h1>
            <p className="text-gray-600 mt-2">Review and analyze publications with AI-powered insights</p>
          </div>
          
          <button
            onClick={() => setUploadModalOpen(true)}
            className="bg-[#00239C] hover:bg-[#001E62] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Add Publication
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search publications, authors, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="title">Title A-Z</option>
              <option value="impact">Impact Factor</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-[#00239C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Publications List */}
        <div className="space-y-4">
          {currentPublications.map((publication) => (
            <div key={publication.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{publication.title}</h3>
                    {publication.isAIGenerated ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Bot className="w-3 h-3 mr-1" />
                        AI Generated
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Upload className="w-3 h-3 mr-1" />
                        Manual Upload
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {publication.authors}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(publication.date).toLocaleDateString()}
                    </span>
                    <span className="text-[#00239C] font-medium">{publication.journal}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{publication.summary}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {publication.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleQuickSummary(publication)}
                    className="p-2 text-gray-600 hover:text-[#00239C] hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setSelectedPublication(selectedPublication?.id === publication.id ? null : publication)}
                      className="p-2 text-gray-600 hover:text-[#00239C] hover:bg-blue-50 rounded-lg transition-colors"
                      title="More Options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {selectedPublication?.id === publication.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => handleQuickSummary(publication)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Abstract
                          </button>
                          <button
                            onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/search/?term=${encodeURIComponent(publication.title)}`, '_blank')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <FileTextIcon className="w-4 h-4 mr-2" />
                            View Paper
                          </button>
                          <button
                            onClick={() => handleQuickSummary(publication)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Quick Summary
                          </button>
                          <button
                            onClick={() => console.log('Export PowerPoint for:', publication.title)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Presentation className="w-4 h-4 mr-2" />
                            Export PowerPoint
                          </button>
                          {!publication.isAIGenerated && (
                            <button
                              onClick={() => console.log('Delete publication:', publication.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </button>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
                  currentPage === page
                    ? 'bg-[#00239C] text-white border-[#00239C]'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Quick Summary Modal */}
      {quickSummaryModalOpen && selectedPublication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#00239C] to-[#00A3E0] px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Publication Analysis</h2>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedPublication.title}</h3>
                <p className="text-gray-600 mb-4">{selectedPublication.authors} • {selectedPublication.journal} • {new Date(selectedPublication.date).toLocaleDateString()}</p>
                <p className="text-gray-700">{selectedPublication.summary}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[#00A3E0] text-sm mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-[#00A3E0]" />
                    Key Findings
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {selectedPublication.keyFindings.map((finding: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#00A3E0] mr-2">•</span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#00A3E0] text-sm mb-2 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-[#00A3E0]" />
                    Outcomes & Impact
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {selectedPublication.outcomes.map((outcome: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#00A3E0] mr-2">•</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#00A3E0] text-sm mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-[#00A3E0]" />
                    Strengths & Positives
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {selectedPublication.positives.map((positive: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-[#00A3E0] mr-2">•</span>
                        {positive}
                      </li>
                    ))}
                  </ul>
                </div>
                
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
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md font-medium transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  className="px-4 py-2 bg-[#00239C] hover:bg-[#00239C]/90 text-white rounded-md font-medium transition-colors"
                >
                  Add & Analyze
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default PublicationReviewAnalysis;
