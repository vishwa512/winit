import React, { useState } from 'react';
import { ChevronLeft, Save, Send, Target, Award, Settings, Loader2 } from 'lucide-react';

interface ScoringPublishProps {
  template: any;
  onUpdate: (template: any) => void;
  onPrevious: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  saving?: boolean;
}

const ScoringPublish: React.FC<ScoringPublishProps> = ({
  template,
  onUpdate,
  onPrevious,
  onSaveDraft,
  onPublish,
  saving = false,
}) => {
  const [scoringEnabled, setScoringEnabled] = useState(
    template.scoring_rules?.isEnabled || false
  );
  const [threshold, setThreshold] = useState(
    template.scoring_rules?.threshold || 80
  );

  const sections = template.sections || [];
  const totalQuestions = sections.reduce((total: number, section: any) => total + section.questions.length, 0);
  const totalWeight = sections.reduce((total: number, section: any) => 
    total + section.questions.reduce((sectionTotal: number, question: any) => 
      sectionTotal + (question.weight || 10), 0
    ), 0
  );

  const handleScoringToggle = (enabled: boolean) => {
    setScoringEnabled(enabled);
    onUpdate({
      ...template,
      scoring_rules: {
        ...template.scoring_rules,
        isEnabled: enabled,
        weights: {},
        threshold: threshold,
        criticalQuestions: [],
      },
    });
  };

  const handleThresholdChange = (newThreshold: number) => {
    setThreshold(newThreshold);
    onUpdate({
      ...template,
      scoring_rules: {
        ...template.scoring_rules,
        isEnabled: scoringEnabled,
        threshold: newThreshold,
        weights: {},
        criticalQuestions: [],
      },
    });
  };

  const isValid = template.name && template.category && sections.length > 0 && totalQuestions > 0;

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Scoring & Publish</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Configure scoring settings and publish your template
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
          {/* Template Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Template Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{sections.length}</div>
                <div className="text-xs sm:text-sm text-blue-700">Sections</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{totalQuestions}</div>
                <div className="text-xs sm:text-sm text-green-700">Questions</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{template.category}</div>
                <div className="text-xs sm:text-sm text-purple-700">Category</div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 space-y-2">
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">{template.name}</h4>
              <p className="text-gray-600 text-sm">{template.description}</p>
            </div>
          </div>

          {/* Scoring Configuration */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Scoring Configuration</h3>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">Enable Scoring</h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Automatically calculate scores and compliance ratings for audits
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scoringEnabled}
                    onChange={(e) => handleScoringToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {scoringEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compliance Threshold (%)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={threshold}
                        onChange={(e) => handleThresholdChange(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="w-full sm:w-16 text-center">
                        <span className="text-base sm:text-lg font-semibold text-gray-900">{threshold}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Audits scoring below this threshold will be marked as non-compliant
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900 text-sm sm:text-base">Scoring Summary</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-blue-700">Total Questions:</span>
                        <span className="font-medium ml-2">{totalQuestions}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Weight:</span>
                        <span className="font-medium ml-2">{totalWeight} points</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Pass Score:</span>
                        <span className="font-medium ml-2">{threshold}%</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Min Points:</span>
                        <span className="font-medium ml-2">{Math.round(totalWeight * threshold / 100)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Validation */}
          {!isValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Settings className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Template Incomplete
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Please ensure the following before publishing:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {!template.name && <li>Template name is required</li>}
                      {!template.category && <li>Category selection is required</li>}
                      {sections.length === 0 && <li>At least one section is required</li>}
                      {totalQuestions === 0 && <li>At least one question is required</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-6 border-t border-gray-200 gap-4">
          <button
            onClick={onPrevious}
            disabled={saving}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="text-xs sm:text-sm text-gray-500 text-center">
            Step 4 of 4 • Ready to publish
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onSaveDraft}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Draft
            </button>
            <button
              onClick={onPublish}
              disabled={!isValid || saving}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publish Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringPublish;