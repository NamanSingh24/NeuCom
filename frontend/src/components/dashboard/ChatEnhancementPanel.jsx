import React, { useState, useEffect } from 'react';
import { MessageSquare, Brain, Search, Zap, FileText, Target, Clock } from 'lucide-react';
import apiService from '../../services/api';

const ChatEnhancementPanel = ({ onQueryChange, onContextFilterChange }) => {
  const [kgStatus, setKgStatus] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [currentProcedure, setCurrentProcedure] = useState(null);
  const [queryMode, setQueryMode] = useState('general'); // general, procedure, entity
  const [selectedEntity, setSelectedEntity] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [kg, procs, current] = await Promise.all([
        apiService.getKGStatus(),
        apiService.getAvailableProcedures(),
        apiService.getCurrentProcedure()
      ]);
      setKgStatus(kg);
      setProcedures(procs.procedures || []);
      setCurrentProcedure(current);
    } catch (error) {
      console.error('Error fetching enhancement data:', error);
    }
  };

  const handleProcedureStart = async (procedureName) => {
    try {
      const result = await apiService.startProcedure(procedureName);
      if (result.success) {
        setCurrentProcedure(result.procedure);
        onContextFilterChange({ procedure: procedureName });
      }
    } catch (error) {
      console.error('Error starting procedure:', error);
    }
  };

  const handleEntityQuery = async () => {
    if (!selectedEntity) return;
    try {
      const result = await apiService.getEntitySteps(selectedEntity);
      const queryText = `Show me all steps related to "${selectedEntity}"`;
      onQueryChange(queryText);
      onContextFilterChange({ entity: selectedEntity });
    } catch (error) {
      console.error('Error querying entity:', error);
    }
  };

  const quickPrompts = [
    { text: "What are the safety requirements?", icon: Target },
    { text: "Show me the procedure steps", icon: FileText },
    { text: "What tools do I need?", icon: Zap },
    { text: "How long does this take?", icon: Clock },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Brain className="h-5 w-5 mr-2 text-blue-500" />
        Smart Query Assistant
      </h3>

      {/* Query Mode Selector */}
      <div className="flex space-x-2">
        {[
          { id: 'general', label: 'General', icon: MessageSquare },
          { id: 'procedure', label: 'Procedure', icon: FileText },
          { id: 'entity', label: 'Entity Search', icon: Search, disabled: !kgStatus?.available }
        ].map(mode => (
          <button
            key={mode.id}
            disabled={mode.disabled}
            onClick={() => setQueryMode(mode.id)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              queryMode === mode.id
                ? 'bg-blue-100 text-blue-700'
                : mode.disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <mode.icon className="h-4 w-4" />
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Mode-specific Content */}
      {queryMode === 'procedure' && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Available Procedures</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {procedures.map((proc, index) => (
              <button
                key={index}
                onClick={() => handleProcedureStart(proc.name || proc)}
                className="w-full text-left p-2 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-sm">{proc.name || proc}</div>
                {proc.steps && (
                  <div className="text-xs text-gray-500">{proc.steps} steps</div>
                )}
              </button>
            ))}
          </div>
          
          {currentProcedure && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="font-medium text-blue-900">Current: {currentProcedure.name}</div>
              <div className="text-sm text-blue-700">
                Step {currentProcedure.current_step + 1} of {currentProcedure.total_steps}
              </div>
            </div>
          )}
        </div>
      )}

      {queryMode === 'entity' && kgStatus?.available && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Entity Search</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter entity name (e.g., wrench, safety, chemical)"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleEntityQuery}
              disabled={!selectedEntity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          {kgStatus.statistics && (
            <div className="text-xs text-gray-500">
              Knowledge Graph: {kgStatus.statistics.sop_count} SOPs, {kgStatus.statistics.step_count} steps
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Quick Prompts</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onQueryChange(prompt.text)}
              className="flex items-center space-x-2 p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <prompt.icon className="h-4 w-4 text-gray-500" />
              <span className="text-left">{prompt.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Graph Status */}
      {kgStatus && (
        <div className={`p-3 rounded-lg text-sm ${
          kgStatus.available 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`}>
          <div className="font-medium">
            Knowledge Graph: {kgStatus.available ? 'Active' : 'Not Available'}
          </div>
          <div className="text-xs mt-1">
            {kgStatus.available 
              ? 'Enhanced AI responses with relationship data'
              : 'Using standard RAG mode only'
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatEnhancementPanel;
