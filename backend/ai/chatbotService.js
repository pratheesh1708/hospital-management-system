const doctorTools = require('./tools/doctorTools');
const availabilityTools = require('./tools/availabilityTools');
const appointmentTools = require('./tools/appointmentTools');
const faqTools = require('./tools/faqTools');
const systemPrompt = require('./systemPrompt');

const chatbotService = {
  async processMessage({ message, history = [], user = null }) {
    const text = message.trim();
    const lower = text.toLowerCase();

    // 1. Strict Medical Safety & Diagnostic Guardrail
    const diagnosticTriggers = [
      'what disease', 'diagnose me', 'do i have cancer', 'what illness',
      'what condition', 'prescribe me', 'which medicine should i take',
      'give me medication', 'what drug should i take', 'am i sick',
      'cure for', 'diagnose my symptoms'
    ];

    const isMedicalQuery = diagnosticTriggers.some(trigger => lower.includes(trigger));
    if (isMedicalQuery) {
      return {
        reply: `⚠️ **Medical Safety Advisory**: As an AI clinical receptionist, I cannot diagnose medical conditions or prescribe medications. Proper diagnosis requires an in-person physical assessment and diagnostic tests by a licensed physician.\n\nWould you like me to help you schedule a consultation with one of our specialized physicians in **Cardiology**, **Neurology**, **Dermatology**, **Orthopedics**, **Pediatrics**, or **General Medicine**?`,
        suggestedActions: [
          { label: 'Find a Doctor', query: 'Show available doctors' },
          { label: 'General Medicine', query: 'Find doctors in General Medicine' },
          { label: 'Emergency Care', query: 'What are your emergency services?' }
        ]
      };
    }

    // 2. Doctor Search Intent
    if (lower.includes('doctor') || lower.includes('cardiologist') || lower.includes('dermatologist') ||
        lower.includes('neurologist') || lower.includes('orthopedic') || lower.includes('pediatrician') ||
        lower.includes('specialist')) {
      
      let spec = null;
      if (lower.includes('cardio')) spec = 'Cardiology';
      else if (lower.includes('derm')) spec = 'Dermatology';
      else if (lower.includes('neuro')) spec = 'Neurology';
      else if (lower.includes('ortho')) spec = 'Orthopedics';
      else if (lower.includes('pediat')) spec = 'Pediatrics';
      else if (lower.includes('general') || lower.includes('physician')) spec = 'General Medicine';

      const doctors = await doctorTools.findDoctors({ specialization: spec });

      if (doctors.length === 0) {
        return {
          reply: `I searched our medical staff for **${spec || 'specialists'}**, but no doctors currently match that exact filter. Would you like to view our full clinical directory?`,
          suggestedActions: [{ label: 'View All Doctors', query: 'Show all doctors' }]
        };
      }

      return {
        reply: `Here are our certified ${spec ? spec + ' specialists' : 'physicians'} available for clinical consultations:`,
        actionType: 'doctor_list',
        data: doctors,
        suggestedActions: doctors.slice(0, 3).map(d => ({
          label: `Check ${d.name.split(' ')[1] || d.name}`,
          query: `Is ${d.name} available tomorrow?`
        }))
      };
    }

    // 3. Availability Check Intent
    if (lower.includes('available') || lower.includes('availability') || lower.includes('slots') || lower.includes('schedule')) {
      // Check if a doctor name is specified
      const doctors = await doctorTools.findDoctors();
      const matchedDoctor = doctors.find(d => lower.includes(d.name.toLowerCase()) || lower.includes(d.name.toLowerCase().replace('dr. ', '')));

      let targetDate = new Date();
      if (lower.includes('tomorrow')) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      const dateStr = targetDate.toISOString().split('T')[0];

      if (matchedDoctor) {
        const avail = await availabilityTools.checkDoctorAvailability({
          doctorId: matchedDoctor.doctorId,
          date: dateStr
        });

        if (avail.availableSlotsCount === 0) {
          // Find alternative doctors in same department
          const alternatives = await doctorTools.findAlternativeDoctors({
            currentDoctorId: matchedDoctor.doctorId,
            specialization: matchedDoctor.specialization
          });

          return {
            reply: `Dr. ${matchedDoctor.name} has no remaining open slots on **${dateStr}**.\n\nHere are other experienced specialists in **${matchedDoctor.specialization}** who may have availability:`,
            actionType: 'doctor_list',
            data: alternatives
          };
        }

        return {
          reply: `**${matchedDoctor.name}** (${matchedDoctor.specialization}) has **${avail.availableSlotsCount} open slots** on ${dateStr}:`,
          actionType: 'slot_list',
          data: {
            doctor: matchedDoctor,
            date: dateStr,
            slots: avail.availableSlots
          }
        };
      } else {
        return {
          reply: 'Please tell me which doctor or medical department you are looking to check availability for.',
          suggestedActions: doctors.slice(0, 4).map(d => ({
            label: d.name,
            query: `Check availability for ${d.name}`
          }))
        };
      }
    }

    // 4. View Patient Appointments Intent
    if (lower.includes('my appointment') || lower.includes('upcoming appointment') || lower.includes('next appointment')) {
      if (!user) {
        return {
          reply: '🔒 You must be logged in to your patient account to view your scheduled appointments.',
          suggestedActions: [{ label: 'Sign In', query: 'How do I log in?' }]
        };
      }

      const appts = await appointmentTools.getPatientAppointments({ userId: user.userId });
      if (appts.error) {
        return { reply: appts.error };
      }

      if (appts.length === 0) {
        return {
          reply: 'You currently have no scheduled appointments. Would you like to book one now?',
          suggestedActions: [{ label: 'Find a Doctor', query: 'Show available doctors' }]
        };
      }

      return {
        reply: `Here are your scheduled appointments:`,
        actionType: 'appointment_list',
        data: appts
      };
    }

    // 5. Booking Intent via Chatbot
    if (lower.includes('book') || lower.includes('reserve')) {
      if (!user) {
        return {
          reply: '🔒 Please log in to complete your booking. You can browse doctors and available times freely in the meantime!',
          suggestedActions: [{ label: 'Sign In / Register', query: 'How do I log in?' }]
        };
      }

      return {
        reply: 'To book an appointment, select any available doctor or slot, or use our quick booking wizard:',
        suggestedActions: [
          { label: 'Cardiology', query: 'Find a cardiologist' },
          { label: 'General Medicine', query: 'Find doctors in General Medicine' },
          { label: 'Neurology', query: 'Find doctors in Neurology' }
        ]
      };
    }

    // 6. Hospital Policies, Visiting Hours, Insurance, Emergency FAQs
    const faq = faqTools.getHospitalFAQ({ query: text });
    return {
      reply: faq.answer,
      suggestedActions: [
        { label: 'Find a Doctor', query: 'Show available doctors' },
        { label: 'Visiting Hours', query: 'What are visiting hours?' },
        { label: 'Insurance Accepted', query: 'Do you accept health insurance?' }
      ]
    };
  }
};

module.exports = chatbotService;
