import React, { useState } from 'react';
import { useAudit } from '../contexts/AuditContext';
import { Link, useParams } from 'react-router-dom';
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
} from 'lucide-react';

const AuditExecution: React.FC = () => {
  const { id } = useParams();
  const { state } = useAudit();
  const { audits, templates } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // If ID is provided, show specific audit execution
  if (id) {
    const audit = audits.find(a => a.id === id);
    if (!audit) {
      return <div>Audit not found</div>;
    }

    const template = templates.find(t => t.id === audit.templateId);
    if (!template) {
      return <div>Template not found</div>;
    }

    return <AuditExecutionView audit={audit} template={template} />;
  }

  // Show audit list
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.location.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Execution</h1>
          <p className="text-gray-600 mt-1">Execute and manage your retail audits</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search audits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAudits.map((audit) => (
          <div
            key={audit.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
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

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {audit.templateName}
              </h3>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{audit.location.storeName}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>{audit.assignedToName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{audit.createdAt.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {audit.status === 'completed' ? (
                  <Link
                    to={`/audits/${audit.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <FileText className="w-4 h-4 mr-1" />
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
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
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
  audit: any;
  template: any;
}

const AuditExecutionView: React.FC<AuditExecutionViewProps> = ({ audit, template }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState(audit.responses || {});

  const currentSection = template.sections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / template.sections.length) * 100;

  const handleResponse = (questionId: string, value: any) => {
    const sectionId = currentSection.id;
    setResponses(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [questionId]: value,
      },
    }));
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

  const renderQuestion = (question: any) => {
    const sectionId = currentSection.id;
    const currentValue = responses[sectionId]?.[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your response..."
          />
        );

      case 'numeric':
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleResponse(question.id, parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <span className="text-gray-900">{option}</span>
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
                  <span className="text-gray-900">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="space-y-2">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-gray-600">{audit.location.storeName}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{currentSection.title}</h2>
            <span className="text-sm text-gray-500">
              Section {currentSectionIndex + 1} of {template.sections.length}
            </span>
          </div>
          {currentSection.description && (
            <p className="text-gray-600">{currentSection.description}</p>
          )}
        </div>

        <div className="space-y-8">
          {currentSection.questions.map((question: any, qIndex: number) => (
            <div key={question.id} className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {qIndex + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {question.text}
                    {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {renderQuestion(question)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-500">
            {currentSectionIndex + 1} of {template.sections.length} sections
          </span>
          
          {currentSectionIndex === template.sections.length - 1 ? (
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
              Submit Audit
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Next Section
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditExecution;