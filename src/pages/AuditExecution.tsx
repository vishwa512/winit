import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import {
  Play,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  FileText,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  Upload,
  Camera,
  BarChart3,
} from 'lucide-react';
import type { Audit, Template, Question } from '../types';

const AuditExecution: React.FC = () => {
  const { id } = useParams();
  const { getAudits, getTemplates, getAudit, getTemplate, updateAudit, createAudit } = useSupabase();
  const [audits, setAudits] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [auditsData, templatesData] = await Promise.all([
      getAudits(),
      getTemplates(),
    ]);
    setAudits(auditsData);
    setTemplates(templatesData);
    setLoading(false);
  };

  // If ID is provided, show specific audit execution
  if (id) {
    return <AuditExecutionView auditId={id} />;
  }

  // Show audit list
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (audit.location?.store_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.assigned_to_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Execution</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Execute and manage your retail audits</p>
        </div>
        <Link
          to="/templates"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Templates
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Audits</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{audits.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Completed</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {audits.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">In Progress</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {audits.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Overdue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {audits.filter(a => a.status === 'overdue').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search audits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredAudits.length} audit{filteredAudits.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Audits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAudits.map((audit) => (
          <div
            key={audit.id}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(audit.status)}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      audit.status
                    )}`}
                  >
                    {audit.status.replace('_', ' ')}
                  </span>
                </div>
                {audit.score && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">{audit.score}%</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {audit.template_name}
              </h3>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{audit.location?.store_name || 'No location'}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{audit.assigned_to_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {audit.status === 'completed' ? (
                  <Link
                    to={`/audits/${audit.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    View Results
                  </Link>
                ) : (
                  <Link
                    to={`/audits/${audit.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    {audit.status === 'pending' ? 'Start Audit' : 'Continue'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAudits.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No audits found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No audits have been assigned yet'}
          </p>
        </div>
      )}
    </div>
  );
};

// Audit Execution View Component
interface AuditExecutionViewProps {
  auditId: string;
}

const AuditExecutionView: React.FC<AuditExecutionViewProps> = ({ auditId }) => {
  const { getAudit, getTemplate, updateAudit } = useSupabase();
  const [audit, setAudit] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, [auditId]);

  const loadAuditData = async () => {
    setLoading(true);
    const auditData = await getAudit(auditId);
    if (auditData) {
      setAudit(auditData);
      setResponses(auditData.responses || {});
      
      const templateData = await getTemplate(auditData.template_id);
      if (templateData) {
        setTemplate(templateData);
      }
    }
    setLoading(false);
  };

  const handleResponse = (questionId: string, value: any) => {
    const sectionId = template.sections[currentSectionIndex].id;
    setResponses(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [questionId]: value,
      },
    }));
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    await updateAudit(auditId, {
      status: 'in_progress',
      responses: responses,
    });
    setSaving(false);
  };

  const handleSubmitAudit = async () => {
    setSaving(true);
    // Calculate score based on responses
    const score = calculateScore(responses, template);
    
    await updateAudit(auditId, {
      status: 'completed',
      responses: responses,
      score: score,
      compliance_status: score >= (template.scoring_rules?.threshold || 80) ? 'compliant' : 'non_compliant',
      submitted_at: new Date().toISOString(),
    });
    setSaving(false);
    
    // Redirect to audit list
    window.location.href = '/audits';
  };

  const calculateScore = (responses: Record<string, any>, template: any): number => {
    if (!template.scoring_rules?.isEnabled) return 0;
    
    let totalScore = 0;
    let maxScore = 0;
    
    template.sections.forEach((section: any) => {
      section.questions.forEach((question: Question) => {
        const response = responses[section.id]?.[question.id];
        const weight = question.weight || 10;
        maxScore += weight;
        
        if (response !== undefined && response !== null && response !== '') {
          if (question.type === 'single_choice' || question.type === 'multiple_choice') {
            // For choice questions, give full points if answered
            totalScore += weight;
          } else if (question.type === 'numeric') {
            // For numeric questions, give points based on value
            totalScore += weight;
          } else {
            // For other types, give full points if answered
            totalScore += weight;
          }
        }
      });
    });
    
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  };

  const handleNext = () => {
    if (currentSectionIndex < template.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const renderQuestion = (question: Question) => {
    const sectionId = template.sections[currentSectionIndex].id;
    const currentValue = responses[sectionId]?.[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            placeholder="Enter your response..."
          />
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleResponse(question.id, parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            placeholder="Enter a number..."
          />
        );

      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentValue === option}
                  onChange={(e) => handleResponse(question.id, e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900 text-sm sm:text-base">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => {
              const isChecked = Array.isArray(currentValue) && currentValue.includes(option);
              return (
                <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentArray = Array.isArray(currentValue) ? currentValue : [];
                      if (e.target.checked) {
                        handleResponse(question.id, [...currentArray, option]);
                      } else {
                        handleResponse(question.id, currentArray.filter(v => v !== option));
                      }
                    }}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 text-sm sm:text-base">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center space-x-4">
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              <button
                onClick={() => handleResponse(question.id, 'file_uploaded.jpg')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Simulate Upload
              </button>
            </div>
          </div>
        );

      case 'date':
        return (
          <input
            type="datetime-local"
            value={currentValue}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        );

      case 'barcode':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl">📱</div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Tap to scan barcode</span>
              </div>
              <button
                onClick={() => handleResponse(question.id, '1234567890123')}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Simulate Scan
              </button>
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!audit || !template) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Audit not found</h3>
        <Link to="/audits" className="mt-4 text-blue-600 hover:text-blue-700">
          Back to audits
        </Link>
      </div>
    );
  }

  const currentSection = template.sections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / template.sections.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/audits"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">{audit.location?.store_name || 'No location'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Section */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{currentSection.title}</h2>
            <span className="text-sm text-gray-500">
              Section {currentSectionIndex + 1} of {template.sections.length}
            </span>
          </div>
          {currentSection.description && (
            <p className="text-gray-600 text-sm sm:text-base">{currentSection.description}</p>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8">
          {currentSection.questions.map((question: Question, qIndex: number) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {qIndex + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                    {question.text}
                    {question.is_mandatory && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {renderQuestion(question)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 sm:mt-8 pt-6 border-t border-gray-200 gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveProgress}
              disabled={saving}
              className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors duration-200 text-sm sm:text-base"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Progress
            </button>
            
            {currentSectionIndex === template.sections.length - 1 ? (
              <button
                onClick={handleSubmitAudit}
                disabled={saving}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 text-sm sm:text-base"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Audit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Next Section
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditExecution;