const PRESET_VOICE_HINTS = {
  nova: [
    { nameIncludes: ['Google US English'], langPrefix: 'en-US' },
    { nameIncludes: ['Microsoft Aria', 'Microsoft Jenny'], langPrefix: 'en-US' },
    { langPrefix: 'en-US' }
  ],
  alloy: [
    { nameIncludes: ['Google UK English Male', 'Microsoft Ryan'], langPrefix: 'en-GB' },
    { langPrefix: 'en-GB' }
  ],
  echo: [
    { nameIncludes: ['Google UK English Female', 'Microsoft Sonia'], langPrefix: 'en-GB' },
    { langPrefix: 'en-GB' }
  ],
  fable: [
    { nameIncludes: ['Microsoft Libby'], langPrefix: 'en-GB' },
    { langPrefix: 'en-GB' }
  ],
  onyx: [
    { nameIncludes: ['Microsoft Hamish'], langPrefix: 'en-GB' },
    { langPrefix: 'en-GB' }
  ],
  shimmer: [
    { nameIncludes: ['Google UK English Female', 'Microsoft Abigail'], langPrefix: 'en-GB' },
    { langPrefix: 'en-GB' }
  ]
};

class VoiceManager {
  constructor() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recognition = null;
    this.speechSynthesis = window.speechSynthesis;
    this.currentUtterance = null;
    this.currentAudio = null; // Track current audio element
    this.cachedSpeechVoices = [];
    this.voicesLoadedPromise = null;
    
