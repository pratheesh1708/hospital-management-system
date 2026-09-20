const appointmentModel = require('../models/appointmentModel');
const emailQueue = require('../queues/emailQueue');

const appointmentReminderJob = {
  async runDailyReminders() {
    try {
      // Calculate target date: 24 hours ahead (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const targetDate = tomorrow.toISOString().split('T')[0];

      const pending = await appointmentModel.getUpcomingReminders(targetDate);
      console.log(`⏰ [Reminder Job] Found ${pending.length} appointments scheduled for ${targetDate}`);

      for (const appt of pending) {
        emailQueue.add('appointment_reminder', {
          to: appt.patient_email,
          patientName: appt.patient_name,
          doctorName: appt.doctor_name,
          specialization: appt.specialization_name,
          date: appt.appointment_date,
          time: appt.start_time
        });

        await appointmentModel.markReminderSent(appt.appointment_id);
      }
    } catch (err) {
      console.error('Error running appointment reminder job:', err.message);
    }
  }
};

module.exports = appointmentReminderJob;
