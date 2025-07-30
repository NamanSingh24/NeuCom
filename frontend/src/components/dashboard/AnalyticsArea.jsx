import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Clock,
  MessageSquare,
  FileText,
  Zap,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const AnalyticsArea = ({ systemStats, uploadedFiles, messages }) => {
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d
  const [activeMetric, setActiveMetric] = useState('usage');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handler functions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Analytics data refreshed');
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    const currentData = analyticsData[activeMetric];
    let csvContent = "Metric,Value,Change,Trend\n";
    
    currentData.metrics.forEach(metric => {
      csvContent += `"${metric.name}","${metric.value}","${metric.change}%","${metric.trend}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${activeMetric}_${timeRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Simple PDF generation simulation
    const currentData = analyticsData[activeMetric];
    let content = `Analytics Report - ${currentData.title}\n\n`;
    
    currentData.metrics.forEach(metric => {
      content += `${metric.name}: ${metric.value} (${metric.change}% ${metric.trend})\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${activeMetric}_${timeRange}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Mock analytics data for demonstration
  const analyticsData = {
    usage: {
      title: 'Usage Analytics',
      metrics: [
        { name: 'Total Queries', value: 1247, change: 12.5, trend: 'up' },
        { name: 'Active Users', value: 24, change: 8.2, trend: 'up' },
        { name: 'Avg Session Duration', value: '12m 34s', change: -5.1, trend: 'down' },
        { name: 'Success Rate', value: '94.8%', change: 2.3, trend: 'up' },
      ]
    },
    performance: {
      title: 'Performance Metrics',
      metrics: [
        { name: 'Response Time', value: '1.2s', change: -15.2, trend: 'up' },
        { name: 'Accuracy Score', value: '94.8%', change: 2.1, trend: 'up' },
        { name: 'System Uptime', value: '99.9%', change: 0.1, trend: 'up' },
        { name: 'Error Rate', value: '0.2%', change: -0.5, trend: 'up' },
      ]
    },
    documents: {
      title: 'Document Analytics',
      metrics: [
        { name: 'Total Documents', value: uploadedFiles.length, change: 15.8, trend: 'up' },
        { name: 'Total Chunks', value: uploadedFiles.reduce((sum, doc) => sum + (doc.chunks_created || 0), 0), change: 18.2, trend: 'up' },
        { name: 'Storage Used', value: `${(uploadedFiles.reduce((sum, doc) => sum + (doc.size || 0), 0) / (1024 * 1024)).toFixed(1)}MB`, change: 12.1, trend: 'up' },
        { name: 'Avg Processing Time', value: '45s', change: -8.3, trend: 'up' },
      ]
    }
  };

  // Mock chart data
  const chartData = {
    queries: [
      { day: 'Mon', value: 45 },
      { day: 'Tue', value: 52 },
      { day: 'Wed', value: 48 },
      { day: 'Thu', value: 61 },
      { day: 'Fri', value: 55 },
      { day: 'Sat', value: 35 },
      { day: 'Sun', value: 38 },
    ],
    responseTime: [
      { hour: '00', value: 0.8 },
      { hour: '04', value: 0.9 },
      { hour: '08', value: 1.2 },
      { hour: '12', value: 1.5 },
      { hour: '16', value: 1.3 },
      { hour: '20', value: 1.1 },
    ],
    accuracy: [
      { period: 'Week 1', value: 92.1 },
      { period: 'Week 2', value: 93.5 },
      { period: 'Week 3', value: 94.2 },
      { period: 'Week 4', value: 94.8 },
    ]
  };

  const topQuestions = [
    { question: "What are the emergency procedures?", count: 45, category: "Safety" },
    { question: "How to perform equipment maintenance?", count: 38, category: "Maintenance" },
    { question: "Quality control checklist steps", count: 32, category: "Quality" },
    { question: "Safety protocol for chemicals", count: 28, category: "Safety" },
    { question: "Operating manual for machine X", count: 24, category: "Operations" }
  ];

  const MetricCard = ({ metric }) => (
    <div className="card-corporate p-6 hover:scale-105 transition-transform">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            metric.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {metric.trend === 'up' ? (
              <TrendingUp className={`h-5 w-5 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className={`h-5 w-5 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">{metric.name}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-medium ${
            metric.change > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {metric.change > 0 ? '+' : ''}{metric.change}%
          </span>
          <p className="text-xs text-gray-500">vs last period</p>
        </div>
      </div>
    </div>
  );

  const SimpleBarChart = ({ data, dataKey, color }) => (
    <div className="flex items-end space-x-2 h-32">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div 
            className={`w-full ${color} rounded-t`}
            style={{ 
              height: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`,
              minHeight: '4px'
            }}
          ></div>
          <span className="text-xs text-gray-600 mt-2">{item.day || item.hour || item.period}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your SOP system performance and usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Metric Categories */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {Object.entries(analyticsData).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setActiveMetric(key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeMetric === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {data.title}
          </button>
        ))}
      </div>

      {/* Active Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData[activeMetric].metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Volume Chart */}
        <div className="card-corporate p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Daily Query Volume</h3>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <SimpleBarChart data={chartData.queries} dataKey="value" color="bg-blue-500" />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Peak: 61 queries (Thursday)</span>
            <span className="text-green-600">+12.5% vs last week</span>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="card-corporate p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Response Time (24h)</h3>
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <SimpleBarChart data={chartData.responseTime} dataKey="value" color="bg-purple-500" />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Avg: 1.2s</span>
            <span className="text-green-600">-15% vs yesterday</span>
          </div>
        </div>

        {/* Accuracy Trend */}
        <div className="card-corporate p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Accuracy Trend</h3>
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <SimpleBarChart data={chartData.accuracy} dataKey="value" color="bg-green-500" />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Current: 94.8%</span>
            <span className="text-green-600">+2.3% vs last month</span>
          </div>
        </div>

        {/* System Health */}
        <div className="card-corporate p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <span className="text-sm font-medium text-green-600">95%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Vector DB</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <span className="text-sm font-medium text-green-600">98%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">LLM Service</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
                <span className="text-sm font-medium text-yellow-600">88%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Voice Handler</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="text-sm font-medium text-green-600">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Questions and User Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Asked Questions */}
        <div className="card-corporate p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Questions</h3>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-4">
            {topQuestions.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.question}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.category === 'Safety' ? 'bg-red-100 text-red-800' :
                      item.category === 'Quality' ? 'bg-green-100 text-green-800' :
                      item.category === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500">{item.count} times</span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className="text-lg font-bold text-gray-900">{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Activity Insights */}
        <div className="card-corporate p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Usage Insights</h3>
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Peak Usage Hours</span>
                <span className="text-sm font-medium text-gray-900">2:00 PM - 4:00 PM</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Most Active Day</span>
                <span className="text-sm font-medium text-gray-900">Thursday</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Voice Usage</span>
                <span className="text-sm font-medium text-gray-900">23% of queries</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">24</p>
                  <p className="text-xs text-gray-600">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">12m</p>
                  <p className="text-xs text-gray-600">Avg Session</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">4.2</p>
                  <p className="text-xs text-gray-600">Queries/Session</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="card-corporate p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Analytics</h3>
            <p className="text-gray-600">Download detailed reports for further analysis</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsArea;
