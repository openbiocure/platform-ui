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
  Target,
  ChevronDown,
  Clipboard
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
  const [publicationsPerPage] = useState(6);
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
    },
    {
      id: 3,
      title: "CRISPR-Cas9 Gene Editing in Hereditary Cardiac Arrhythmias",
      authors: "Rodriguez, M., Kim, J., Patel, S., et al.",
      date: "2024-01-05",
      journal: "Science",
      impact: "Very High",
      priority: "High",
      isAIGenerated: true,
      tags: ["Gene Editing", "CRISPR", "Cardiac Arrhythmias"],
      summary: "Successful application of CRISPR-Cas9 to correct pathogenic mutations causing inherited cardiac arrhythmias in patient-derived cardiomyocytes.",
      keyFindings: [
        "95% editing efficiency achieved",
        "Restored normal cardiac rhythm",
        "No off-target effects detected"
      ],
      outcomes: [
        "Potential cure for genetic heart disease",
        "Reduced need for device implantation",
        "Improved quality of life"
      ],
      positives: [
        "Breakthrough therapeutic approach",
        "Rigorous safety validation",
        "Clear clinical pathway"
      ],
      gaps: [
        "In vivo studies pending",
        "Delivery method optimization needed",
        "Regulatory framework unclear"
      ]
    },
    {
      id: 4,
      title: "AI-Driven Drug Discovery for Alzheimer's Disease",
      authors: "Thompson, R., Liu, W., Garcia, A., et al.",
      date: "2024-01-03",
      journal: "Nature Biotechnology",
      impact: "High",
      priority: "Medium",
      isAIGenerated: false,
      tags: ["Alzheimer's", "Drug Discovery", "AI"],
      summary: "Machine learning algorithms identify novel therapeutic targets and compounds for Alzheimer's disease treatment.",
      keyFindings: [
        "5 novel targets identified",
        "Lead compound shows 70% efficacy",
        "Reduced computational time by 80%"
      ],
      outcomes: [
        "Accelerated drug development",
        "Lower development costs",
        "New treatment options"
      ],
      positives: [
        "Innovative AI methodology",
        "Strong preclinical data",
        "Industry collaboration"
      ],
      gaps: [
        "Clinical trials not started",
        "Manufacturing scalability unknown",
        "Biomarker validation needed"
      ]
    },
    {
      id: 5,
      title: "Microbiome Analysis in Inflammatory Bowel Disease",
      authors: "Park, H., Anderson, K., Brown, T., et al.",
      date: "2023-12-28",
      journal: "Gastroenterology",
      impact: "Medium",
      priority: "Low",
      isAIGenerated: true,
      tags: ["Microbiome", "IBD", "Inflammation"],
      summary: "Comprehensive analysis reveals specific microbial signatures associated with disease severity and treatment response in IBD patients.",
      keyFindings: [
        "15 key bacterial strains identified",
        "Microbiome diversity correlates with severity",
        "Predictive model for treatment response"
      ],
      outcomes: [
        "Personalized treatment strategies",
        "Early intervention protocols",
        "Improved patient outcomes"
      ],
      positives: [
        "Large patient cohort (n=1,200)",
        "Multi-center validation",
        "Clinical relevance demonstrated"
      ],
      gaps: [
        "Mechanistic understanding limited",
        "Therapeutic applications unclear",
        "Longitudinal data needed"
      ]
    },
    {
      id: 6,
      title: "Nanotechnology-Based Cancer Immunotherapy",
      authors: "Zhang, L., Williams, D., Kumar, P., et al.",
      date: "2023-12-25",
      journal: "Cancer Cell",
      impact: "High",
      priority: "High",
      isAIGenerated: false,
      tags: ["Nanotechnology", "Immunotherapy", "Cancer"],
      summary: "Novel nanoparticle delivery system enhances immune checkpoint inhibitor efficacy while reducing systemic toxicity.",
      keyFindings: [
        "3-fold increase in tumor penetration",
        "50% reduction in side effects",
        "Enhanced T-cell activation"
      ],
      outcomes: [
        "Improved therapeutic index",
        "Better patient tolerance",
        "Expanded treatment eligibility"
      ],
      positives: [
        "Innovative delivery platform",
        "Strong safety profile",
        "Translational potential"
      ],
      gaps: [
        "Manufacturing complexity",
        "Regulatory pathway uncertain",
        "Cost-effectiveness analysis missing"
      ]
    },
    {
      id: 7,
      title: "Regenerative Medicine for Spinal Cord Injury",
      authors: "Johnson, M., Lee, S., Patel, R., et al.",
      date: "2023-12-20",
      journal: "Cell Stem Cell",
      impact: "Very High",
      priority: "High",
      isAIGenerated: true,
      tags: ["Regenerative Medicine", "Spinal Cord", "Stem Cells"],
      summary: "Induced pluripotent stem cell-derived neural progenitors restore motor function in chronic spinal cord injury models.",
      keyFindings: [
        "Significant motor recovery observed",
        "Neural circuit reconstruction",
        "No tumor formation detected"
      ],
      outcomes: [
        "Potential treatment for paralysis",
        "Restored quality of life",
        "Reduced healthcare burden"
      ],
      positives: [
        "Breakthrough therapeutic approach",
        "Comprehensive safety studies",
        "Strong preclinical efficacy"
      ],
      gaps: [
        "Human trials not initiated",
        "Optimal timing unclear",
        "Patient selection criteria needed"
      ]
    },
    {
      id: 8,
      title: "Precision Medicine in Pediatric Oncology",
      authors: "Davis, J., Chen, Y., Martinez, L., et al.",
      date: "2023-12-15",
      journal: "Pediatrics",
      impact: "Medium",
      priority: "Medium",
      isAIGenerated: false,
      tags: ["Pediatric Oncology", "Precision Medicine", "Genomics"],
      summary: "Genomic profiling guides targeted therapy selection in pediatric cancer patients, improving outcomes while minimizing toxicity.",
      keyFindings: [
        "80% of patients had actionable mutations",
        "Response rate increased to 65%",
        "Reduced treatment-related morbidity"
      ],
      outcomes: [
        "Improved survival rates",
        "Reduced late effects",
        "Better quality of life"
      ],
      positives: [
        "Patient-centered approach",
        "Strong clinical evidence",
        "Multidisciplinary collaboration"
      ],
      gaps: [
        "Access to testing limited",
        "Cost considerations",
        "Long-term follow-up needed"
      ]
    },
    {
      id: 9,
      title: "Digital Therapeutics for Mental Health",
      authors: "Wilson, A., Taylor, K., Roberts, S., et al.",
      date: "2023-12-10",
      journal: "Digital Medicine",
      impact: "Medium",
      priority: "Low",
      isAIGenerated: true,
      tags: ["Digital Health", "Mental Health", "Therapeutics"],
      summary: "AI-powered digital therapeutic platform demonstrates efficacy in treating depression and anxiety disorders.",
      keyFindings: [
        "40% reduction in depression scores",
        "High patient engagement (85%)",
        "Cost-effective intervention"
      ],
      outcomes: [
        "Accessible mental health care",
        "Scalable treatment solution",
        "Reduced healthcare costs"
      ],
      positives: [
        "Large-scale validation study",
        "User-friendly interface",
        "Evidence-based approach"
      ],
      gaps: [
        "Long-term efficacy unknown",
        "Digital divide considerations",
        "Privacy concerns"
      ]
    },
    {
      id: 10,
      title: "Bioengineered Organs for Transplantation",
      authors: "Clark, P., Singh, R., O'Connor, M., et al.",
      date: "2023-12-05",
      journal: "Nature Medicine",
      impact: "Very High",
      priority: "High",
      isAIGenerated: false,
      tags: ["Bioengineering", "Organ Transplant", "Tissue Engineering"],
      summary: "3D bioprinted kidneys using patient-derived cells show promising results in preclinical transplantation models.",
      keyFindings: [
        "Functional kidney tissue generated",
        "No immune rejection observed",
        "Vascularization successfully achieved"
      ],
      outcomes: [
        "Solution to organ shortage",
        "Reduced rejection risk",
        "Personalized organ therapy"
      ],
      positives: [
        "Revolutionary technology",
        "Strong proof of concept",
        "Clinical translation potential"
      ],
      gaps: [
        "Scale-up challenges",
        "Regulatory approval complex",
        "Manufacturing costs high"
      ]
    },
    {
      id: 11,
      title: "Epigenetic Therapy in Cancer Treatment",
      authors: "Miller, E., Wang, F., Jackson, D., et al.",
      date: "2023-11-30",
      journal: "Cancer Research",
      impact: "High",
      priority: "Medium",
      isAIGenerated: true,
      tags: ["Epigenetics", "Cancer Therapy", "DNA Methylation"],
      summary: "Novel epigenetic modulators reverse tumor suppressor silencing and enhance chemotherapy sensitivity in resistant cancers.",
      keyFindings: [
        "Tumor suppressor reactivation",
        "Chemosensitivity restored",
        "Minimal off-target effects"
      ],
      outcomes: [
        "Overcomes drug resistance",
        "Enhanced treatment efficacy",
        "New therapeutic combinations"
      ],
      positives: [
        "Mechanistic insights provided",
        "Broad cancer applicability",
        "Clinical trial ready"
      ],
      gaps: [
        "Optimal dosing unclear",
        "Biomarker identification needed",
        "Combination studies required"
      ]
    },
    {
      id: 12,
      title: "Gene Therapy for Inherited Blindness",
      authors: "Turner, B., Nguyen, H., Anderson, C., et al.",
      date: "2023-11-25",
      journal: "Ophthalmology",
      impact: "High",
      priority: "High",
      isAIGenerated: false,
      tags: ["Gene Therapy", "Inherited Blindness", "Retinal Disease"],
      summary: "Adeno-associated virus-mediated gene delivery restores vision in patients with Leber congenital amaurosis.",
      keyFindings: [
        "Vision improvement in 90% of patients",
        "Long-term safety demonstrated",
        "Functional vision restored"
      ],
      outcomes: [
        "Treatment for incurable blindness",
        "Improved patient independence",
        "Quality of life enhancement"
      ],
      positives: [
        "Proven clinical efficacy",
        "Excellent safety profile",
        "Durable treatment effects"
      ],
      gaps: [
        "Limited to specific mutations",
        "High treatment costs",
        "Access barriers exist"
      ]
    },
    {
      id: 13,
      title: "Liquid Biopsy for Early Cancer Detection",
      authors: "Adams, R., Phillips, J., Kumar, S., et al.",
      date: "2023-11-20",
      journal: "Clinical Chemistry",
      impact: "Medium",
      priority: "Medium",
      isAIGenerated: true,
      tags: ["Liquid Biopsy", "Early Detection", "Circulating DNA"],
      summary: "Multi-analyte blood test detects multiple cancer types at early stages with high sensitivity and specificity.",
      keyFindings: [
        "85% sensitivity for stage I cancers",
        "95% specificity achieved",
        "12 cancer types detected"
      ],
      outcomes: [
        "Earlier cancer diagnosis",
        "Improved survival rates",
        "Population screening feasible"
      ],
      positives: [
        "Non-invasive screening method",
        "High analytical performance",
        "Clinical validation completed"
      ],
      gaps: [
        "Cost-effectiveness analysis needed",
        "Healthcare integration challenges",
        "False positive management"
      ]
    },
    {
      id: 14,
      title: "Robotic Surgery in Minimally Invasive Procedures",
      authors: "Cooper, L., Evans, M., Thompson, G., et al.",
      date: "2023-11-15",
      journal: "Surgical Robotics",
      impact: "Medium",
      priority: "Low",
      isAIGenerated: false,
      tags: ["Robotic Surgery", "Minimally Invasive", "Surgical Innovation"],
      summary: "Next-generation surgical robots with AI assistance improve precision and outcomes in complex procedures.",
      keyFindings: [
        "30% reduction in operative time",
        "Decreased complication rates",
        "Enhanced surgeon ergonomics"
      ],
      outcomes: [
        "Better surgical outcomes",
        "Reduced patient recovery time",
        "Improved surgeon performance"
      ],
      positives: [
        "Technological advancement",
        "Clinical benefits demonstrated",
        "Surgeon acceptance high"
      ],
      gaps: [
        "High capital investment",
        "Training requirements extensive",
        "Cost-benefit analysis incomplete"
      ]
    },
    {
      id: 15,
      title: "Pharmacogenomics in Drug Development",
      authors: "Green, K., Smith, N., Rodriguez, P., et al.",
      date: "2023-11-10",
      journal: "Pharmacogenomics",
      impact: "Medium",
      priority: "Medium",
      isAIGenerated: true,
      tags: ["Pharmacogenomics", "Drug Development", "Personalized Medicine"],
      summary: "Genetic variants guide drug dosing and selection, reducing adverse events and improving therapeutic efficacy.",
      keyFindings: [
        "50% reduction in adverse events",
        "Optimal dosing achieved faster",
        "Drug response prediction improved"
      ],
      outcomes: [
        "Safer drug therapy",
        "Reduced healthcare costs",
        "Personalized treatment plans"
      ],
      positives: [
        "Evidence-based approach",
        "Clinical implementation ready",
        "Healthcare system benefits"
      ],
      gaps: [
        "Genetic testing accessibility",
        "Clinical decision support tools",
        "Healthcare provider education"
      ]
    },
    {
      id: 16,
      title: "Wearable Devices for Chronic Disease Management",
      authors: "Hall, T., Carter, V., Brooks, I., et al.",
      date: "2023-11-05",
      journal: "Digital Health",
      impact: "Low",
      priority: "Low",
      isAIGenerated: false,
      tags: ["Wearable Technology", "Chronic Disease", "Remote Monitoring"],
      summary: "Smart wearable devices enable continuous monitoring and management of chronic conditions like diabetes and hypertension.",
      keyFindings: [
        "Improved medication adherence",
        "Early warning system effective",
        "Patient satisfaction high"
      ],
      outcomes: [
        "Better disease control",
        "Reduced hospitalizations",
        "Enhanced patient engagement"
      ],
      positives: [
        "User-friendly technology",
        "Real-world evidence strong",
        "Scalable solution"
      ],
      gaps: [
        "Data privacy concerns",
        "Device reliability issues",
        "Integration with healthcare systems"
      ]
    },
    {
      id: 17,
      title: "Stem Cell Therapy for Heart Failure",
      authors: "White, J., Brown, Q., Davis, X., et al.",
      date: "2023-10-30",
      journal: "Circulation",
      impact: "High",
      priority: "High",
      isAIGenerated: true,
      tags: ["Stem Cell Therapy", "Heart Failure", "Regenerative Medicine"],
      summary: "Mesenchymal stem cell injection improves cardiac function and reduces mortality in heart failure patients.",
      keyFindings: [
        "Ejection fraction improved by 15%",
        "Reduced hospitalization rates",
        "Improved exercise tolerance"
      ],
      outcomes: [
        "Better quality of life",
        "Reduced mortality risk",
        "Alternative to transplant"
      ],
      positives: [
        "Promising clinical results",
        "Minimally invasive procedure",
        "Good safety profile"
      ],
      gaps: [
        "Optimal cell type unclear",
        "Delivery method optimization",
        "Long-term efficacy studies needed"
      ]
    },
    {
      id: 18,
      title: "Artificial Intelligence in Medical Imaging",
      authors: "Lee, C., Garcia, Z., Wilson, U., et al.",
      date: "2023-10-25",
      journal: "Radiology",
      impact: "Medium",
      priority: "Medium",
      isAIGenerated: false,
      tags: ["AI", "Medical Imaging", "Diagnostic Accuracy"],
      summary: "Deep learning algorithms achieve radiologist-level accuracy in detecting various pathologies across multiple imaging modalities.",
      keyFindings: [
        "98% diagnostic accuracy achieved",
        "Reading time reduced by 40%",
        "Rare disease detection improved"
      ],
      outcomes: [
        "Enhanced diagnostic capability",
        "Reduced diagnostic errors",
        "Improved workflow efficiency"
      ],
      positives: [
        "Robust validation studies",
        "Multiple imaging modalities",
        "Clinical implementation successful"
      ],
      gaps: [
        "Algorithm bias concerns",
        "Regulatory approval processes",
        "Integration challenges"
      ]
    },
    {
      id: 19,
      title: "Telemedicine in Rural Healthcare Delivery",
      authors: "Jones, F., Taylor, O., Martin, Y., et al.",
      date: "2023-10-20",
      journal: "Telemedicine Journal",
      impact: "Low",
      priority: "Low",
      isAIGenerated: true,
      tags: ["Telemedicine", "Rural Healthcare", "Access to Care"],
      summary: "Telemedicine platform improves healthcare access and outcomes in underserved rural communities.",
      keyFindings: [
        "75% increase in specialist consultations",
        "Reduced travel burden",
        "High patient satisfaction"
      ],
      outcomes: [
        "Improved healthcare access",
        "Reduced healthcare disparities",
        "Cost-effective care delivery"
      ],
      positives: [
        "Addresses healthcare gaps",
        "Scalable implementation",
        "Positive patient feedback"
      ],
      gaps: [
        "Technology infrastructure limitations",
        "Provider training needs",
        "Reimbursement challenges"
      ]
    },
    {
      id: 20,
      title: "Novel Antibiotics for Resistant Infections",
      authors: "Mitchell, S., Young, L., Clark, W., et al.",
      date: "2023-10-15",
      journal: "Nature Microbiology",
      impact: "Very High",
      priority: "High",
      isAIGenerated: false,
      tags: ["Antibiotics", "Drug Resistance", "Infectious Disease"],
      summary: "New class of antibiotics shows efficacy against multidrug-resistant bacterial infections with novel mechanism of action.",
      keyFindings: [
        "Effective against MRSA and VRE",
        "Novel mechanism of action",
        "Low resistance development"
      ],
      outcomes: [
        "Treatment for resistant infections",
        "Reduced mortality rates",
        "New therapeutic options"
      ],
      positives: [
        "Addresses critical medical need",
        "Strong preclinical data",
        "Fast-track designation received"
      ],
      gaps: [
        "Phase III trials ongoing",
        "Manufacturing scalability",
        "Resistance monitoring needed"
      ]
    }
  ];

  const filters = [
    { id: 'all', label: 'All Publications', count: publications.length },
    { id: 'high-priority', label: 'High Priority', count: publications.filter(p => p.priority === 'High').length },
    { id: 'recent', label: 'Recent (Last 7 days)', count: publications.filter(p => p.date >= '2024-01-08').length },
    { id: 'cancer-biomarkers', label: 'Cancer Biomarkers', count: publications.filter(p => p.tags.some(tag => tag.toLowerCase().includes('cancer') || tag.toLowerCase().includes('biomarker'))).length },
    { id: 'immunotherapy', label: 'Immunotherapy', count: publications.filter(p => p.tags.some(tag => tag.toLowerCase().includes('immunotherapy'))).length },
    { id: 'early-detection', label: 'Early Detection', count: publications.filter(p => p.tags.some(tag => tag.toLowerCase().includes('early detection'))).length }
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
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header */}

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

      {/* Right Sidebar */}
      <div className="w-80 space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setUploadModalOpen(true)}
              className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-[#00239C] hover:bg-[#00239C]/5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-[#00239C]/10 group-hover:bg-[#00239C]/20 flex items-center justify-center mb-2 transition-colors">
                <Upload className="w-5 h-5 text-[#00239C]" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#00239C] transition-colors">Upload Publication</span>
            </button>
            <button 
              onClick={() => {
                // Handle paste abstract functionality
                console.log('Paste Abstract clicked');
              }}
              className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-2 transition-colors">
                <Clipboard className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Paste Abstract</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Publications</span>
              <span className="text-lg font-semibold text-[#00239C]">{publications.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">AI Generated</span>
              <span className="text-lg font-semibold text-blue-600">{publications.filter(p => p.isAIGenerated).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Manual Upload</span>
              <span className="text-lg font-semibold text-green-600">{publications.filter(p => !p.isAIGenerated).length}</span>
            </div>
          </div>
        </div>
      </div>
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
