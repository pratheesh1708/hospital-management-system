-- =============================================================================
-- Hospital Management System - Demonstration Seed Data
-- =============================================================================

-- Specializations
INSERT INTO specializations (specialization_id, specialization_name, description, icon) VALUES
(1, 'Cardiology', 'Specialized care for heart conditions, coronary artery disease, heart failure, and arrhythmias.', 'Heart'),
(2, 'Dermatology', 'Expert diagnosis and therapy for skin, hair, and nail health, including eczema, psoriasis, and cosmetic care.', 'Sparkles'),
(3, 'Neurology', 'Advanced treatment for disorders of the brain, spinal cord, nerves, migraines, and cognitive care.', 'Activity'),
(4, 'Orthopedics', 'Surgical and non-surgical care for musculoskeletal injuries, joint replacement, and spine health.', 'ShieldAlert'),
(5, 'Pediatrics', 'Compassionate primary and preventive healthcare tailored for infants, children, and teenagers.', 'Baby'),
(6, 'General Medicine', 'Comprehensive primary health assessments, preventive wellness, and chronic illness management.', 'Stethoscope')
ON DUPLICATE KEY UPDATE specialization_name = VALUES(specialization_name);

-- Default Demo Password for all accounts: Password123!
-- Bcrypt Hash: $2b$10$WpZJ8b1Mv8O2aCqP1w2zYeB3bBv7aPzFq7H3zU1rC8XvY5w2zYeB3
-- We also support dynamic hashing in setup.js for exact verification.
