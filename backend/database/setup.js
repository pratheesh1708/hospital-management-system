const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function setup() {
  console.log('🚀 Running Hospital Management System Database Setup & Seeding...');
  await db.initDatabase();

  const isSqlite = db.getActiveEngine() === 'sqlite';

  // Table creation statements (compatible with both MySQL and SQLite)
  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      user_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'patient',
      phone VARCHAR(50),
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      email_verified BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS patients (
      patient_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      user_id INT NOT NULL UNIQUE,
      date_of_birth DATE,
      gender VARCHAR(20),
      blood_group VARCHAR(10),
      address TEXT,
      emergency_contact VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS specializations (
      specialization_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      specialization_name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      icon VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS doctors (
      doctor_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      user_id INT NOT NULL UNIQUE,
      specialization_id INT NOT NULL,
      qualification VARCHAR(255) NOT NULL,
      experience INT NOT NULL DEFAULT 0,
      consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
      bio TEXT,
      avatar_url VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY (specialization_id) REFERENCES specializations(specialization_id)
    )`,

    `CREATE TABLE IF NOT EXISTS doctor_availability (
      availability_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      doctor_id INT NOT NULL,
      available_date DATE NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS appointments (
      appointment_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      patient_id INT NOT NULL,
      doctor_id INT NOT NULL,
      appointment_date DATE NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
      reason TEXT,
      confirmation_sent BOOLEAN DEFAULT 0,
      reminder_sent BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS medical_records (
      record_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      patient_id INT NOT NULL,
      doctor_id INT NOT NULL,
      appointment_id INT NOT NULL UNIQUE,
      symptoms TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      treatment TEXT NOT NULL,
      medications TEXT,
      doctor_notes TEXT,
      follow_up_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
      FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS reports (
      report_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      record_id INT NOT NULL UNIQUE,
      patient_id INT NOT NULL,
      doctor_id INT NOT NULL,
      report_number VARCHAR(100) NOT NULL UNIQUE,
      summary TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'final',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (record_id) REFERENCES medical_records(record_id) ON DELETE CASCADE,
      FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS otp_verifications (
      otp_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      email VARCHAR(255) NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      purpose VARCHAR(50) NOT NULL,
      attempts INT DEFAULT 0,
      max_attempts INT DEFAULT 5,
      expires_at DATETIME NOT NULL,
      verified BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS oauth_accounts (
      oauth_account_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      user_id INT NOT NULL,
      provider VARCHAR(50) NOT NULL,
      provider_user_id VARCHAR(255) NOT NULL,
      provider_email VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
      notification_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'system',
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      log_id ${isSqlite ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTOINCREMENT PRIMARY KEY'},
      user_id INT,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100),
      ip_address VARCHAR(45),
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const stmt of tableStatements) {
    await db.query(stmt);
  }

  // Create Unique Index for double-booking concurrency defense
  try {
    await db.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_doctor_slot_active ON appointments (doctor_id, appointment_date, start_time, status)`);
  } catch (e) {
    // Ignore index exists error
  }

  console.log('✅ All database tables and indexes verified.');

  // Seed Specializations
  const specializations = [
    { id: 1, name: 'Cardiology', desc: 'Heart and cardiovascular health, cardiac rehabilitation, and diagnostic testing.', icon: 'Heart' },
    { id: 2, name: 'Dermatology', desc: 'Skin, hair, nail conditions, melanoma screening, and dermatological therapies.', icon: 'Sparkles' },
    { id: 3, name: 'Neurology', desc: 'Brain, nerve, and spine disorders, migraine treatment, and stroke prevention.', icon: 'Activity' },
    { id: 4, name: 'Orthopedics', desc: 'Bones, joints, sports medicine, trauma, and orthopedic surgery.', icon: 'ShieldAlert' },
    { id: 5, name: 'Pediatrics', desc: 'Comprehensive medical care, vaccinations, and growth monitoring for kids.', icon: 'Baby' },
    { id: 6, name: 'General Medicine', desc: 'Primary adult care, chronic illness control, preventative health checkups.', icon: 'Stethoscope' }
  ];

  for (const spec of specializations) {
    const [existing] = await db.query('SELECT specialization_id FROM specializations WHERE specialization_name = ?', [spec.name]);
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO specializations (specialization_id, specialization_name, description, icon) VALUES (?, ?, ?, ?)',
        [spec.id, spec.name, spec.desc, spec.icon]
      );
    }
  }
  console.log('✅ Specializations seeded.');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Seed Admin
  const [adminUser] = await db.query('SELECT user_id FROM users WHERE email = ?', ['admin@hospital.com']);
  if (adminUser.length === 0) {
    await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['System Administrator', 'admin@hospital.com', hashedPassword, 'admin', '+1-555-0100', 'active', 1]
    );
    console.log('✅ Admin user created: admin@hospital.com / Password123!');
  }

  // Seed Doctors
  const doctorSeeds = [
    {
      name: 'Dr. Arun Sharma',
      email: 'dr.arun@hospital.com',
      specId: 1,
      qualification: 'MD, FACC, Cardiology Specialist',
      experience: 15,
      fee: 90.00,
      bio: 'Senior Cardiologist with 15+ years of experience in invasive and non-invasive cardiovascular medicine and preventive cardiology.',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&crop=faces'
    },
    {
      name: 'Dr. Sarah Jenkins',
      email: 'dr.sarah@hospital.com',
      specId: 2,
      qualification: 'MD, FAAD Dermatology',
      experience: 10,
      fee: 75.00,
      bio: 'Board-certified dermatologist specializing in clinical dermatology, laser therapy, and advanced skin diagnostics.',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813689-535359a33486?w=300&h=300&fit=crop&crop=faces'
    },
    {
      name: 'Dr. Vikram Patel',
      email: 'dr.vikram@hospital.com',
      specId: 3,
      qualification: 'DM, Neurology, Harvard Fellow',
      experience: 18,
      fee: 120.00,
      bio: 'Renowned Neurologist focusing on neurodegenerative diseases, stroke care, advanced electromyography, and headache management.',
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=faces'
    },
    {
      name: 'Dr. Elena Rostova',
      email: 'dr.elena@hospital.com',
      specId: 4,
      qualification: 'MS, Orthopedics, Joint Reconstruction',
      experience: 12,
      fee: 85.00,
      bio: 'Specialist in joint preservation, sports medicine, knee and shoulder arthroscopy, and minimally invasive fracture repair.',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=faces'
    },
    {
      name: 'Dr. Marcus Chen',
      email: 'dr.marcus@hospital.com',
      specId: 5,
      qualification: 'MD, FAAP Pediatrics',
      experience: 8,
      fee: 70.00,
      bio: 'Dedicated pediatrician providing warm, evidence-based care for newborn milestones, childhood immunizations, and asthma care.',
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=faces'
    },
    {
      name: 'Dr. Priya Nair',
      email: 'dr.priya@hospital.com',
      specId: 6,
      qualification: 'MBBS, MD Internal Medicine',
      experience: 14,
      fee: 65.00,
      bio: 'Primary care physician with deep expertise in managing hypertension, diabetes, metabolic health, and general wellness checkups.',
      avatarUrl: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&h=300&fit=crop&crop=faces'
    }
  ];

  for (const doc of doctorSeeds) {
    let [u] = await db.query('SELECT user_id FROM users WHERE email = ?', [doc.email]);
    let userId;
    if (u.length === 0) {
      const [res] = await db.query(
        'INSERT INTO users (name, email, password_hash, role, phone, status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [doc.name, doc.email, hashedPassword, 'doctor', '+1-555-02' + doc.specId + '0', 'active', 1]
      );
      userId = res.insertId;
    } else {
      userId = u[0].user_id;
    }

    let [d] = await db.query('SELECT doctor_id FROM doctors WHERE user_id = ?', [userId]);
    let doctorId;
    if (d.length === 0) {
      const [docRes] = await db.query(
        'INSERT INTO doctors (user_id, specialization_id, qualification, experience, consultation_fee, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, doc.specId, doc.qualification, doc.experience, doc.fee, doc.bio, doc.avatarUrl]
      );
      doctorId = docRes.insertId;
    } else {
      doctorId = d[0].doctor_id;
    }

    // Generate Availability slots for today and next 7 days
    const today = new Date();
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const slotDate = new Date();
      slotDate.setDate(today.getDate() + dayOffset);
      const dateStr = slotDate.toISOString().split('T')[0];

      const timeSlots = [
        { start: '09:00', end: '09:30' },
        { start: '09:30', end: '10:00' },
        { start: '10:00', end: '10:30' },
        { start: '10:30', end: '11:00' },
        { start: '11:00', end: '11:30' },
        { start: '14:00', end: '14:30' },
        { start: '14:30', end: '15:00' },
        { start: '15:00', end: '15:30' },
        { start: '15:30', end: '16:00' }
      ];

      for (const slot of timeSlots) {
        const [existingSlot] = await db.query(
          'SELECT availability_id FROM doctor_availability WHERE doctor_id = ? AND available_date = ? AND start_time = ?',
          [doctorId, dateStr, slot.start]
        );
        if (existingSlot.length === 0) {
          await db.query(
            'INSERT INTO doctor_availability (doctor_id, available_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)',
            [doctorId, dateStr, slot.start, slot.end, 'available']
          );
        }
      }
    }
  }
  console.log('✅ 6 Doctors seeded with qualifications, profiles, and 7-day availability slots.');

  // Seed Demo Patient
  const [patientUser] = await db.query('SELECT user_id FROM users WHERE email = ?', ['patient@hospital.com']);
  let patientUserId;
  if (patientUser.length === 0) {
    const [pRes] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['John Doe', 'patient@hospital.com', hashedPassword, 'patient', '+1-555-0199', 'active', 1]
    );
    patientUserId = pRes.insertId;
  } else {
    patientUserId = patientUser[0].user_id;
  }

  const [patientProfile] = await db.query('SELECT patient_id FROM patients WHERE user_id = ?', [patientUserId]);
  let patientId;
  if (patientProfile.length === 0) {
    const [pProfileRes] = await db.query(
      'INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact) VALUES (?, ?, ?, ?, ?, ?)',
      [patientUserId, '1990-05-15', 'male', 'O+', '742 Evergreen Terrace, Springfield', '+1-555-0188 (Jane Doe - Spouse)']
    );
    patientId = pProfileRes.insertId;
  } else {
    patientId = patientProfile[0].patient_id;
  }
  console.log('✅ Patient John Doe created: patient@hospital.com / Password123!');

  // Seed a sample appointment and consultation report for demonstration
  const [existingAppts] = await db.query('SELECT appointment_id FROM appointments WHERE patient_id = ?', [patientId]);
  if (existingAppts.length === 0) {
    const [drArun] = await db.query('SELECT doctor_id FROM doctors LIMIT 1');
    if (drArun.length > 0) {
      const docId = drArun[0].doctor_id;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const [apptRes] = await db.query(
        'INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, status, reason, confirmation_sent, reminder_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [patientId, docId, yesterdayStr, '10:00', '10:30', 'COMPLETED', 'Routine cardiovascular health checkup and mild chest tightness after exercise.', 1, 1]
      );
      const apptId = apptRes.insertId;

      const medications = JSON.stringify([
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '30 days' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily with breakfast', duration: '90 days' }
      ]);

      const [recordRes] = await db.query(
        'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment, medications, doctor_notes, follow_up_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          patientId,
          docId,
          apptId,
          'Exertional dyspnea, occasional chest pressure after fast walking, blood pressure 138/88.',
          'Mild Stage 1 Hypertension with Borderline Hyperlipidemia (E20.1)',
          'Lifestyle modification, dietary salt reduction (<2g/day), aerobic exercise 30 min/day, lipid control therapy.',
          medications,
          'Patient advised to maintain daily blood pressure log and avoid heavy isometric lifting. Return immediately if angina symptoms worsen.',
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        ]
      );

      const recordId = recordRes.insertId;

      await db.query(
        'INSERT INTO reports (record_id, patient_id, doctor_id, report_number, summary, status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          recordId,
          patientId,
          docId,
          'REP-2026-0089',
          'Cardiology consultation complete. Patient initiated on low-dose statin with dietary modifications. Follow-up scheduled in 30 days.',
          'final'
        ]
      );

      await db.query(
        'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)',
        [
          patientUserId,
          'Consultation Report Available',
          'Your medical consultation report from Dr. Arun Sharma (Cardiology) is now securely available in your Medical History.',
          'report',
          0
        ]
      );

      console.log('✅ Demo medical record, consultation report (REP-2026-0089), and notification seeded.');
    }
  }

  console.log('🎉 Database setup and seeding completed successfully!');
}

if (require.main === module) {
  setup().then(() => process.exit(0)).catch((err) => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
}

module.exports = setup;
