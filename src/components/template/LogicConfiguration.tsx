import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Settings, 
  Zap, 
  GitBranch,
  TestTube,
  AlertCircle
} from 'lucide-react';
import type { Template, LogicRule, Question } from '../../types';

interface LogicConfigurationProps {
  template: Template;
  onUpdate: (template: Template) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const LogicConfiguration: React.FC<LogicConfigurationProps> = ({
  template,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<LogicRule | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testResponses, setTestResponses] = useState<Record<string, any>>({});

  const sections = template.sections || [];
  const logicRules = template.logic_rules || [];
  
  // Get all questions from all sections
  const allQuestions: (Question & { sectionTitle: string; sectionId: string })[] = sections.flatMap(section => 
    section.questions.map(q => ({
      ...q,
      sectionTitle: section.title,
      sectionId: section.id,
    }))
  );

  const [ruleData, setRuleData] = useState<Partial<LogicRule>>({
    trigger_question_id: '',
    trigger_value: '',
    operator: 'equals',
    action: 'show',
    target_question_id: '',
    target_section_id: '',
    logic_operator: 'AND',
  });

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
  ];

  const actions = [
    { value: 'show', label: 'Show Question/Section' },
    { value: 'hide', label: 'Hide Question/Section' },
    { value: 'skip_to_section', label: 'Skip to Section' },
    { value: 'require', label: 'Make Required' },
    { value: 'make_optional', label: 'Make Optional' },
  ];

  const handleAddRule = () => {
    setEditingRule(null);
    setRuleData({
      trigger_question_id: '',
      trigger_value: '',
      operator: 'equals',
      action: 'show',
      target_question_id: '',
      target_section_id: '',
      logic_operator: 'AND',
    });
    setShowModal(true);
  };

  const handleEditRule = (rule: LogicRule) => {
    setEditingRule(rule);
    setRuleData(rule);
    setShowModal(true);
  };

  const handleSaveRule = () => {
    if (!ruleData.trigger_question_id || !ruleData.action) return;

    const newRule: LogicRule = {
      id: editingRule?.id || uuidv4(),
      trigger_question_id: ruleData.trigger_question_id!,
      trigger_value: ruleData.trigger_value,
      operator: ruleData.operator!,
      action: ruleData.action!,
      target_question_id: ruleData.target_question_id,
      target_section_id: ruleData.target_section_id,
      logic_operator: ruleData.logic_operator,
    };

    let updatedRules: LogicRule[];
    if (editingRule) {
      updatedRules = logicRules.map(r => r.id === editingRule.id ? newRule : r);
    } else {
      updatedRules = [...logicRules, newRule];
    }

    onUpdate({ ...template, logic_rules: updatedRules });
    setShowModal(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this logic rule?')) {
      const updatedRules = logicRules.filter(r => r.id !== ruleId);
      onUpdate({ ...template, logic_rules: updatedRules });
    }
  };

  const getTriggerQuestion = (questionId: string) => {
    return allQuestions.find(q => q.id === questionId);
  };

  const getTargetQuestion = (questionId: string) => {
    return allQuestions.find(q => q.id === questionId);
  };

  const getTargetSection = (sectionId: string) => {
    return sections.find(s => s.id === sectionId);
  };

  const testLogic = () => {
    setTestMode(true);
    // Initialize test responses
    const initialResponses: Record<string, any> = {};
    allQuestions.forEach(q => {
      if (q.type === 'single_choice' && q.options && q.options.length > 0) {
        initialResponses[q.id] = q.options[0];
      } else if (q.type === 'multiple_choice') {
        initialResponses[q.id] = [];
      } else if (q.type === 'numeric') {
        initialResponses[q.id] = 0;
      } else {
        initialResponses[q.id] = '';
      }
    });
    setTestResponses(initialResponses);
  };

