import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import { v4 as uuidv4 } from 'uuid';
import TemplateSetup from '../components/template/TemplateSetup';
import SectionDefinition from '../components/template/SectionDefinition';
import QuestionBuilder from '../components/template/QuestionBuilder';
import LogicConfiguration from '../components/template/LogicConfiguration';
import ScoringPublish from '../components/template/ScoringPublish';
import ProgressIndicator from '../components/template/ProgressIndicator';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import type { Template, Section, Question, LogicRule, ScoringRules } from '../types';

const TemplateCreation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getTemplate, createTemplate, updateTemplate, loading } = useSupabase();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<Template>({
    name: '',
    description: '',
    category: '',
    sections: [],
    logic_rules: [],
    scoring_rules: {
      isEnabled: false,
      weights: {},
      threshold: 80,
      criticalQuestions: [],
    },
    is_published: false,
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id) {
      loadTemplate(id);
    }
  }, [id, isEditing]);

  const loadTemplate = async (templateId: string) => {
    const data = await getTemplate(templateId);
    if (data) {
      setTemplate({
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        sections: data.sections || [],
        logic_rules: data.logic_rules || [],
        scoring_rules: data.scoring_rules || {
          isEnabled: false,
          weights: {},
          threshold: 80,
          criticalQuestions: [],
        },
        created_by: data.created_by,
        is_published: data.is_published,
      });
    }
  };

  const steps = [
    { number: 1, title: 'Template Setup', description: 'Basic information' },
    { number: 2, title: 'Define Sections', description: 'Organize your audit' },
    { number: 3, title: 'Add Questions', description: 'Build your questions' },
    { number: 4, title: 'Configure Logic', description: 'Set conditional rules' },
    { number: 5, title: 'Scoring & Publish', description: 'Finalize template' },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      if (isEditing && id) {
        await updateTemplate(id, { ...template, is_published: false });
      } else {
        await createTemplate({ ...template, is_published: false });
      }
      navigate('/templates');
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      if (isEditing && id) {
        await updateTemplate(id, { ...template, is_published: true });
      } else {
        await createTemplate({ ...template, is_published: true });
      }
      navigate('/templates');
    } catch (error) {
      console.error('Error publishing template:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TemplateSetup
            template={template}
            onUpdate={setTemplate}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <SectionDefinition
            template={template}
            onUpdate={setTemplate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <QuestionBuilder
            template={template}
            onUpdate={setTemplate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <LogicConfiguration
            template={template}
            onUpdate={setTemplate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <ScoringPublish
            template={template}
            onUpdate={setTemplate}
            onPrevious={handlePrevious}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            saving={saving}
          />
        );
      default:
        return null;
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
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/templates')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Template' : 'Create New Template'}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Draft
        </button>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator steps={steps} currentStep={currentStep} />

      {/* Step Content */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default TemplateCreation;