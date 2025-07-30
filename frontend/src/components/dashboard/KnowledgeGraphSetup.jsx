import React, { useState, useEffect } from 'react';
import { Database, ExternalLink, CheckCircle, AlertCircle, Terminal, Download } from 'lucide-react';
import { apiService } from '../../services/api';

const KnowledgeGraphSetup = () => {
  const [kgStatus, setKgStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkKGStatus = async () => {
      try {
        const status = await apiService.getKGStatus();
        setKgStatus(status);
      } catch (error) {
        console.error('Failed to check KG status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkKGStatus();
    // Check every 30 seconds
    const interval = setInterval(checkKGStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="card-corporate p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (kgStatus?.available) {
    return (
      <div className="card-corporate p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-green-700">
          <Database className="h-5 w-5 mr-2" />
          Knowledge Graph Active
        </h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Neo4j Connected</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>✅ Enhanced entity relationship mapping</p>
            <p>✅ Advanced SOP step connections</p>
            <p>✅ Intelligent query filtering</p>
            <p>✅ Contextual answer enhancement</p>
          </div>
          {kgStatus.statistics && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="text-xs text-green-600 grid grid-cols-2 gap-2">
                <span>SOPs: {kgStatus.statistics.sop_count || 0}</span>
                <span>Steps: {kgStatus.statistics.step_count || 0}</span>
                <span>Nodes: {kgStatus.statistics.total_nodes || 0}</span>
                <span>Relations: {kgStatus.statistics.total_relationships || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card-corporate p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-yellow-700">
        <Database className="h-5 w-5 mr-2" />
        Knowledge Graph Setup
      </h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="font-medium text-yellow-800">Currently using RAG-only mode</span>
        </div>
        <p className="text-sm text-yellow-700 mb-3">
          Enable Knowledge Graph for enhanced entity relationships and contextual understanding.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <Download className="h-4 w-4 mr-2 text-blue-600" />
            Quick Setup Options
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 rounded p-3">
              <div className="font-medium text-gray-800 mb-1">Option 1: Docker (Recommended)</div>
              <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
                docker run -d --name neo4j \<br/>
                &nbsp;&nbsp;-p 7474:7474 -p 7687:7687 \<br/>
                &nbsp;&nbsp;-e NEO4J_AUTH=neo4j/testpassword \<br/>
                &nbsp;&nbsp;neo4j:latest
              </code>
            </div>

            <div className="bg-gray-50 rounded p-3">
              <div className="font-medium text-gray-800 mb-1">Option 2: Homebrew (macOS)</div>
              <code className="block bg-gray-800 text-green-400 p-2 rounded text-xs">
                brew install neo4j<br/>
                neo4j start
              </code>
            </div>

            <div className="bg-gray-50 rounded p-3">
              <div className="font-medium text-gray-800 mb-1">Option 3: Download</div>
              <p className="text-gray-600 mb-2">Download Neo4j Desktop from official website</p>
              <a 
                href="https://neo4j.com/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                neo4j.com/download
              </a>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What Knowledge Graph Enables:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Entity Recognition:</strong> Identifies tools, materials, and processes</li>
            <li>• <strong>Relationship Mapping:</strong> Connects related SOP steps and procedures</li>
            <li>• <strong>Contextual Queries:</strong> Better understanding of user intent</li>
            <li>• <strong>Smart Filtering:</strong> More relevant search results</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="btn-corporate"
          >
            <Database className="h-4 w-4 mr-2" />
            Check Connection Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphSetup;