  const evaluateLogic = (questionId: string): boolean => {
    const applicableRules = logicRules.filter(rule => 
      rule.target_question_id === questionId || rule.target_section_id === questionId
    );

    if (applicableRules.length === 0) return true;

    return applicableRules.some(rule => {
      const triggerValue = testResponses[rule.trigger_question_id];
      const expectedValue = rule.trigger_value;

      switch (rule.operator) {
        case 'equals':
          return triggerValue === expectedValue;
        case 'not_equals':
          return triggerValue !== expectedValue;
        case 'greater_than':
          return Number(triggerValue) > Number(expectedValue);
        case 'less_than':
          return Number(triggerValue) < Number(expectedValue);
        case 'contains':
          return String(triggerValue).includes(String(expectedValue));
        default:
          return true;
      }
    });
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Configure Logic</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Set up conditional logic to create dynamic audit flows
          </p>
        </div>

        {/* Logic Rules Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start space-x-3">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-blue-900">Smart Logic Engine</h3>
              <p className="text-blue-700 mt-1 text-sm sm:text-base">
                Configure conditional logic to show/hide questions based on previous responses, 
                creating personalized audit experiences.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAddRule}
                  className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Logic Rule
                </button>
                {logicRules.length > 0 && (
                  <button
                    onClick={testLogic}
                    className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Logic
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logic Rules List */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {logicRules.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <GitBranch className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No logic rules configured</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add conditional logic to create dynamic question flows
              </p>
              <div className="mt-4 sm:mt-6">
                <button
                  onClick={handleAddRule}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Rule
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Logic Rules ({logicRules.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {logicRules.map((rule, index) => {
                  const triggerQuestion = getTriggerQuestion(rule.trigger_question_id);
                  const targetQuestion = getTargetQuestion(rule.target_question_id || '');
                  const targetSection = getTargetSection(rule.target_section_id || '');

                  return (
                    <div key={rule.id} className="p-4 sm:p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs font-medium text-gray-500">Rule {index + 1}</span>
                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                              {rule.action.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 space-y-1">
                            <p>
                              <span className="font-medium">When:</span> "{triggerQuestion?.text}" 
                              <span className="mx-2 text-gray-500">{rule.operator.replace('_', ' ')}</span>
                              <span className="font-medium">"{rule.trigger_value}"</span>
                            </p>
                            <p>
                              <span className="font-medium">Then:</span> {rule.action.replace('_', ' ')} 
                              {targetQuestion && <span className="ml-1">"{targetQuestion.text}"</span>}
                              {targetSection && <span className="ml-1">section "{targetSection.title}"</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                          <button
                            onClick={() => handleEditRule(rule)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Test Mode */}
        {testMode && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-green-900">Logic Test Mode</h3>
              <button
                onClick={() => setTestMode(false)}
                className="text-green-700 hover:text-green-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-green-700 text-sm mb-4">
              Simulate responses to test your logic rules. Questions that would be hidden are marked with a warning icon.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allQuestions.slice(0, 6).map((question) => {
                const isVisible = evaluateLogic(question.id);
                return (
                  <div key={question.id} className={`p-3 rounded-lg border ${isVisible ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start space-x-2">
                      {!isVisible && <AlertCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{question.text}</p>
                        <p className="text-xs text-gray-500">{question.sectionTitle}</p>
                        {question.type === 'single_choice' && question.options && (
                          <select
                            value={testResponses[question.id] || ''}
                            onChange={(e) => setTestResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                            className="mt-2 text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {question.options.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-200 gap-4">
          <button
            onClick={onPrevious}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          <div className="text-xs sm:text-sm text-gray-500 text-center">
            Step 4 of 5 • {logicRules.length} logic rule{logicRules.length !== 1 ? 's' : ''} configured
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

      {/* Logic Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingRule ? 'Edit Logic Rule' : 'Add Logic Rule'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trigger Question *
                    </label>
                    <select
                      value={ruleData.trigger_question_id || ''}
                      onChange={(e) => setRuleData({ ...ruleData, trigger_question_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Select a question</option>
                      {allQuestions.map((question) => (
                        <option key={question.id} value={question.id}>
                          {question.sectionTitle} - {question.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Operator *
                      </label>
                      <select
                        value={ruleData.operator || 'equals'}
                        onChange={(e) => setRuleData({ ...ruleData, operator: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trigger Value *
                      </label>
                      <input
                        type="text"
                        value={ruleData.trigger_value || ''}
                        onChange={(e) => setRuleData({ ...ruleData, trigger_value: e.target.value })}
                        placeholder="Enter value to compare"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action *
                    </label>
                    <select
                      value={ruleData.action || 'show'}
                      onChange={(e) => setRuleData({ ...ruleData, action: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {actions.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(ruleData.action === 'show' || ruleData.action === 'hide' || ruleData.action === 'require' || ruleData.action === 'make_optional') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Question
                      </label>
                      <select
                        value={ruleData.target_question_id || ''}
                        onChange={(e) => setRuleData({ ...ruleData, target_question_id: e.target.value, target_section_id: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select a question</option>
                        {allQuestions.filter(q => q.id !== ruleData.trigger_question_id).map((question) => (
                          <option key={question.id} value={question.id}>
                            {question.sectionTitle} - {question.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {ruleData.action === 'skip_to_section' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Section
                      </label>
                      <select
                        value={ruleData.target_section_id || ''}
                        onChange={(e) => setRuleData({ ...ruleData, target_section_id: e.target.value, target_question_id: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select a section</option>
                        {sections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                  onClick={handleSaveRule}
                  disabled={!ruleData.trigger_question_id || !ruleData.action}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRule ? 'Update' : 'Add'} Rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogicConfiguration;