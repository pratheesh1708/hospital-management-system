const emailService = require('../services/emailService');

class AsyncEmailQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  // Non-blocking enqueue
  add(jobName, payload) {
    this.queue.push({
      id: 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: jobName,
      payload,
      createdAt: new Date()
    });

    // Schedule processing asynchronously without blocking calling thread
    setImmediate(() => this.process());
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        await this.handleJob(job);
      } catch (err) {
        console.error(`❌ Background Email Job [${job.name}] failed:`, err.message);
      }
    }

    this.isProcessing = false;
  }

  async handleJob(job) {
    const { name, payload } = job;
    switch (name) {
      case 'send_otp':
        await emailService.sendOtpEmail(payload.email, payload.otp, payload.purpose);
        break;

      case 'appointment_confirmation':
        await emailService.sendAppointmentConfirmation(payload);
        break;

      case 'appointment_reminder':
        await emailService.sendAppointmentReminder(payload);
        break;

      case 'report_notification':
        await emailService.sendReportNotification(payload);
        break;

      default:
        console.warn(`Unknown email job type: ${name}`);
    }
  }
}

const emailQueue = new AsyncEmailQueue();

module.exports = emailQueue;
