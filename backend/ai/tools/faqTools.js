const hospitalKnowledge = [
  {
    topic: 'visiting_hours',
    keywords: ['visiting', 'hours', 'visitor', 'visit', 'time'],
    answer: 'General patient visiting hours are from 08:00 AM to 08:00 PM daily. ICU and Critical Care visiting hours are restricted to 11:00 AM - 12:00 PM and 05:00 PM - 06:00 PM (maximum 2 immediate family members).'
  },
  {
    topic: 'emergency',
    keywords: ['emergency', 'ambulance', 'urgent', 'trauma', 'er'],
    answer: 'The St. Jude Emergency Department and Level-1 Trauma Care Center operate 24/7/365. For immediate life-threatening assistance or hospital dispatch, call our direct Emergency Hotline at 1-800-555-ER99 or +1-555-0199.'
  },
  {
    topic: 'insurance',
    keywords: ['insurance', 'coverage', 'medicare', 'cashless', 'claims', 'bill'],
    answer: 'We accept all major health insurance providers, including BlueCross, Aetna, Cigna, UnitedHealthcare, and Medicare/Medicaid. Cashless hospitalization is facilitated through our Help Desk in Wing A.'
  },
  {
    topic: 'parking',
    keywords: ['parking', 'car', 'vehicle', 'valet'],
    answer: 'Patient and visitor parking is available in Multi-Level Parking Garage P1 (entrance via North Gate). The first 2 hours are complimentary for patients with appointments.'
  },
  {
    topic: 'pharmacy',
    keywords: ['pharmacy', 'medicine', 'prescription', 'drugstore'],
    answer: 'Our in-house 24-hour Pharmacy is located on the Ground Floor, adjacent to the Central Lobby. Digital prescriptions issued by our doctors are automatically ready for pickup or home delivery.'
  }
];

const faqTools = {
  getHospitalFAQ({ query = '' } = {}) {
    const q = query.toLowerCase();
    const match = hospitalKnowledge.find(item =>
      item.keywords.some(k => q.includes(k))
    );

    if (match) {
      return { found: true, topic: match.topic, answer: match.answer };
    }

    return {
      found: false,
      answer: 'St. Jude Hospital is a premier multispecialty hospital providing Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, and General Medicine services. Our Emergency Room is open 24/7. You can book an appointment or ask about visiting hours, parking, or insurance.'
    };
  }
};

module.exports = faqTools;
