import React from 'react';
import { CheckCircle, Clock, FileText } from 'lucide-react';

const RecentActivity = ({ uploadedFiles }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
      <Clock className="h-5 w-5 mr-2 text-indigo-600" />
      Recent Activity
    </h2>
    <div className="space-y-4">
      {uploadedFiles.slice(-3).map((file, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 border border-gray-100">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Document processed</p>
            <p className="text-xs text-gray-500">{file.name}</p>
          </div>
          <span className="text-xs text-gray-500">
            {file.processed ? 'Completed' : 'Processing...'}
          </span>
        </div>
      ))}
      {uploadedFiles.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">No recent activity</p>
        </div>
      )}
    </div>
  </div>
);

export default RecentActivity;
