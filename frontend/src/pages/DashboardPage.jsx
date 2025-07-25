import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import StatsGrid from '../components/dashboard/StatsGrid';
import FeatureHighlights from '../components/dashboard/FeatureHighlights';
import RecentActivity from '../components/dashboard/RecentActivity';
import AISystemStatus from '../components/dashboard/AISystemStatus';
import UploadArea from '../components/dashboard/UploadArea';
import ChatArea from '../components/dashboard/ChatArea';
import DocumentsArea from '../components/dashboard/DocumentsArea';
import AnalyticsArea from '../components/dashboard/AnalyticsArea';
import apiService from '../services/api';
import { FileText, MessageSquare, Clock, TrendingUp, Upload, BarChart3, Settings, Home, Brain } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [systemStats, setSystemStats] = useState(null);
  const fileInputRef = useRef(null);

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'upload', label: 'Upload SOP', icon: Upload },
    { id: 'chat', label: 'SOP Assistant', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const stats = await apiService.getStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
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
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => ({ ...prev, [fileId]: { file, progress: 0, status: 'error' } }));
      }
    }
    setTimeout(() => {
      setUploadProgress({});
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const response = await apiService.queryDocument(inputMessage, isVoiceMode);
      const aiMessage = {
        id: Date.now() + 1,
        text: response.response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        sources: response.sources,
        confidence: response.confidence,
        intent: response.intent
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

  const stats = systemStats ? [
    { 
      title: 'Documents Processed', 
      value: systemStats.vector_db_stats?.total_documents || '0', 
      change: '+12%', 
      icon: FileText, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Conversation Length', 
      value: systemStats.conversation_length || '0', 
      change: '+8%', 
      icon: MessageSquare, 
      color: 'text-green-600' 
    },
    { 
      title: 'Response Time', 
      value: '1.2s', 
      change: '-15%', 
      icon: Clock, 
      color: 'text-purple-600' 
    },
    { 
      title: 'Supported Formats', 
      value: systemStats.supported_formats?.length || '0', 
      change: 'stable', 
      icon: TrendingUp, 
      color: 'text-orange-600' 
    },
  ] : [];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl font-bold mb-2">Welcome to SOP Interpreter</h1>
                <p className="text-blue-100 text-lg mb-6">
                  Your intelligent assistant for Standard Operating Procedures. Upload documents, ask questions, and get instant, accurate guidance powered by AI.
                </p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Upload Documents
                  </button>
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors border border-blue-400"
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
            <FeatureHighlights />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity uploadedFiles={uploadedFiles} />
              <AISystemStatus systemStats={systemStats} />
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
          <ChatArea
            isVoiceMode={isVoiceMode}
            setIsVoiceMode={setIsVoiceMode}
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        );
      case 'documents':
        return (
          <DocumentsArea
            uploadedFiles={uploadedFiles}
            onUploadNew={() => setActiveTab('upload')}
          />
        );
      case 'analytics':
        return (
          <AnalyticsArea
            systemStats={systemStats}
            uploadedFiles={uploadedFiles}
            messages={messages}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="card-corporate p-12 max-w-md mx-auto">
              {/* Brain icon background */}
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-500">This feature is coming soon. Stay tuned for updates!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-64 p-8">
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
