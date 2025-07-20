import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabase } from '../hooks/useSupabase';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  FileText,
  Calendar,
  User,
  Loader2,
} from 'lucide-react';

const Templates: React.FC = () => {
  const { getTemplates, deleteTemplate, publishTemplate, loading, error } = useSupabase();
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data);
  };

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && template.is_published) ||
                         (statusFilter === 'draft' && !template.is_published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setActionLoading(id);
      const success = await deleteTemplate(id);
      if (success) {
        setTemplates(templates.filter(t => t.id !== id));
      }
      setActionLoading(null);
    }
  };

  const handlePublishTemplate = async (id: string) => {
    setActionLoading(id);
    const success = await publishTemplate(id);
    if (success) {
      setTemplates(templates.map(t => 
        t.id === id ? { ...t, is_published: true } : t
      ));
    }
    setActionLoading(null);
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  if (loading && templates.length === 0) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Templates</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage your audit templates</p>
        </div>
        <Link
          to="/templates/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        template.is_published
                      )}`}
                    >
                      {template.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                  
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">Created {new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{(template.sections || []).length} section{(template.sections || []).length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800">
                      <span className="truncate">{template.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/templates/edit/${template.id}`}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Link>

                {!template.is_published && (
                  <button
                    onClick={() => handlePublishTemplate(template.id)}
                    disabled={actionLoading === template.id}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 disabled:opacity-50"
                  >
                    {actionLoading === template.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-1" />
                    )}
                    Publish
                  </button>
                )}

                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  disabled={actionLoading === template.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {actionLoading === template.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Get started by creating a new template'}
          </p>
          {(!searchTerm && categoryFilter === 'all' && statusFilter === 'all') && (
            <div className="mt-6">
              <Link
                to="/templates/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first template
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Templates;