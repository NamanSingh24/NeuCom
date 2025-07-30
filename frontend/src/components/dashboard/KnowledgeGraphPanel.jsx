import React, { useState, useEffect } from 'react';
import { Database, GitBranch, Target, Zap, FileText, Trash2, Eye, Search, Network } from 'lucide-react';
import apiService from '../../services/api';

const KnowledgeGraphPanel = ({ documents = [] }) => {
  const [kgData, setKgData] = useState(null);
  const [selectedSOP, setSelectedSOP] = useState(null);
  const [entityResults, setEntityResults] = useState(null);
  const [searchEntity, setSearchEntity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKGData();
  }, []);

  const fetchKGData = async () => {
    try {
      setLoading(true);
      const [status, sops] = await Promise.all([
        apiService.getKGStatus(),
        apiService.getKGSOPs()
      ]);
      setKgData({ status, sops });
    } catch (error) {
      console.error('Error fetching KG data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntitySearch = async () => {
    if (!searchEntity.trim()) return;
    
    try {
      setLoading(true);
      const results = await apiService.getEntitySteps(searchEntity);
      setEntityResults(results);
    } catch (error) {
      console.error('Error searching entity:', error);
      setEntityResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSOPSelect = (sop) => {
    setSelectedSOP(selectedSOP?.id === sop.id ? null : sop);
  };

  if (!kgData?.status?.available) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center text-center">
          <div>
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Knowledge Graph Unavailable</h3>
            <p className="text-gray-600 text-sm mb-4">
              Neo4j database is not connected. Start Neo4j to enable advanced relationship features.
            </p>
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
              <div>• Entity relationship mapping</div>
              <div>• Procedure step connections</div>
              <div>• Tool and material tracking</div>
              <div>• Enhanced search capabilities</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Network className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Knowledge Graph</h2>
          </div>
          <button
            onClick={fetchKGData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Database className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        
        {kgData.status.statistics && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{kgData.status.statistics.sop_count}</div>
              <div className="text-sm text-gray-600">SOPs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{kgData.status.statistics.step_count}</div>
              <div className="text-sm text-gray-600">Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{kgData.status.statistics.total_nodes}</div>
              <div className="text-sm text-gray-600">Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{kgData.status.statistics.total_relationships}</div>
              <div className="text-sm text-gray-600">Relations</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Entity Search */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-500" />
            Entity Search
          </h3>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search for tools, materials, concepts..."
              value={searchEntity}
              onChange={(e) => setSearchEntity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEntitySearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleEntitySearch}
              disabled={loading || !searchEntity.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>

          {entityResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              {entityResults.error ? (
                <div className="text-red-600">Error: {entityResults.error}</div>
              ) : (
                <div>
                  <div className="font-medium text-gray-900 mb-2">
                    Found {entityResults.count} steps related to "{entityResults.entity}"
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {entityResults.related_steps?.map((step, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="font-medium text-sm">{step.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          SOP: {step.sop_title} | Step {step.order + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SOP Knowledge Graph */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <GitBranch className="h-5 w-5 mr-2 text-green-500" />
            SOP Knowledge Base
          </h3>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {kgData.sops?.sops?.map((sop) => (
              <div key={sop.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => handleSOPSelect(sop)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{sop.title}</div>
                      <div className="text-sm text-gray-600">
                        {sop.step_count} steps • Created {new Date(sop.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {sop.step_count} steps
                      </span>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </button>
                
                {selectedSOP?.id === sop.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ID:</span>
                        <span className="ml-2 text-gray-600 font-mono text-xs">{sop.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Steps:</span>
                        <span className="ml-2 text-gray-600">{sop.step_count}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                        Start Procedure
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Knowledge Graph Integration Active</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphPanel;
