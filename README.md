# St. Jude Hospital Management System (HMS) & AI Assistant

A full-stack, enterprise-grade Hospital Management System featuring **React.js**, **Node.js/Express**, **MySQL** (with connection pooling and zero-config local storage fallback), **Redis** background queues, **HttpOnly JWT** authentication, **Email OTP** verification, **Role-Based Access Control (RBAC)**, and an **AI Clinical Assistant**.

---

## 🌟 Key Features

### 1. Dual-Engine Database Architecture
- **Primary**: Native MySQL 8.0 with connection pooling, strict transactions, row-level locking (`SELECT ... FOR UPDATE`), and foreign keys.
- **Zero-Config Fallback**: Automatic embedded SQLite storage adapter initialized whenever an external MySQL server is unavailable on port 3306.

### 2. Double-Booking Concurrency Defense (3-Layer Protection)
- **Layer 1 (Frontend)**: Real-time dynamic slot availability query and caching.
- **Layer 2 (Backend Transaction)**: Row locking transaction before appointment insertion.
- **Layer 3 (Database Constraint)**: Unique index `(doctor_id, appointment_date, start_time, status)` guaranteeing zero race-condition duplicates.

### 3. AI Healthcare Assistant (Controlled Tool Calling)
- Floating interactive chatbot with medical safety guardrails (strictly refuses autonomous diagnosis/prescriptions).
- Controlled backend tools:
  - `findDoctors(specialization, query)`
  - `checkDoctorAvailability(doctorId, date)`
  - `getAvailableSlots(doctorId, date)`
  - `getPatientAppointments(status)`
  - `createAppointment(doctorId, date, slotTime, reason)`
  - `getHospitalFAQ(query)`

### 4. Patient, Doctor & Admin Portals
- **Patient**:
  - Specialist search and department filtering
  - Interactive multi-step appointment booking
  - Real-time notifications and reminders
  - Medical history and downloadable official consultation reports
- **Doctor**:
  - Daily clinical schedule and patient roster
  - Interactive consultation modal to record symptoms, diagnoses, treatments, and prescriptions
  - Automatic official PDF/Report generation
  - 7-day weekly availability slot management
- **Admin**:
  - High-level clinical and appointment metrics
  - User directory with status (Active/Suspended) and RBAC role toggles
  - Clinical departments / specializations management
  - Immutable HIPAA & security audit log viewer with IP tracking

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Pre-Configured Data |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@hospital.com` | `Password123!` | Medical history, past consultation report, active notifications |
| **Doctor** | `dr.arun@hospital.com` | `Password123!` | Senior Cardiologist, 7-day availability slots, patient schedule |
| **Admin** | `admin@hospital.com` | `Password123!` | System administrator with full access to audit logs & user governance |

---

## 🚀 Quick Start (Local Development)

### 1. Backend
```bash
cd backend
npm install
node server.js
```
The backend server runs at `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The React development server runs at `http://localhost:5173`.

---

## 🧪 Automated Test Suite

Run the full automated test suite covering Auth, RBAC, Concurrency Race Conditions, and AI Chatbot safety:

```bash
cd backend
node tests/run_all_tests.js
```

### Verified Test Suites:
1. **Authentication & Security**: Registration, duplicate prevention, bcrypt password hashing, OTP verification, and JWT claims.
2. **RBAC & Clinical Authorization**: Cross-patient isolation, unauthorized route protection.
3. **Appointment Concurrency Race Test**: Simultaneous bookings for identical slot time; guarantees exactly 1 booking succeeds and 1 receives a graceful 409 Conflict.
4. **AI Chatbot Safety & Tools**: Diagnosis refusal safety guardrail, doctor lookup, and schedule inquiry.

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```
This boots MySQL 8.0, Redis 7, and the compiled full-stack production application.
