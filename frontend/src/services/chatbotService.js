import api from './api';

export const chatbotService = {
  sendMessage: (message, conversationHistory = []) => {
    return api.post('/chat/message', { message, conversationHistory });
  },
  getQuickPrompts: () => [
    'Find a cardiologist',
    'When is Dr. Arun Sharma available?',
    'What are the hospital visiting hours?',
    'Show my upcoming appointments'
  ]
};

export default chatbotService;
