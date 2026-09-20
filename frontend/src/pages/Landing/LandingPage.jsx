import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import DoctorCard from '../../components/DoctorCard/DoctorCard';
import BookAppointmentModal from '../patient/BookAppointmentModal';
import doctorService from '../../services/doctorService';
import {
  HeartPulse,
  ShieldCheck,
  Clock,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Activity,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, specsRes] = await Promise.all([
          doctorService.getDoctors({ limit: 3 }),
          doctorService.getSpecializations()
        ]);
        if (docsRes.success) setDoctors(docsRes.doctors || []);
        if (specsRes.success) setSpecializations(specsRes.specializations || []);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    }
    loadData();
  }, []);

  const faqs = [
    {
      q: 'What are the visiting hours for inpatients?',
      a: 'General inpatient visiting hours are daily from 10:00 AM to 1:00 PM, and from 4:00 PM to 8:00 PM. Intensive Care Unit (ICU) visits are restricted to immediate family from 11:00 AM to 12:00 PM and 5:00 PM to 6:00 PM.'
    },
    {
      q: 'How do I book an appointment with a specialist?',
      a: 'You can book through our online portal in 3 simple steps: choose your doctor, select a convenient date and available slot, and confirm. You will receive an instant confirmation and email notification.'
    },
    {
      q: 'What insurance plans does St. Jude Hospital accept?',
      a: 'We accept all major health insurance networks including BlueCross BlueShield, Aetna, Cigna, UnitedHealthcare, Medicare, and regional HMO/PPO policies. Cashless claims processing is handled on-site.'
    },
    {
      q: 'How does the AI Clinical Assistant help me?',
      a: 'Our AI Assistant is available 24/7 on the bottom right of your screen. It helps you check doctor schedules in real-time, finds specialists based on your symptoms, answers hospital policy questions, and assists with appointment booking.'
    },
    {
      q: 'How do I access my medical records and consultation reports?',
      a: 'Once your doctor concludes your consultation, your official signed medical report and prescription are instantly available in your Patient Portal under "Medical History". You can view or print them anytime.'
    }
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 60%, #00A896 150%)',
        color: '#ffffff',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 168, 150, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(0, 168, 150, 0.2)',
              border: '1px solid rgba(0, 168, 150, 0.4)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#99F6E4',
              marginBottom: '20px'
            }}>
              <Sparkles size={16} />
              <span>Next-Generation Healthcare Technology</span>
            </div>

            <h1 style={{
              fontSize: '48px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '20px'
            }}>
              World-Class Medicine, <br />
              <span style={{ color: '#00A896' }}>Precision Care</span> For You.
            </h1>

            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#CBD5E1',
              marginBottom: '36px'
            }}>
              St. Jude Hospital brings together elite medical specialists, real-time doctor availability scheduling, digital health records, and an intelligent AI assistant to deliver seamless patient care.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Link to="/doctors" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} />
                <span>Find & Book a Doctor</span>
              </Link>
              <a href="#specializations" className="btn btn-outline-white btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Explore Departments</span>
                <ArrowRight size={18} />
              </a>
            </div>

            {/* Trust Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '24px',
              marginTop: '56px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(255,255,255,0.12)'
            }}>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#00A896', margin: 0 }}>50+</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>Board Specialists</p>
              </div>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#00A896', margin: 0 }}>15k+</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>Patients Treated</p>
              </div>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#00A896', margin: 0 }}>99.8%</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>Satisfaction Rate</p>
              </div>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: 800, color: '#00A896', margin: 0 }}>24/7</h3>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 0' }}>Emergency & AI Care</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Excellence Features */}
      <section style={{ maxWidth: '1200px', margin: '-40px auto 60px', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}>
          <div className="card p-4" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#E6F8F6',
              color: '#00A896',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>Zero-Wait Booking</h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Directly book confirmed slots with our real-time availability synchronization engine.
              </p>
            </div>
          </div>

          <div className="card p-4" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>Secure Medical Vault</h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Encrypted digital health records, diagnosis tracking, and official downloadable consultation reports.
              </p>
            </div>
          </div>

          <div className="card p-4" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FDF2F8',
              color: '#DB2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#0F172A' }}>AI Clinical Assistant</h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                24/7 interactive assistant for symptom inquiry, doctor discovery, and appointment booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments & Specializations Section */}
      <section id="specializations" style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.5px' }}>
            Specialized Clinical Departments
          </h2>
          <p style={{ fontSize: '15px', color: '#64748B', margin: '10px 0 0' }}>
            Comprehensive healthcare across specialized disciplines staffed by internationally recognized physicians.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {specializations.length > 0 ? (
            specializations.map((spec) => (
              <div key={spec.specialization_id} className="card p-4" style={{
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#E6F8F6',
                    color: '#00A896',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}>
                    <Stethoscope size={20} />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    {spec.specialization_name}
                  </h4>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {spec.description || 'Advanced diagnostics, specialized therapeutic interventions, and personalized patient management.'}
                </p>
                <Link
                  to={`/doctors?specialization=${encodeURIComponent(spec.specialization_name)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#00A896',
                    marginTop: '16px',
                    textDecoration: 'none'
                  }}
                >
                  <span>View Specialists</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#64748B' }}>
              Loading specialized departments...
            </div>
          )}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0B132B' }}>
                Meet Our Leading Physicians
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: '6px 0 0' }}>
                Dedicated consultants providing compassionate, evidence-based care.
              </p>
            </div>
            <Link to="/doctors" className="btn btn-outline-teal" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>View All Doctors</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="doctor-grid">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc.doctor_id}
                doctor={doc}
                onBook={(doctor) => setSelectedDoctor(doctor)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Hospital FAQ Section */}
      <section id="faq" style={{ maxWidth: '800px', margin: '80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#0B132B' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '6px 0 0' }}>
            Essential information regarding hospital admissions, consultations, and operations.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} color="#00A896" /> : <ChevronDown size={18} color="#64748B" />}
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 20px 18px',
                    fontSize: '14px',
                    color: '#475569',
                    lineHeight: 1.6,
                    borderTop: '1px solid #F1F5F9'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0B132B', color: '#ffffff', padding: '60px 24px 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#00A896',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Stethoscope size={20} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800 }}>St. Jude Hospital</span>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
              Pioneering clinical excellence, advanced diagnostics, and compassionate healthcare with 24/7 emergency response.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: '#00A896' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
              <Link to="/doctors" style={{ color: 'inherit', textDecoration: 'none' }}>Find Specialists</Link>
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Patient Portal</Link>
              <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Create Account</Link>
              <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>Hospital FAQs</a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: '#00A896' }}>Emergency Services</h4>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
              24/7 Trauma Care & Ambulance Hotline:
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '15px',
              marginTop: '8px'
            }}>
              <PhoneCall size={16} />
              <span>(800) 555-0199</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '20px auto 0', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
          &copy; {new Date().getFullYear()} St. Jude Hospital Management System. All rights reserved. Encrypted & HIPAA Compliant.
        </div>
      </footer>

      {/* Book Appointment Modal */}
      {selectedDoctor && (
        <BookAppointmentModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onSuccess={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
}
