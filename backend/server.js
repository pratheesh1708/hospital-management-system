const app = require('./app');
const config = require('./config/environment');
const db = require('./config/database');
const appointmentReminderJob = require('./jobs/appointmentReminderJob');

async function startServer() {
  try {
    // 1. Initialize Database Connection Pool
    await db.initDatabase();
    console.log(`📡 Database layer connected (Engine: ${db.getActiveEngine()})`);

    // 2. Start HTTP Server
    const server = app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`🏥 St. Jude Hospital Management System Backend`);
      console.log(`🚀 Running at: http://localhost:${config.port}`);
      console.log(`🔒 Security: HttpOnly Cookies, Bcrypt, Helmet, CORS, RBAC`);
      console.log(`🤖 AI Chatbot: Active with controlled tool execution`);
      console.log(`======================================================\n`);
    });

    // 3. Schedule periodic appointment reminder runner (every 6 hours)
    appointmentReminderJob.runDailyReminders();
    setInterval(() => {
      appointmentReminderJob.runDailyReminders();
    }, 6 * 60 * 60 * 1000);

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Closing HTTP server and database pool.');
      server.close(() => {
        process.exit(0);
      });
    });

    return server;
  } catch (err) {
    console.error('Fatal Server Initialization Error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
