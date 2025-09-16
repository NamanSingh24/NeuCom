import React from 'react';
import { Upload, MessageSquare, Mic } from 'lucide-react';

const FeatureHighlights = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
        <Upload className="h-6 w-6 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Smart Document Processing</h3>
      <p className="text-gray-600 text-sm">
        Upload PDFs, DOCX, and Markdown files. Our AI automatically extracts and indexes content for instant retrieval.
      </p>
    </div>
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
        <MessageSquare className="h-6 w-6 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Conversational AI</h3>
      <p className="text-gray-600 text-sm">
        Ask questions in natural language and get precise answers with source references and confidence scores.
      </p>
    </div>
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
        <Mic className="h-6 w-6 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Voice Interaction</h3>
      <p className="text-gray-600 text-sm">
        Enable hands-free operation with voice commands and audio responses for seamless workflow integration.
      </p>
    </div>
  </div>
);

export default FeatureHighlights;
