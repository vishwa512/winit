import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Edit, Trash2, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: any[];
}

interface SectionDefinitionProps {
  template: any;
  onUpdate: (template: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const SectionDefinition: React.FC<SectionDefinitionProps> = ({
  template,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');

  const sections = template.sections || [];

  const handleAddSection = () => {
    setEditingSection(null);
    setSectionTitle('');
    setSectionDescription('');
    setShowModal(true);
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionTitle(section.title);
    setSectionDescription(section.description || '');
    setShowModal(true);
  };

  const handleSaveSection = () => {
    if (!sectionTitle.trim()) return;

    const newSection: Section = {
      id: editingSection?.id || uuidv4(),
      title: sectionTitle,
      description: sectionDescription,
      order: editingSection?.order || sections.length + 1,
      questions: editingSection?.questions || [],
    };

    let updatedSections: Section[];
    if (editingSection) {
      updatedSections = sections.map((s: Section) => s.id === editingSection.id ? newSection : s);
    } else {
      updatedSections = [...sections, newSection];
    }

    onUpdate({ ...template, sections: updatedSections });
    setShowModal(false);
    setSectionTitle('');
    setSectionDescription('');
  };

  const handleDeleteSection = (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const updatedSections = sections.filter((s: Section) => s.id !== sectionId);
      onUpdate({ ...template, sections: updatedSections });
    }
  };

  const handleNext = () => {
    if (sections.length > 0) {
      onNext();
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Define Sections</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Organize your audit into logical sections to structure the evaluation process
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {sections.map((section: Section, index: number) => (
            <div
              key={section.id}
              className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="mt-1 hidden sm:block">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{section.title}</h3>
                    {section.description && (
                      <p className="text-gray-600 mt-1 text-sm line-clamp-2">{section.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 text-xs sm:text-sm text-gray-500">
                      <span>Section {index + 1}</span>
                      <span>{section.questions.length} question{section.questions.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                  <button
                    onClick={() => handleEditSection(section)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddSection}
            className="w-full p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm sm:text-base">Add New Section</span>
          </button>
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
            Step 2 of 4 • {sections.length} section{sections.length !== 1 ? 's' : ''} defined
          </div>
          <button
            onClick={handleNext}
            disabled={sections.length === 0}
            className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title *
                    </label>
                    <input
                      type="text"
                      value={sectionTitle}
                      onChange={(e) => setSectionTitle(e.target.value)}
                      placeholder="Enter section title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={sectionDescription}
                      onChange={(e) => setSectionDescription(e.target.value)}
                      placeholder="Brief description of this section"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  disabled={!sectionTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingSection ? 'Update' : 'Add'} Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionDefinition;