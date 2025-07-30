import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Document upload
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Query SOP
  queryDocument: async (query, voiceMode = false) => {
    const response = await api.post('/query', {
      query,
      voice_mode: voiceMode,
    });
    return response.data;
  },

  // Voice endpoints
  uploadVoiceAudio: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'recording.webm');
    
    const response = await api.post('/voice/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  synthesizeSpeech: async (text, voiceId = 'alloy', speed = 1.0) => {
    const response = await api.post(`/voice/synthesize?voice_id=${voiceId}&speed=${speed}`, 
      JSON.stringify(text), {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob'
    });
    return response.data;
  },

  // Get system stats
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Start voice interaction
  startVoiceInteraction: async () => {
    const response = await api.post('/voice-interaction');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return { status: 'healthy', ...response.data };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },
};

export default apiService;
