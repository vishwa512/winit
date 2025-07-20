import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

type QuestionType = 'text' | 'numeric' | 'single_choice' | 'multiple_choice' | 'dropdown' | 'date' | 'file_upload' | 'barcode';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  validation_rules: any;
  is_mandatory: boolean;
  weight?: number;
}

interface QuestionBuilderProps {
  template: any;
  onUpdate: (template: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  template,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionData, setQuestionData] = useState<Partial<Question>>({
    text: '',
    type: 'text',
    options: [],
    validation_rules: {},
    is_mandatory: false,
    weight: 10,
  });

  const sections = template.sections || [];
  const questionTypes: { value: QuestionType; label: string; description: string }[] = [
    { value: 'text', label: 'Text Input', description: 'Single line text response' },
    { value: 'numeric', label: 'Numeric Input', description: 'Number input with validation' },
    { value: 'single_choice', label: 'Single Choice', description: 'Radio buttons (select one)' },
    { value: 'multiple_choice', label: 'Multiple Choice', description: 'Checkboxes (select multiple)' },
    { value: 'dropdown', label: 'Dropdown', description: 'Select from dropdown list' },
    { value: 'date', label: 'Date/Time', description: 'Date and time picker' },
    { value: 'file_upload', label: 'File Upload', description: 'Upload photos or documents' },
    { value: 'barcode', label: 'Barcode Scanner', description: 'Scan product barcodes' },
  ];

  const handleAddQuestion = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setEditingQuestion(null);
    setQuestionData({
      text: '',
      type: 'text',
      options: [],
      validation_rules: {},
      is_mandatory: false,
      weight: 10,
    });
    setShowModal(true);
  };

  const handleEditQuestion = (sectionId: string, question: Question) => {
    setSelectedSectionId(sectionId);
    setEditingQuestion(question);
    setQuestionData(question);
    setShowModal(true);
  };

  const handleSaveQuestion = () => {
    if (!questionData.text?.trim() || !selectedSectionId) return;

    const newQuestion: Question = {
      id: editingQuestion?.id || uuidv4(),
      text: questionData.text,
      type: questionData.type || 'text',
      options: questionData.options || [],
      validation_rules: questionData.validation_rules || {},
      is_mandatory: questionData.is_mandatory || false,
      weight: questionData.weight || 10,
    };

    const updatedSections = sections.map((section: any) => {
      if (section.id === selectedSectionId) {
        let updatedQuestions: Question[];
        if (editingQuestion) {
          updatedQuestions = section.questions.map((q: Question) => 
            q.id === editingQuestion.id ? newQuestion : q
          );
        } else {
          updatedQuestions = [...section.questions, newQuestion];
        }
        return { ...section, questions: updatedQuestions };
      }
      return section;
    });

    onUpdate({ ...template, sections: updatedSections });
    setShowModal(false);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedSections = sections.map((section: any) => {
        if (section.id === sectionId) {
          return {
            ...section,
            questions: section.questions.filter((q: Question) => q.id !== questionId),
          };
        }
        return section;
      });
      onUpdate({ ...template, sections: updatedSections });
    }
  };

  const addOption = () => {
    const options = questionData.options || [];
    setQuestionData({
      ...questionData,
      options: [...options, ''],
    });
  };

  const updateOption = (index: number, value: string) => {
    const options = questionData.options || [];
    const newOptions = [...options];
    newOptions[index] = value;
    setQuestionData({
      ...questionData,
      options: newOptions,
    });
  };

  const removeOption = (index: number) => {
    const options = questionData.options || [];
    setQuestionData({
      ...questionData,
      options: options.filter((_, i) => i !== index),
    });
  };

  const totalQuestions = sections.reduce((total: number, section: any) => total + section.questions.length, 0);

  const renderQuestionPreview = () => {
    if (!questionData.text) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
        <div className="space-y-2">
          <p className="font-medium text-sm">
            {questionData.text}
            {questionData.is_mandatory && <span className="text-red-500 ml-1">*</span>}
          </p>
          
          {questionData.type === 'text' && (
            <input
              type="text"
              placeholder="Text input field"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled
            />
          )}
          
          {questionData.type === 'numeric' && (
            <input
              type="number"
              placeholder="Numeric input field"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              disabled
            />
          )}
          
          {(questionData.type === 'single_choice' || questionData.type === 'multiple_choice') && (
            <div className="space-y-2">
              {(questionData.options || []).map((option, index) => (
                <label key={index} className="flex items-center text-sm">
                  <input
                    type={questionData.type === 'single_choice' ? 'radio' : 'checkbox'}
                    className="mr-2"
                    disabled
                  />
                  <span>{option || `Option ${index + 1}`}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Questions</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Build your audit questions for each section
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
          {sections.map((section: any) => (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{section.title}</h3>
                    {section.description && (
                      <p className="text-gray-600 mt-1 text-sm line-clamp-2">{section.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddQuestion(section.id)}
                    className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add Question</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {section.questions.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-sm">No questions added yet</p>
                    <button
                      onClick={() => handleAddQuestion(section.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add your first question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {section.questions.map((question: Question, qIndex: number) => (
                      <div
                        key={question.id}
                        className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-gray-500">
                                Q{qIndex + 1}
                              </span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {questionTypes.find(t => t.value === question.type)?.label}
                              </span>
                              {question.is_mandatory && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">{question.text}</p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2 text-xs sm:text-sm text-gray-600">
                                <span className="font-medium">Options:</span> {question.options.slice(0, 3).join(', ')}
                                {question.options.length > 3 && ` +${question.options.length - 3} more`}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                            <button
                              onClick={() => handleEditQuestion(section.id, question)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(section.id, question.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-200 gap-4">
          <button
            onClick={onPrevious}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          <div className="text-xs sm:text-sm text-gray-500 text-center">
            Step 3 of 4 • {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} added
          </div>
          <button
            onClick={onNext}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        rows={3}
                        value={questionData.text || ''}
                        onChange={(e) => setQuestionData({ ...questionData, text: e.target.value })}
                        placeholder="Enter your question"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type *
                      </label>
                      <select
                        value={questionData.type || 'text'}
                        onChange={(e) => setQuestionData({ 
                          ...questionData, 
                          type: e.target.value as QuestionType,
                          options: ['single_choice', 'multiple_choice', 'dropdown'].includes(e.target.value) 
                            ? [''] : []
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {questionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {questionTypes.find(t => t.value === questionData.type)?.description}
                      </p>
                    </div>

                    {['single_choice', 'multiple_choice', 'dropdown'].includes(questionData.type || '') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {(questionData.options || []).map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <button
                                onClick={() => removeOption(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={addOption}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add Option
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={questionData.is_mandatory || false}
                          onChange={(e) => setQuestionData({ 
                            ...questionData, 
                            is_mandatory: e.target.checked 
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Required question</span>
                      </label>

                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Weight:</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={questionData.weight || 10}
                          onChange={(e) => setQuestionData({ 
                            ...questionData, 
                            weight: parseInt(e.target.value) || 10
                          })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                    {renderQuestionPreview()}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={!questionData.text?.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingQuestion ? 'Update' : 'Add'} Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder;