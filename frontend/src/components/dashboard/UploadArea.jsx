import React from 'react';
import { Upload, Shield, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

const UploadArea = ({ fileInputRef, handleFileUpload, uploadProgress, uploadedFiles, removeUploadedFile }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload SOP Documents</h1>
        <p className="text-gray-600 mt-1">Add new Standard Operating Procedures to your knowledge base</p>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Shield className="h-4 w-4" />
        <span>Secure & Encrypted</span>
      </div>
    </div>
    <div className="card-corporate p-8">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center flex-col justify-center items-center hover:border-blue-400 transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4 group-hover:text-blue-500 transition-colors" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload SOP Documents</h3>
        <p className="text-gray-600 mb-4">
          Drag and drop your files here, or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Supports PDF, DOCX, and Markdown files up to 10MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.md"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button className="btn-corporate px-6 py-3">
          <div className='flex items-center justify-center'>
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </div>
        </button>
      </div>
    </div>
    {Object.keys(uploadProgress).length > 0 && (
      <div className="card-corporate p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Progress</h2>
        <div className="space-y-3">
          {Object.entries(uploadProgress).map(([fileId, { file, progress, status }]) => (
            <div key={fileId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right">
                {status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                {status === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    {uploadedFiles.length > 0 && (
      <div className="card-corporate p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Processed Documents</h2>
          <span className="text-sm text-gray-500">{uploadedFiles.length} documents</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {file.chunks_created && <span>{file.chunks_created} chunks</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {file.processed ? 'Processed' : 'Processing...'}
                </span>
                <button 
                  onClick={() => removeUploadedFile(file.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    <div className="card-corporate p-6">
      <h2 className="text-lg font-semibold mb-4">Supported File Formats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
            <FileText className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium text-red-800">PDF Documents</p>
            <p className="text-xs text-red-600">Portable Document Format</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-800">Word Documents</p>
            <p className="text-xs text-blue-600">Microsoft Word (.docx)</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <FileText className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Markdown</p>
            <p className="text-xs text-green-600">Markdown (.md) files</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default UploadArea;
