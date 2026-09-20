import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import DoctorCard from '../../components/DoctorCard/DoctorCard';
import BookAppointmentModal from './BookAppointmentModal';
import doctorService from '../../services/doctorService';
import { Search, Filter, Stethoscope, Sparkles } from 'lucide-react';

export default function DoctorsSearchPage() {
  const [searchParams] = useSearchParams();
  const initialSpec = searchParams.get('specialization') || '';

  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(initialSpec);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedSpecialization]);

  async function loadData() {
    try {
      setLoading(true);
      const [docsRes, specsRes] = await Promise.all([
        doctorService.getDoctors({
          specialization: selectedSpecialization || undefined,
          search: searchQuery || undefined
        }),
        doctorService.getSpecializations()
      ]);
      if (docsRes.success) setDoctors(docsRes.doctors || []);
      if (specsRes.success) setSpecializations(specsRes.specializations || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Title & Search Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.5px', margin: '0 0 8px' }}>
            Find & Consult Leading Specialists
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
            Choose from board-certified doctors, inspect real-time weekly availability, and book direct appointments.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 300px', display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by doctor name or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} color="#64748B" />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="">All Departments</option>
              {specializations.map((spec) => (
                <option key={spec.specialization_id} value={spec.specialization_name}>
                  {spec.specialization_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <Sparkles size={32} color="#00A896" className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading specialist profiles and real-time schedules...</p>
          </div>
        ) : doctors.length > 0 ? (
          <div className="doctor-grid">
            {doctors.map((doc) => (
              <DoctorCard
                key={doc.doctor_id}
                doctor={doc}
                onBook={(doctor) => setSelectedDoctor(doctor)}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '60px 20px'
          }}>
            <Stethoscope size={44} color="#94A3B8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
              No Doctors Found Matching Your Criteria
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Try clearing your search filters or browse other clinical departments.
            </p>
            <button
              onClick={() => { setSelectedSpecialization(''); setSearchQuery(''); }}
              className="btn btn-outline-teal btn-sm"
              style={{ marginTop: '16px' }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

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
