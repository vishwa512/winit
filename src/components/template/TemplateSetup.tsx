import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TemplateSetupProps {
  template: any;
  onUpdate: (template: any) => void;
  onNext: () => void;
}

const TemplateSetup: React.FC<TemplateSetupProps> = ({ template, onUpdate, onNext }) => {
  const categories = [
    'Merchandising',
    'Quality',
    'Stock',
    'Compliance',
    'Safety',
    'Customer Service',
    'Cleanliness',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (template.name && template.category) {
      onNext();
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Template Setup</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Let's start by setting up the basic information for your audit template
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              id="name"
              value={template.name || ''}
              onChange={(e) => onUpdate({ ...template, name: e.target.value })}
              placeholder="Enter a descriptive name for your template"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm sm:text-base"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a clear, descriptive name that identifies the purpose of this audit
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={template.description || ''}
              onChange={(e) => onUpdate({ ...template, description: e.target.value })}
              placeholder="Provide a brief description of what this audit template covers"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add more details about the scope and purpose of this audit
            </p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Audit Category *
            </label>
            <select
              id="category"
              value={template.category || ''}
              onChange={(e) => onUpdate({ ...template, category: e.target.value })}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm sm:text-base"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the category that best describes this audit template
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-xs sm:text-sm text-gray-500">
              Step 1 of 5
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateSetup;