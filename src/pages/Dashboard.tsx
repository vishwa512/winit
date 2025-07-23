import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  MapPin,
  Plus,
  Eye,
  Edit,
  Play,
  Target,
  Award,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { getTemplates, getAudits, getUsers, loading, error } = useSupabase();
  const [templates, setTemplates] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalTemplates: 0,
    publishedTemplates: 0,
    totalAudits: 0,
    completedAudits: 0,
    pendingAudits: 0,
    overdueAudits: 0,
    averageScore: 0,
    complianceRate: 0,
    totalUsers: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [templatesData, auditsData, usersData] = await Promise.all([
        getTemplates(),
        getAudits(),
        getUsers(),
      ]);

      setTemplates(templatesData);
      setAudits(auditsData);
      setUsers(usersData);

      // Calculate metrics
      const completedAudits = auditsData.filter((a: any) => a.status === 'completed');
      const averageScore = completedAudits.length > 0
        ? completedAudits.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / completedAudits.length
        : 0;
      
      const complianceRate = completedAudits.length > 0
        ? (completedAudits.filter((a: any) => (a.score || 0) >= 80).length / completedAudits.length) * 100
        : 0;

      setMetrics({
        totalTemplates: templatesData.length,
        publishedTemplates: templatesData.filter((t: any) => t.is_published).length,
        totalAudits: auditsData.length,
        completedAudits: completedAudits.length,
        pendingAudits: auditsData.filter((a: any) => a.status === 'pending').length,
        overdueAudits: auditsData.filter((a: any) => a.status === 'overdue').length,
        averageScore: Math.round(averageScore),
        complianceRate: Math.round(complianceRate),
        totalUsers: usersData.length,
        activeUsers: usersData.filter((u: any) => u.last_login).length,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

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

  if (loading) {
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Welcome back! Here's what's happening with your retail audits.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            to="/templates/create"
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Link>
          <Link
            to="/audits"
            className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 text-blue-700 bg-blue-50 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors duration-200"
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            View Audits
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Templates</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.totalTemplates}</p>
              <p className="text-xs text-gray-500">{metrics.publishedTemplates} published</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <ClipboardCheck className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Audits</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.totalAudits}</p>
              <p className="text-xs text-gray-500">{metrics.completedAudits} completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <Target className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Avg Score</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.averageScore}%</p>
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+2.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
              <Award className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Compliance</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{metrics.complianceRate}%</p>
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+5.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Audit Status Overview</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3" />
                <span className="font-medium text-green-900 text-sm sm:text-base">Completed</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-green-600">{metrics.completedAudits}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3" />
                <span className="font-medium text-blue-900 text-sm sm:text-base">Pending</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-blue-600">{metrics.pendingAudits}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 sm:mr-3" />
                <span className="font-medium text-red-900 text-sm sm:text-base">Overdue</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-red-600">{metrics.overdueAudits}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/templates/create"
              className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Create Template</h4>
                <p className="text-xs sm:text-sm text-gray-500">Build a new audit template</p>
              </div>
            </Link>

            <Link
              to="/audits"
              className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Execute Audit</h4>
                <p className="text-xs sm:text-sm text-gray-500">Start or continue an audit</p>
              </div>
            </Link>

            <Link
              to="/users"
              className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm sm:text-base">Manage Users</h4>
                <p className="text-xs sm:text-sm text-gray-500">Add or edit team members</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Templates */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Templates</h3>
            <Link
              to="/templates"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all templates
            </Link>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {templates.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FileText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No templates yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first template</p>
              <div className="mt-4 sm:mt-6">
                <Link
                  to="/templates/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.slice(0, 6).map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          template.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {template.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
                    {template.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.category}</span>
                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Link
                      to={`/templates/edit/${template.id}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Audits */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Audits</h3>
            <Link
              to="/audits"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all audits
            </Link>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {audits.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <ClipboardCheck className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audits yet</h3>
              <p className="mt-1 text-sm text-gray-500">Audits will appear here once they are assigned</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {audits.slice(0, 5).map((audit) => (
                <div
                  key={audit.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3 mb-3 sm:mb-0">
                    {getStatusIcon(audit.status)}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {audit.template_name}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {audit.location?.store_name || 'No location'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(audit.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        audit.status
                      )}`}
                    >
                      {audit.status.replace('_', ' ')}
                    </span>
                    {audit.score && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{audit.score}%</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;