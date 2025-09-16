import React, { useState } from 'react';
import {
  Search,
  Filter,
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  MoreVertical,
  Edit,
  Share,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

const DocumentsArea = ({ uploadedFiles = [], onUploadNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // table or grid
  const [selectedDocs, setSelectedDocs] = useState([]);

  // Filter and sort documents
  const filteredDocuments = uploadedFiles
    .filter(doc => {
      const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default: // date
          comparison = new Date(a.uploaded_at || 0) - new Date(b.uploaded_at || 0);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Bulk action handlers
  const handleDownloadSelected = () => {
    if (selectedDocs.length === 0) return;
    
    selectedDocs.forEach(docId => {
      const doc = uploadedFiles.find(d => d.id === docId);
      if (doc) {
        // Create a download link
        const link = document.createElement('a');
        link.href = doc.url || '#';
        link.download = doc.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedDocs.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedDocs.length} document(s)?`)) {
      // In a real app, this would call an API to delete the documents
      console.log('Deleting documents:', selectedDocs);
      setSelectedDocs([]);
    }
  };

  // Pagination handlers
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments.map(doc => doc.id || doc.name));
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Document Management</h1>
          <p className="text-gray-600 mt-1">Manage your SOP documents and monitor processing status</p>
        </div>
        <button
          onClick={onUploadNew}
          className="btn-corporate flex items-center space-x-2"
          style={{ color: '#ffffff' }}
        >
          <Plus className="h-4 w-4 text-white" />
          <span className="text-white">Upload Document</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Documents</p>
              <p className="text-2xl font-bold text-gray-800">{uploadedFiles.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Processed</p>
              <p className="text-2xl font-bold text-emerald-600">
                {uploadedFiles.filter(doc => doc.status === 'processed').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="card-corporate p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Processing</p>
              <p className="text-2xl font-bold text-blue-600">
                {uploadedFiles.filter(doc => doc.status === 'processing').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <RefreshCw className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card-corporate p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatFileSize(uploadedFiles.reduce((sum, doc) => sum + (doc.size || 0), 0))}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card-corporate p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="status">Sort by Status</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                className={`px-3 py-2 text-sm transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                className={`px-3 py-2 text-sm border-l border-gray-300 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedDocs.length > 0 && (
        <div className="card-corporate p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium">
              {selectedDocs.length} document(s) selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleDownloadSelected}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Content */}
      {viewMode === 'table' ? (
        <div className="card-corporate overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      onClick={() => toggleSort('name')}
                    >
                      <span>Document</span>
                      {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      onClick={() => toggleSort('status')}
                    >
                      <span>Status</span>
                      {sortBy === 'status' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      onClick={() => toggleSort('size')}
                    >
                      <span>Size</span>
                      {sortBy === 'size' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chunks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      onClick={() => toggleSort('date')}
                    >
                      <span>Uploaded</span>
                      {sortBy === 'date' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc, index) => (
                  <tr key={doc.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        checked={selectedDocs.includes(doc.id || doc.name)}
                        onChange={() => handleSelectDoc(doc.id || doc.name)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.type || 'PDF Document'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(doc.status)}`}>
                          {doc.status || 'pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{formatFileSize(doc.size)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{doc.chunks_created || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(doc.uploaded_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {/* Dropdown would be implemented here */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                  <p className="text-gray-600 mt-1">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by uploading your first document.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc, index) => (
            <div key={doc.id || index} className="card-corporate p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-medium text-sm mb-2 text-gray-900 line-clamp-2">{doc.name}</h3>
              
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(doc.status)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(doc.status)}`}>
                  {doc.status || 'pending'}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div>Size: {formatFileSize(doc.size)}</div>
                <div>Chunks: {doc.chunks_created || 'N/A'}</div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(doc.uploaded_at)}</span>
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={selectedDocs.includes(doc.id || doc.name)}
                  onChange={() => handleSelectDoc(doc.id || doc.name)}
                />
              </div>
            </div>
          ))}

          {/* Empty State for Grid */}
          {filteredDocuments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
                  <p className="text-gray-600 mt-1">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by uploading your first document.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredDocuments.length > 12 && (
        <div className="flex justify-center">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm transition-colors ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              « Previous
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white border-l border-gray-300">
              {currentPage}
            </button>
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm border-l border-gray-300 transition-colors ${
                currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsArea;
