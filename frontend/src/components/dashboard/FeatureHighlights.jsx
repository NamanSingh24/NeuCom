import React from 'react';
import { Upload, MessageSquare, Mic } from 'lucide-react';

const FeatureHighlights = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="card-corporate p-6">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Upload className="h-6 w-6 text-blue-600" />
      </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Smart Document Processing</h3>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Upload PDFs, DOCX, and Markdown files. Our AI automatically extracts and indexes content for instant retrieval.
      </p>
    </div>
    <div className="card-corporate p-6">
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
        <MessageSquare className="h-6 w-6 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Conversational AI</h3>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Ask questions in natural language and get precise answers with source references and confidence scores.
      </p>
    </div>
    <div className="card-corporate p-6">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
        <Mic className="h-6 w-6 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Voice Interaction</h3>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        Enable hands-free operation with voice commands and audio responses for seamless workflow integration.
      </p>
    </div>
  </div>
);

export default FeatureHighlights;
