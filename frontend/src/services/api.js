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

  synthesizeSpeech: async (text, voiceId = 'nova', speed = 0.9) => {
    const response = await api.post('/voice/synthesize', {}, {
      params: {
        text: text,
        voice_id: voiceId,
        speed: speed
      },
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'blob'
    });
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

  // Knowledge Graph endpoints
  getKGStatus: async () => {
    const response = await api.get('/kg/status');
    return response.data;
  },

  getEntitySteps: async (entityName) => {
    const response = await api.get(`/kg/entities/${entityName}`);
    return response.data;
  },

  getKGSOPs: async () => {
    const response = await api.get('/kg/sops');
    return response.data;
  },

  // Enhanced document management
  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  deleteDocument: async (filename) => {
    const response = await api.delete(`/documents/${filename}`);
    return response.data;
  },

  // Files endpoints
  getFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },

  // Get chunk counts for each file
  getChunks: async () => {
    const response = await api.get('/files/chunks');
    return response.data;
  },

  // Procedure management
  startProcedure: async (procedureName) => {
    const response = await api.post('/procedure/start', { 
      procedure_name: procedureName 
    });
    return response.data;
  },

  nextStep: async () => {
    const response = await api.post('/procedure/next');
    return response.data;
  },

  previousStep: async () => {
    const response = await api.post('/procedure/previous');
    return response.data;
  },

  getCurrentProcedure: async () => {
    const response = await api.get('/procedure/current');
    return response.data;
  },

  getProcedureStatus: async () => {
    const response = await api.get('/procedure/status');
    return response.data;
  },

  getAvailableProcedures: async () => {
    const response = await api.get('/procedures');
    return response.data;
  },

  // Enhanced voice features
  getAvailableVoices: async () => {
    const response = await api.get('/voice/voices');
    return response.data;
  },

  // Conversation history
  getConversationHistory: async () => {
    const response = await api.get('/conversation/history');
    return response.data;
  },

  // Enhanced query with context filter
  queryDocumentAdvanced: async (query, options = {}) => {
    const response = await api.post('/query', {
      query,
      voice_enabled: options.voiceEnabled || false,
      context_filter: options.contextFilter || null,
    });
    return response.data;
  },

  // Settings endpoints
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.post('/settings', settings);
    return response.data;
  },

  resetSettings: async () => {
    const response = await api.get('/settings/reset');
    return response.data;
  },
};

export default apiService;
