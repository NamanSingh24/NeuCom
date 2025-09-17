import { AlertCircle, Loader2, MessageSquare, Mic, MicOff, Send, Trash2, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import voiceManager from '../../utils/voiceManager';
import FormattedMessage from './FormattedMessage';

const DEFAULT_VOICE_PRESETS = [
  { id: 'nova', name: 'Nova (Warm US)', description: 'Balanced North American delivery' },
  { id: 'alloy', name: 'Alloy (Bright UK)', description: 'Crisp British tone' },
  { id: 'echo', name: 'Echo (RP)', description: 'Neutral Received Pronunciation' },
  { id: 'fable', name: 'Fable (Midlands)', description: 'Engaging Midlands accent' },
  { id: 'onyx', name: 'Onyx (Scottish)', description: 'Confident Scottish cadence' },
  { id: 'shimmer', name: 'Shimmer (Caribbean)', description: 'Energetic Caribbean style' }
];

const ChatArea = ({
  isVoiceMode,
  setIsVoiceMode,
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading,
  clearMessages
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [voiceSupport, setVoiceSupport] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE_PRESETS[0].id);
  const [voiceSpeed, setVoiceSpeed] = useState(0.9);
  const [availableVoices, setAvailableVoices] = useState(DEFAULT_VOICE_PRESETS);
  const [usingBrowserVoices, setUsingBrowserVoices] = useState(false);

  useEffect(() => {
    // Check voice support on component mount
    const support = voiceManager.isVoiceSupported();
    setVoiceSupport(support);
    
    if (!support.recording && isVoiceMode) {
      setVoiceError('Voice recording is not supported in this browser');
    }
  }, [isVoiceMode]);

  useEffect(() => {
    let isMounted = true;

    const loadVoices = async () => {
      try {
        const browserVoiceOptions = await voiceManager.getBrowserPresetVoices(DEFAULT_VOICE_PRESETS);
        const usableBrowserVoices = browserVoiceOptions.filter(option => option.voiceName);

        if (isMounted && usableBrowserVoices.length) {
          setAvailableVoices(browserVoiceOptions);
          setUsingBrowserVoices(true);
          setSelectedVoice(prev => (
            browserVoiceOptions.some(voice => voice.id === prev)
              ? prev
              : browserVoiceOptions[0].id
          ));
          return;
        }
      } catch (browserError) {
        console.warn('Browser voices unavailable, falling back to backend voices.', browserError);
      }

      try {
        const response = await apiService.getAvailableVoices();
        const voices = response?.voices || [];

        if (!isMounted || !voices.length) {
          return;
        }

        setAvailableVoices(voices);
        setUsingBrowserVoices(false);
        setSelectedVoice(prev => (
          voices.some(voice => voice.id === prev)
            ? prev
            : voices[0].id
        ));
      } catch (error) {
        console.error('Failed to load available voices:', error);
        if (isMounted) {
          setVoiceError('Unable to load enhanced voice presets; using default voice.');
          setAvailableVoices(DEFAULT_VOICE_PRESETS);
          setSelectedVoice(prev => prev || DEFAULT_VOICE_PRESETS[0].id);
          setUsingBrowserVoices(false);
        }
      }
    };

    loadVoices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-synthesize new AI responses when voice is enabled
  useEffect(() => {
    if (!voiceEnabled || messages.length === 0) return;
    
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && 
        (latestMessage.sender === 'ai' || latestMessage.sender === 'assistant') && 
        !latestMessage.isError &&
        latestMessage.text) {
      // Small delay to ensure UI is updated
      setTimeout(() => {
        synthesizeResponse(latestMessage.text);
      }, 300);
    }
  }, [messages, voiceEnabled]);

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
      voiceManager.stopSpeaking();
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
      handleSendWithVoice();
    }
  };

  // Voice synthesis for AI responses
  const synthesizeResponse = async (text) => {
    if (!voiceEnabled || !text) return;
    
    let startedBackendPlayback = false;

    try {
      setVoiceError(null);

      if (usingBrowserVoices) {
        setIsSpeaking(true);
        try {
          const played = await voiceManager.playWithBrowserVoice(text, selectedVoice, voiceSpeed);
          setIsSpeaking(false);
          if (played) {
            setCurrentAudio(null);
            return;
          }
        } catch (browserError) {
          console.warn('Browser speech synthesis failed, falling back to backend TTS.', browserError);
          setIsSpeaking(false);
        }
      }

      // Stop any currently playing backend audio before starting a new clip
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      console.log('Synthesizing speech for:', text.substring(0, 50) + '...');
      const audioBlob = await apiService.synthesizeSpeech(text, selectedVoice, voiceSpeed);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      startedBackendPlayback = true;
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };

      audio.onerror = (error) => {
        setIsSpeaking(false);
        console.error('Audio playback failed:', error);
        setVoiceError('Audio playback failed');
        setCurrentAudio(null);
      };

      await audio.play();
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      setIsSpeaking(false);
      setVoiceError('Speech synthesis failed: ' + error.message);
      setCurrentAudio(null);
    }
    finally {
      if (!startedBackendPlayback) {
        setIsSpeaking(false);
      }
    }
  };

  // Stop current speech
  const stopSpeech = () => {
    voiceManager.stopSpeaking();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  };

  // Enhanced send message with voice synthesis
  const handleSendWithVoice = async () => {
    await handleSendMessage();
    // Voice synthesis is now handled by useEffect
  };

  // Clear conversation
  const handleClearConversation = () => {
    if (currentAudio) {
      stopSpeech();
    }
    if (clearMessages) {
      clearMessages();
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
          <h1 className="text-2xl font-bold text-gray-800">SOP Assistant</h1>
          <p className="text-gray-600 mt-1">Ask questions about your uploaded procedures</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleVoiceModeToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
              isVoiceMode 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-indigo-200'
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
        <div className="flex items-center justify-center space-x-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-indigo-700">
              {isRecording ? 'Recording...' : isTranscribing ? 'Processing...' : 'Ready to listen'}
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-[600px] flex flex-col">
        {/* Header with voice controls and clear button */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">SOP Chat Assistant</h3>
            
            {/* Voice Response Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors shadow-sm ${
                  voiceEnabled 
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
                title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>
              
              {/* Voice Settings */}
              {voiceEnabled && (
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
                    title="Select voice"
                  >
                    {availableVoices.map(voice => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                  <span className="hidden sm:block text-[11px] text-gray-500 max-w-[160px]">
                    {availableVoices.find(voice => voice.id === selectedVoice)?.description || 'Voice preset'}
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={voiceSpeed}
                    onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                    className="w-16 h-1"
                    title={`Speed: ${voiceSpeed}x`}
                  />
                  <span className="text-xs text-gray-500">{voiceSpeed}x</span>
                </div>
              )}
              
              {/* Stop Speech Button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeech}
                  className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
                  title="Stop speech"
                >
                  <VolumeX className="h-3 w-3" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Clear Conversation Button */}
          <button
            onClick={handleClearConversation}
            disabled={isLoading || isRecording || isTranscribing}
            className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm font-medium">Clear</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2 text-gray-700">Start a conversation</h3>
              <p className="text-sm text-gray-600">Ask questions about your SOP documents and get instant, accurate answers.</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                <button 
                  onClick={() => setInputMessage("What are the emergency procedures?")}
                  className="p-3 text-left bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-sm text-gray-700 border border-indigo-100"
                >
                  "What are the emergency procedures?"
                </button>
                <button 
                  onClick={() => setInputMessage("Show me safety guidelines")}
                  className="p-3 text-left bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors text-sm text-gray-700 border border-emerald-100"
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
                  className={`${
                    message.sender === 'user' 
                      ? 'max-w-xs lg:max-w-md' 
                      : 'max-w-md lg:max-w-2xl'
                  } px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : message.isError
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800 shadow-sm'
                  }`}
                >
                  {message.sender === 'user' ? (
                    // User message - simple text display
                    <div>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs mt-1 text-blue-100">
                        {message.timestamp}
                      </p>
                    </div>
                  ) : (
                    // AI message - with FormattedMessage component
                    <div>
                      <FormattedMessage message={message} />
                      <p className="text-xs mt-1 text-gray-500">
                        {message.timestamp}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-lg flex items-center space-x-2 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-sm text-gray-700">AI is thinking...</span>
              </div>
            </div>
          )}
          {isTranscribing && (
            <div className="flex justify-end">
              <div className="bg-indigo-100 px-4 py-3 rounded-lg flex items-center space-x-2 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-sm text-indigo-700">Transcribing audio...</span>
              </div>
            </div>
          )}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="bg-emerald-100 px-4 py-3 rounded-lg flex items-center space-x-2 shadow-sm">
                <Volume2 className="h-4 w-4 animate-pulse text-emerald-600" />
                <span className="text-sm text-emerald-700">Speaking response...</span>
                <button
                  onClick={stopSpeech}
                  className="ml-2 text-emerald-600 hover:text-emerald-800"
                  title="Stop speech"
                >
                  <VolumeX className="h-3 w-3" />
                </button>
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
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm bg-white text-gray-800"
            disabled={isLoading || isRecording || isTranscribing}
          />
          {isVoiceMode && (
            <button
              onClick={handleMicButtonClick}
              disabled={isLoading || isTranscribing}
              className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors border-2 shadow-sm ${
                isRecording 
                  ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
                  : 'bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50'
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
            onClick={handleSendWithVoice}
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
