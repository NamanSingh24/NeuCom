import React, { useState, useEffect } from 'react';
import { CheckCircle, Brain, AlertCircle, Database, Wifi, WifiOff } from 'lucide-react';
import { apiService } from '../../services/api';

const AISystemStatus = ({ systemStats }) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [kgStatus, setKgStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // Check general health
        const health = await apiService.healthCheck();
        setHealthStatus(health);

        // Check Knowledge Graph status
        const kg = await apiService.getKGStatus();
        setKgStatus(kg);
      } catch (error) {
        console.error('Health check failed:', error);
        setHealthStatus({ status: 'unhealthy', error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkSystemHealth();
    // Refresh every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card-corporate p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          AI System Status
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-corporate p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Brain className="h-5 w-5 mr-2 text-purple-600" />
        AI System Status
      </h2>
      <div className="space-y-4">
        {/* Overall Health */}
        <div className={`p-4 rounded-lg border ${
          healthStatus?.status === 'healthy' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            {healthStatus?.status === 'healthy' ? (
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            )}
            <span className={`text-sm font-medium ${
              healthStatus?.status === 'healthy' ? 'text-green-800' : 'text-red-800'
            }`}>
              System Health
            </span>
          </div>
          <p className={`text-sm ${
            healthStatus?.status === 'healthy' ? 'text-green-700' : 'text-red-700'
          }`}>
            {healthStatus?.status === 'healthy' 
              ? 'All core systems operational. RAG engine and Groq API responding normally.'
              : `System issues detected: ${healthStatus?.error || 'Unknown error'}`
            }
          </p>
        </div>

        {/* Knowledge Graph Status */}
        <div className={`p-4 rounded-lg border ${
          kgStatus?.available 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center mb-2">
            <Database className={`h-4 w-4 mr-2 ${
              kgStatus?.available ? 'text-blue-600' : 'text-yellow-600'
            }`} />
            <span className={`text-sm font-medium ${
              kgStatus?.available ? 'text-blue-800' : 'text-yellow-800'
            }`}>
              Knowledge Graph
            </span>
          </div>
          <p className={`text-sm ${
            kgStatus?.available ? 'text-blue-700' : 'text-yellow-700'
          }`}>
            {kgStatus?.available 
              ? `Connected to Neo4j | ${kgStatus.statistics?.sop_count || 0} SOPs | ${kgStatus.statistics?.step_count || 0} Steps`
              : 'Using RAG-only mode. Neo4j database not connected for enhanced entity relationships.'
            }
          </p>
        </div>

        {/* Component Status */}
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center mb-2">
            <Wifi className="h-4 w-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-800">Component Status</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                healthStatus?.components?.rag_engine === 'ok' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>RAG Engine</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                healthStatus?.components?.groq_client === 'ok' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>Groq LLM</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                healthStatus?.components?.voice_handler === 'ok' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span>Voice System</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                healthStatus?.components?.knowledge_graph === 'ok' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span>Knowledge Graph</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Documents: {systemStats?.vector_db_stats?.total_documents || 0} | 
            Avg. Response: {healthStatus?.response_time || '1.2'}s
          </p>
        </div>
      </div>
    </div>
  );
};

export default AISystemStatus;
