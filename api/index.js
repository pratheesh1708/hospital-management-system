const app = require('../backend/app');
const db = require('../backend/config/database');

let isInitialized = false;

module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await db.initDatabase();
      isInitialized = true;
    } catch (err) {
      console.warn('Serverless DB initialization warning:', err.message);
    }
  }
  return app(req, res);
};
