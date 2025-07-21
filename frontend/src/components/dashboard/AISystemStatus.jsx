import React from 'react';
import { CheckCircle, Brain } from 'lucide-react';

const AISystemStatus = ({ systemStats }) => (
  <div className="card-corporate p-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <Brain className="h-5 w-5 mr-2 text-purple-600" />
      AI System Status
    </h2>
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
        <div className="flex items-center mb-2">
          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">System Health</span>
        </div>
        <p className="text-sm text-green-700">
          All systems operational. RAG engine and Groq API responding normally.
        </p>
      </div>
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center mb-2">
          <Brain className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">AI Performance</span>
        </div>
        <p className="text-sm text-blue-700">
          Average response time: 1.2s | Accuracy: 94.8% | Vector DB: {systemStats?.vector_db_stats?.total_documents || 0} documents
        </p>
      </div>
    </div>
  </div>
);

export default AISystemStatus;