    // Initialize Web Speech API if available
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      console.log('Speech recognition initialized');
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream as we just needed permission
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      throw new Error('Microphone permission is required for voice functionality');
    }
  }

  async startRecording() {
    try {
      if (this.isRecording) {
        console.warn('Already recording');
        return;
      }

      await this.requestMicrophonePermission();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('Recording started');
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this.mediaRecorder) {
        reject(new Error('Not currently recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          
          // Stop all tracks
          if (this.mediaRecorder.stream) {
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
          }
          
          this.isRecording = false;
          this.mediaRecorder = null;
          
          console.log('Recording stopped, audio blob size:', audioBlob.size);
          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  async transcribeAudio(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      const response = await fetch('http://localhost:8000/voice/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  async synthesizeSpeech(text, voiceId = 'nova', speed = 1.0) {
    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid text input');
      }

      // Send as query parameters since FastAPI expects them that way
      const params = new URLSearchParams({
        text: text,
        voice_id: voiceId,
        speed: speed.toString()
      });

      const response = await fetch(`http://localhost:8000/voice/synthesize?${params}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      // Fallback to browser TTS
      return this.fallbackTextToSpeech(text, speed);
    }
  }

  fallbackTextToSpeech(text, speed = 1.0) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.speechSynthesis) {
          reject(new Error('Speech synthesis not supported'));
          return;
        }

        // Stop any current speech
        this.stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.5, Math.min(2.0, speed)); // Clamp speed
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Try to use the most natural-sounding voice available
        const voices = this.speechSynthesis.getVoices();
        
        // Priority order for natural voices
        const preferredVoices = [
          // High-quality Google voices
          'Google US English',
          'Google UK English Female',
          'Google UK English Male',
          // Microsoft voices
          'Microsoft Zira Desktop',
          'Microsoft David Desktop',
          'Microsoft Mark',
          // Apple voices (on Safari)
          'Alex',
          'Samantha',
          'Victoria',
          // Any English voice
          voices.find(v => v.lang === 'en-US'),
          voices.find(v => v.lang.startsWith('en')),
          // Fallback to first available
          voices[0]
        ];
        
        // Find the first available preferred voice
        let selectedVoice = null;
        for (const voiceName of preferredVoices) {
          if (typeof voiceName === 'string') {
            selectedVoice = voices.find(v => v.name === voiceName);
          } else if (voiceName) {
            selectedVoice = voiceName;
          }
          if (selectedVoice) break;
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('Using voice:', selectedVoice.name);
        }

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };

        utterance.onerror = (error) => {
          this.currentUtterance = null;
          reject(error);
        };

        this.currentUtterance = utterance;
        this.speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  async playAudio(audioBlob) {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        this.stopSpeaking();
        
        const audio = new Audio();
        const url = URL.createObjectURL(audioBlob);
        
        audio.src = url;
        this.currentAudio = audio; // Track the current audio element
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
          this.currentAudio = null;
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(url);
          this.currentAudio = null;
          reject(error);
        };
        
        audio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  async loadBrowserVoices() {
    if (!this.speechSynthesis) {
      return [];
    }

    if (this.cachedSpeechVoices.length) {
      return this.cachedSpeechVoices;
    }

    if (!this.voicesLoadedPromise) {
      this.voicesLoadedPromise = new Promise((resolve) => {
        const resolveAndCleanup = (voices, handler, timeoutId) => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          if (handler) {
            this.speechSynthesis.removeEventListener('voiceschanged', handler);
          }
          this.cachedSpeechVoices = voices || [];
          resolve(this.cachedSpeechVoices);
        };

        const immediateVoices = this.speechSynthesis.getVoices();
        if (immediateVoices && immediateVoices.length) {
          resolveAndCleanup(immediateVoices);
          return;
        }

        const handler = () => {
          const loaded = this.speechSynthesis.getVoices();
          resolveAndCleanup(loaded, handler, timeoutId);
        };

        this.speechSynthesis.addEventListener('voiceschanged', handler);

        const timeoutId = setTimeout(() => {
          const fallback = this.speechSynthesis.getVoices();
          if (fallback && fallback.length) {
            resolveAndCleanup(fallback, handler, timeoutId);
          } else {
            resolveAndCleanup([], handler, timeoutId);
          }
        }, 1800);
      });
    }

    return this.voicesLoadedPromise;
  }

  resolveBrowserVoice(presetId, voices) {
    if (!voices || !voices.length) {
      return null;
    }

    const hints = PRESET_VOICE_HINTS[presetId] || [];
    for (const hint of hints) {
      const match = voices.find((voice) => {
        const matchesName = hint.nameIncludes
          ? hint.nameIncludes.some(fragment => voice.name.toLowerCase().includes(fragment.toLowerCase()))
          : true;
        const matchesLang = hint.langPrefix
          ? voice.lang && voice.lang.toLowerCase().startsWith(hint.langPrefix.toLowerCase())
          : true;
        return matchesName && matchesLang;
      });
      if (match) {
        return match;
      }
    }

    // Fallback: try by language family, then first voice
    if (presetId === 'nova') {
      const usVoice = voices.find(voice => voice.lang && voice.lang.startsWith('en-US'));
      if (usVoice) {
        return usVoice;
      }
    }

    const genericVoice = voices.find(voice => voice.lang && voice.lang.startsWith('en'));
    return genericVoice || voices[0];
  }

  async getBrowserPresetVoices(presetDefinitions) {
    const voices = await this.loadBrowserVoices();
    if (!voices.length) {
      return [];
    }

    return presetDefinitions.map((preset) => {
      const resolvedVoice = this.resolveBrowserVoice(preset.id, voices);
      return {
        id: preset.id,
        name: resolvedVoice ? `${preset.name} (${resolvedVoice.name})` : preset.name,
        description: preset.description,
        origin: 'browser',
        voiceName: resolvedVoice ? resolvedVoice.name : null,
        lang: resolvedVoice ? resolvedVoice.lang : null
      };
    });
  }

  async playWithBrowserVoice(text, presetId, speed = 1.0) {
    if (!this.speechSynthesis) {
      return false;
    }

    const voices = await this.loadBrowserVoices();
    if (!voices.length) {
      return false;
    }

    return new Promise((resolve, reject) => {
      try {
        const voice = this.resolveBrowserVoice(presetId, voices);
        if (!voice) {
          resolve(false);
          return;
        }

        this.stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = speed;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          this.currentUtterance = null;
          resolve(true);
        };

        utterance.onerror = (error) => {
          this.currentUtterance = null;
          console.error('Browser speech synthesis failed:', error);
          reject(error.error || error);
        };

        this.currentUtterance = utterance;
        this.speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  stopSpeaking() {
    // Stop speech synthesis
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    
    // Stop audio playback
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isSpeaking() {
    return this.speechSynthesis && this.speechSynthesis.speaking;
  }

  // Quick speech recognition using Web Speech API (fallback)
  async quickSpeechToText(onResult, onError) {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      this.recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        onResult && onResult(result);
        resolve(result);
      };

      this.recognition.onerror = (error) => {
        onError && onError(error);
        reject(error);
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
      };

      this.recognition.start();
    });
  }

  // Check if voice features are supported
  isVoiceSupported() {
    return {
      recording: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      speechSynthesis: !!window.speechSynthesis,
      mediaRecorder: !!window.MediaRecorder
    };
  }
}

export default new VoiceManager();
