import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Brain, Clock, Database, FileText, Home, MessageSquare, Settings, TrendingUp, Upload } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import AnalyticsArea from '../components/dashboard/AnalyticsArea';
import ChatArea from '../components/dashboard/ChatArea';
import ChatEnhancementPanel from '../components/dashboard/ChatEnhancementPanel';
import DocumentsArea from '../components/dashboard/DocumentsArea';
import FeatureHighlights from '../components/dashboard/FeatureHighlights';
import KnowledgeGraphPanel from '../components/dashboard/KnowledgeGraphPanel';
import KnowledgeGraphSetup from '../components/dashboard/KnowledgeGraphSetup';
import ProfileArea from '../components/dashboard/ProfileArea';
import RecentActivity from '../components/dashboard/RecentActivity';
import SettingsArea from '../components/dashboard/SettingsArea';
import Sidebar from '../components/dashboard/Sidebar';
import StatsGrid from '../components/dashboard/StatsGrid';
import UploadArea from '../components/dashboard/UploadArea';
import apiService from '../services/api';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [contextFilter, setContextFilter] = useState(null);
  const [documents, setDocuments] = useState([]);
  const fileInputRef = useRef(null);

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload SOP', icon: Upload },
    { id: 'chat', label: 'SOP Assistant', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await apiService.getDocuments();
      setDocuments(docs.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    for (const file of files) {
      const fileId = Date.now() + Math.random();
      setUploadProgress(prev => ({ ...prev, [fileId]: { file, progress: 0, status: 'uploading' } }));
      try {
        const response = await apiService.uploadDocument(file);
        setUploadedFiles(prev => [...prev, { ...file, id: fileId, processed: true, ...response }]);
        setUploadProgress(prev => ({ ...prev, [fileId]: { file, progress: 100, status: 'completed' } }));
        // Reload documents after successful upload
        loadDocuments();
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => ({ ...prev, [fileId]: { file, progress: 0, status: 'error' } }));
      }
    }
    setTimeout(() => {
      setUploadProgress({});
    }, 3000);
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;
    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      // Use advanced query with context filter if available
      const response = contextFilter 
        ? await apiService.queryDocumentAdvanced(textToSend, { 
            voiceEnabled: isVoiceMode, 
            contextFilter 
          })
        : await apiService.queryDocument(textToSend, isVoiceMode);
        
      const aiMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        sources: response.sources,
        confidence: response.confidence,
        intent: response.intent,
        usage: response.usage
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Query error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Clear messages function
  const clearMessages = () => {
    setMessages([]);
  };

  const stats = [
    { 
      title: 'Documents Processed', 
      value: uploadedFiles.length.toString(), 
      change: '+12%', 
      icon: FileText, 
      color: 'text-indigo-600' 
    },
    { 
      title: 'Conversation Length', 
      value: messages.length.toString(), 
      change: '+8%', 
      icon: MessageSquare, 
      color: 'text-emerald-600' 
    },
    { 
      title: 'Response Time', 
      value: '1.2s', 
      change: '-15%', 
      icon: Clock, 
      color: 'text-violet-600' 
    },
    { 
      title: 'Supported Formats', 
      value: '4', 
      change: 'stable', 
      icon: TrendingUp, 
      color: 'text-amber-600' 
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="relative max-w-2xl">
                <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Neucom</h1>
                <p className="text-blue-100 text-lg mb-6">
                  Your intelligent assistant for Standard Operating Procedures. Upload documents, ask questions, and get instant, accurate guidance powered by AI.
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
                  >
                    Upload Documents
                  </button>
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border border-blue-400 shadow-md"
                  >
                    Start Chatting
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <Brain className="h-[90%] w-full" />
              </div>
            </div>
            <StatsGrid stats={stats} />
            <div className="grid grid-cols-1 gap-6">
              <FeatureHighlights />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <RecentActivity uploadedFiles={uploadedFiles} />
            </div>
          </div>
        );
      case 'upload':
        return (
          <UploadArea
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            uploadProgress={uploadProgress}
            uploadedFiles={uploadedFiles}
            removeUploadedFile={removeUploadedFile}
          />
        );
      case 'chat':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ChatArea
                isVoiceMode={isVoiceMode}
                setIsVoiceMode={setIsVoiceMode}
                messages={messages}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
                clearMessages={clearMessages}
              />
            </div>
            <div>
              <ChatEnhancementPanel 
                onQueryChange={setInputMessage}
                onContextFilterChange={setContextFilter}
              />
            </div>
          </div>
        );
      case 'documents':
        return (
          <DocumentsArea
            uploadedFiles={documents}
            onUploadNew={() => setActiveTab('upload')}
          />
        );
      case 'knowledge':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KnowledgeGraphSetup />
            <KnowledgeGraphPanel 
              documents={documents}
            />
          </div>
        );
      case 'analytics':
        return (
          <AnalyticsArea
            uploadedFiles={uploadedFiles}
            messages={messages}
          />
        );
      case 'settings':
        return <SettingsArea />;
      case 'profile':
        return <ProfileArea />;
      default:
        return (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600">This feature is coming soon. Stay tuned for updates!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar className="" sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-16 p-8 transition-all duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardPage;
