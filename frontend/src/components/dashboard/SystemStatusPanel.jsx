import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Database, Brain, Mic, FileText, Activity } from 'lucide-react';
import apiService from '../../services/api';

const SystemStatusPanel = () => {
  const [healthData, setHealthData] = useState(null);
  const [kgStatus, setKgStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const [health, kg] = await Promise.all([
        apiService.healthCheck(),
        apiService.getKGStatus()
      ]);
      setHealthData(health);
      setKgStatus(kg);
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disabled':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'disabled':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-red-200 bg-red-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <Activity className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Checking system status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-blue-500" />
        System Status
      </h3>

      <div className="space-y-3">
        {/* Core Components */}
        {healthData?.components && Object.entries(healthData.components).map(([component, status]) => (
          <div
            key={component}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(status)}`}
          >
            <div className="flex items-center">
              {component === 'document_processor' && <FileText className="h-4 w-4 mr-2" />}
              {component === 'rag_engine' && <Database className="h-4 w-4 mr-2" />}
              {component === 'groq_client' && <Brain className="h-4 w-4 mr-2" />}
              {component === 'voice_handler' && <Mic className="h-4 w-4 mr-2" />}
              {component === 'knowledge_graph' && <Database className="h-4 w-4 mr-2" />}
              <span className="font-medium text-sm capitalize">
                {component.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center">
              {getStatusIcon(status)}
              <span className="ml-2 text-xs font-medium capitalize text-gray-600">
                {status}
              </span>
            </div>
          </div>
        ))}

        {/* Knowledge Graph Details */}
        {kgStatus && (
          <div className={`p-3 rounded-lg border ${kgStatus.available ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">Knowledge Graph</span>
              {getStatusIcon(kgStatus.available ? 'ok' : 'disabled')}
            </div>
            
            {kgStatus.available && kgStatus.statistics && (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>SOPs: {kgStatus.statistics.sop_count}</div>
                <div>Steps: {kgStatus.statistics.step_count}</div>
                <div>Nodes: {kgStatus.statistics.total_nodes}</div>
                <div>Relations: {kgStatus.statistics.total_relationships}</div>
              </div>
            )}
            
            {!kgStatus.available && (
              <p className="text-xs text-gray-600">
                {kgStatus.message || 'Neo4j not connected'}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span className={`px-2 py-1 rounded-full ${healthData?.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {healthData?.status || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPanel;
