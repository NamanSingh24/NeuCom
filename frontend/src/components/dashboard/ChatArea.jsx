import React from 'react';
import { MessageSquare, Mic, MicOff, Loader2, Send } from 'lucide-react';

const ChatArea = ({
  isVoiceMode,
  setIsVoiceMode,
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SOP Assistant</h1>
        <p className="text-gray-600 mt-1">Ask questions about your uploaded procedures</p>
      </div>
      <button
        onClick={() => setIsVoiceMode(!isVoiceMode)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isVoiceMode 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }`}
      >
        {isVoiceMode ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        <span>{isVoiceMode ? 'Voice ON' : 'Voice Mode'}</span>
      </button>
    </div>
    <div className="card-corporate p-6 h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm">Ask questions about your SOP documents and get instant, accurate answers.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
              <button 
                onClick={() => setInputMessage("What are the emergency procedures?")}
                className="p-3 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                "What are the emergency procedures?"
              </button>
              <button 
                onClick={() => setInputMessage("Show me safety guidelines")}
                className="p-3 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                "Show me safety guidelines"
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 text-xs opacity-75">
                    <p>Sources: {message.sources.join(', ')}</p>
                    <p>Confidence: {(message.confidence * 100).toFixed(1)}%</p>
                  </div>
                )}
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex space-x-2 border-t pt-4">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder="Ask about SOP procedures..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="btn-corporate flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  </div>
);

export default ChatArea;
