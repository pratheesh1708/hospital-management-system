import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export const COUNTRIES = [
  { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸', placeholder: '(555) 000-0000' },
  { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦', placeholder: '(555) 000-0000' },
  { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { name: 'Malaysia', code: 'MY', dial: '+60', flag: '🇲🇾', placeholder: '12-345 6789' },
  { name: 'Qatar', code: 'QA', dial: '+974', flag: '🇶🇦', placeholder: '3312 3456' },
  { name: 'Kuwait', code: 'KW', dial: '+965', flag: '🇰🇼', placeholder: '9123 4567' },
  { name: 'Oman', code: 'OM', dial: '+968', flag: '🇴🇲', placeholder: '9123 4567' },
  { name: 'Bahrain', code: 'BH', dial: '+973', flag: '🇧🇭', placeholder: '3612 3456' },
  { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭', placeholder: '917 123 4567' },
  { name: 'Pakistan', code: 'PK', dial: '+92', flag: '🇵🇰', placeholder: '300 1234567' },
  { name: 'Bangladesh', code: 'BD', dial: '+880', flag: '🇧🇩', placeholder: '1712-345678' },
  { name: 'Sri Lanka', code: 'LK', dial: '+94', flag: '🇱🇰', placeholder: '71 234 5678' },
  { name: 'Nepal', code: 'NP', dial: '+977', flag: '🇳🇵', placeholder: '984-1234567' },
  { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦', placeholder: '71 123 4567' },
  { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬', placeholder: '802 123 4567' },
  { name: 'Kenya', code: 'KE', dial: '+254', flag: '🇰🇪', placeholder: '712 345678' },
  { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵', placeholder: '90-1234-5678' },
  { name: 'South Korea', code: 'KR', dial: '+82', flag: '🇰🇷', placeholder: '10-1234-5678' },
  { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷', placeholder: '11 91234-5678' },
  { name: 'Mexico', code: 'MX', dial: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { name: 'Italy', code: 'IT', dial: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { name: 'Spain', code: 'ES', dial: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { name: 'Netherlands', code: 'NL', dial: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { name: 'Switzerland', code: 'CH', dial: '+41', flag: '🇨🇭', placeholder: '78 123 45 67' },
  { name: 'Sweden', code: 'SE', dial: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { name: 'New Zealand', code: 'NZ', dial: '+64', flag: '🇳🇿', placeholder: '21 123 4567' },
  { name: 'Ireland', code: 'IE', dial: '+353', flag: '🇮🇪', placeholder: '83 123 4567' },
  { name: 'Indonesia', code: 'ID', dial: '+62', flag: '🇮🇩', placeholder: '812-3456-7890' },
  { name: 'Turkey', code: 'TR', dial: '+90', flag: '🇹🇷', placeholder: '532 123 45 67' },
  { name: 'Egypt', code: 'EG', dial: '+20', flag: '🇪🇬', placeholder: '100 123 4567' }
];

export default function PhoneInput({
  value = '',
  onChange,
  name = 'phone',
  id = 'phone',
  required = false,
  disabled = false,
  defaultCountryCode = 'IN'
}) {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    // Attempt to match from initial value
    if (value && value.startsWith('+')) {
      const match = COUNTRIES.find((c) => value.startsWith(c.dial));
      if (match) return match;
    }
    return COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (value && value.startsWith(selectedCountry.dial)) {
      return value.replace(selectedCountry.dial, '').trim();
    }
    return value.replace(/^\+\d+[\s-]*/, '').trim();
  });

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync when parent value changes externally
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const match = COUNTRIES.find((c) => value.startsWith(c.dial));
      if (match && match.dial !== selectedCountry.dial) {
        setSelectedCountry(match);
        setPhoneNumber(value.replace(match.dial, '').trim());
      }
    }
  }, [value]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    const fullNumber = phoneNumber ? `${country.dial} ${phoneNumber}` : '';
    if (onChange) {
      onChange({
        target: {
          name,
          value: fullNumber
        }
      });
    }
  };

  const handleNumberChange = (e) => {
    const rawVal = e.target.value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(rawVal);
    const fullNumber = rawVal.trim() ? `${selectedCountry.dial} ${rawVal.trim()}` : '';
    if (onChange) {
      onChange({
        target: {
          name,
          value: fullNumber
        }
      });
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          border: '1px solid #CBD5E1',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}
      >
        {/* Country Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 12px',
            backgroundColor: '#F8FAFC',
            border: 'none',
            borderRight: '1px solid #CBD5E1',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            color: '#1E293B',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            outline: 'none'
          }}
          title={`${selectedCountry.name} (${selectedCountry.dial})`}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>{selectedCountry.flag}</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
            {selectedCountry.dial}
          </span>
          <ChevronDown size={14} color="#64748B" />
        </button>

        {/* Mobile Number Input */}
        <input
          type="tel"
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          placeholder={selectedCountry.placeholder}
          value={phoneNumber}
          onChange={handleNumberChange}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '10px 14px',
            fontSize: '14px',
            color: '#0F172A',
            backgroundColor: 'transparent'
          }}
        />
      </div>

      {/* Country Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 999,
            width: '320px',
            maxWidth: '90vw',
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            animation: 'modalFadeIn 0.15s ease-out'
          }}
        >
          {/* Search Bar */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F8FAFC' }}>
            <Search size={14} color="#94A3B8" />
            <input
              type="text"
              autoFocus
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                color: '#0F172A'
              }}
            />
          </div>

          {/* Country List */}
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: isSelected ? '#E6F8F6' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>{c.flag}</span>
                      <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#00A896' : '#1E293B' }}>
                        {c.name}
                      </span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#64748B', fontSize: '12px' }}>
                      {c.dial}
                    </span>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>
                No country found matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
