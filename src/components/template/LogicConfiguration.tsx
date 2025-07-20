import React from 'react';
import { Template } from '../../types';
import { ChevronLeft, ChevronRight, Settings, Zap } from 'lucide-react';

interface LogicConfigurationProps {
  template: Partial<Template>;
  onUpdate: (template: Partial<Template>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const LogicConfiguration: React.FC<LogicConfigurationProps> = ({
  template,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const sections = template.sections || [];
  const allQuestions = sections.flatMap(section => 
    section.questions.map(q => ({
      ...q,
      sectionTitle: section.title,
      sectionId: section.id,
    }))
  );

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Configure Logic</h2>
          <p className="text-gray-600 mt-2">
            Set up conditional logic to create dynamic audit flows
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Smart Logic Engine</h3>
              <p className="text-blue-700 mt-1">
                Configure conditional logic to show/hide questions based on previous responses, 
                creating personalized audit experiences.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{question.text}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {question.sectionTitle} • {question.type.replace('_', ' ')}
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logic Builder</h3>
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No logic rules configured</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add conditional logic to create dynamic question flows
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                  <Zap className="w-4 h-4 mr-2" />
                  Add Logic Rule
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Advanced Feature
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Logic configuration is an advanced feature that allows you to create 
                    complex conditional flows. You can skip this step and add logic later 
                    if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={onPrevious}
            className="inline-flex items-center px-6 py-3 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          <div className="text-sm text-gray-500">
            Step 4 of 5 • Logic configuration (optional)
          </div>
          <button
            onClick={onNext}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicConfiguration;