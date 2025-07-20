import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  description: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, stepIdx) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            
            return (
              <li key={step.number} className="relative flex-1 min-w-0">
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 hidden sm:block">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}
                
                <div className="relative flex flex-col items-center group">
                  <div
                    className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all duration-200 ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <span className="text-xs sm:text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-center min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-medium transition-colors duration-200 truncate ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 hidden md:block truncate">
                      {step.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default ProgressIndicator;