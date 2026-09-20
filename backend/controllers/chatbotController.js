const chatbotService = require('../ai/chatbotService');

const chatbotController = {
  async chat(req, res, next) {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'A message string is required.'
        });
      }

      const result = await chatbotService.processMessage({
        message,
        history: history || [],
        user: req.user || null
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = chatbotController;
