import React, { useState } from 'react';
import { useAudit } from '../contexts/AuditContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  MapPin,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';

const Reports: React.FC = () => {
  const { state } = useAudit();
  const { audits, templates } = state;
  const [dateRange, setDateRange] = useState('last_30_days');
  const [selectedTemplate, setSelectedTemplate] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Calculate metrics
  const completedAudits = audits.filter(a => a.status === 'completed');
  const averageScore = completedAudits.length > 0
    ? completedAudits.reduce((sum, a) => sum + (a.score || 0), 0) / completedAudits.length
    : 0;
  
  const complianceRate = completedAudits.length > 0
    ? (completedAudits.filter(a => (a.score || 0) >= 80).length / completedAudits.length) * 100
    : 0;

  const auditsByStatus = {
    completed: audits.filter(a => a.status === 'completed').length,
    in_progress: audits.filter(a => a.status === 'in_progress').length,
    pending: audits.filter(a => a.status === 'pending').length,
    overdue: audits.filter(a => a.status === 'overdue').length,
  };

  const scoreDistribution = [
    { range: '90-100%', count: completedAudits.filter(a => (a.score || 0) >= 90).length, color: 'bg-green-500' },
    { range: '80-89%', count: completedAudits.filter(a => (a.score || 0) >= 80 && (a.score || 0) < 90).length, color: 'bg-blue-500' },
    { range: '70-79%', count: completedAudits.filter(a => (a.score || 0) >= 70 && (a.score || 0) < 80).length, color: 'bg-yellow-500' },
    { range: 'Below 70%', count: completedAudits.filter(a => (a.score || 0) < 70).length, color: 'bg-red-500' },
  ];

  const maxCount = Math.max(...scoreDistribution.map(d => d.count), 1);

  const exportReport = (format: string) => {
    // Simulate export functionality
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Analyze your audit performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportReport('pdf')}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Templates</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Regions</option>
              <option value="downtown">Downtown</option>
              <option value="uptown">Uptown</option>
              <option value="midtown">Midtown</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+2.5% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
              <p className="text-3xl font-bold text-gray-900">{complianceRate.toFixed(1)}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">+5.2% vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Audits</p>
              <p className="text-3xl font-bold text-gray-900">{audits.length}</p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600 ml-1">{auditsByStatus.completed} completed</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Audits</p>
              <p className="text-3xl font-bold text-gray-900">{auditsByStatus.overdue}</p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600 ml-1">Requires attention</span>
              </div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Score Distribution</h3>
          <div className="space-y-4">
            {scoreDistribution.map((item) => (
              <div key={item.range} className="flex items-center">
                <div className="w-20 text-sm text-gray-600">{item.range}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${item.color} transition-all duration-300`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-8 text-sm font-medium text-gray-900">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Audit Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">Completed</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{auditsByStatus.completed}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="font-medium text-yellow-900">In Progress</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{auditsByStatus.in_progress}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">Pending</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{auditsByStatus.pending}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <span className="font-medium text-red-900">Overdue</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{auditsByStatus.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Audit Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auditor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedAudits.slice(0, 10).map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{audit.templateName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{audit.location.storeName}</div>
                    <div className="text-sm text-gray-500">{audit.location.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {audit.assignedToName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{audit.score}%</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (audit.score || 0) >= 80 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${audit.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (audit.score || 0) >= 80 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(audit.score || 0) >= 80 ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {audit.submittedAt?.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;