import React, { useState, useEffect } from 'react';
import { MessageSquare, Mic, MicOff, Loader2, Send, AlertCircle } from 'lucide-react';
import voiceManager from '../../utils/voiceManager';

const ChatArea = ({
  isVoiceMode,
  setIsVoiceMode,
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [voiceSupport, setVoiceSupport] = useState(null);

  useEffect(() => {
    // Check voice support on component mount
    const support = voiceManager.isVoiceSupported();
    setVoiceSupport(support);
    
    if (!support.recording && isVoiceMode) {
      setVoiceError('Voice recording is not supported in this browser');
    }
  }, [isVoiceMode]);

  const handleVoiceModeToggle = async () => {
    if (!isVoiceMode) {
      // Turning voice mode on
      try {
        await voiceManager.requestMicrophonePermission();
        setVoiceError(null);
        setIsVoiceMode(true);
      } catch (error) {
        setVoiceError(error.message);
        setIsVoiceMode(false);
      }
    } else {
      // Turning voice mode off
      if (isRecording) {
        try {
          await voiceManager.stopRecording();
        } catch (error) {
          console.error('Error stopping recording:', error);
        }
      }
      setIsVoiceMode(false);
      resetVoiceState();
    }
  };

  const startRecording = async () => {
    try {
      setVoiceError(null);
      setIsRecording(true);
      await voiceManager.startRecording();
    } catch (error) {
      console.error('Recording start error:', error);
      setVoiceError(`Recording failed: ${error.message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsTranscribing(true);
      
      const audioBlob = await voiceManager.stopRecording();
      const transcriptionResult = await voiceManager.transcribeAudio(audioBlob);
      
      if (transcriptionResult.transcription) {
        setInputMessage(transcriptionResult.transcription);
        // Don't auto-send - let user review and send manually
      } else if (transcriptionResult.error) {
        setVoiceError(transcriptionResult.error);
      } else {
        setVoiceError('No speech detected. Please try again.');
      }
    } catch (error) {
      console.error('Recording stop error:', error);
      setVoiceError(`Transcription failed: ${error.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Reset voice mode state when turning off
  const resetVoiceState = () => {
    setIsRecording(false);
    setIsTranscribing(false);
    setVoiceError(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && !isRecording && !isTranscribing) {
      handleSendMessage();
    }
  };

  const handleMicButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOP Assistant</h1>
          <p className="text-gray-600 mt-1">Ask questions about your uploaded procedures</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleVoiceModeToggle}
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
      </div>

      {/* Voice Error Display */}
      {voiceError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Voice Error</h4>
              <p className="text-sm text-red-700 mt-1">{voiceError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Voice Status Indicators */}
      {isVoiceMode && (
        <div className="flex items-center justify-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-blue-700">
              {isRecording ? 'Recording...' : isTranscribing ? 'Processing...' : 'Ready to listen'}
            </span>
          </div>
        </div>
      )}

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
          {isTranscribing && (
            <div className="flex justify-end">
              <div className="bg-blue-100 px-4 py-3 rounded-lg flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-600">Transcribing audio...</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-2 border-t pt-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isVoiceMode ? "Speak or type your question..." : "Ask about SOP procedures..."}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading || isRecording || isTranscribing}
          />
          {isVoiceMode && (
            <button
              onClick={handleMicButtonClick}
              disabled={isLoading || isTranscribing}
              className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors border-2 ${
                isRecording 
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                  : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <MicOff className="h-4 w-4" />
                </div>
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim() || isRecording || isTranscribing}
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
};

export default ChatArea;
