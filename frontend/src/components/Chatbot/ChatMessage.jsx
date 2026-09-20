import React from 'react';
import { Bot, User, Calendar, Clock, Stethoscope } from 'lucide-react';

export default function ChatMessage({ message, onActionClick, onBookDoctor, onBookSlot }) {
  const isBot = message.sender === 'bot';

  return (
    <div className={`chat-message ${isBot ? 'bot' : 'user'}`}>
      <div style={{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: isBot ? '#00A896' : '#0B132B',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {isBot ? <Bot size={16} /> : <User size={16} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '100%' }}>
        <div className={`chat-bubble ${isBot ? 'bot' : 'user'}`}>
          <div style={{ whiteSpace: 'pre-line' }}>{message.text}</div>

          {/* Structured Doctor List from Backend Tool */}
          {message.actionType === 'doctor_list' && message.data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {message.data.map((doc) => (
                <div
                  key={doc.doctorId}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {doc.name}
                    </h5>
                    <p style={{ margin: 0, fontSize: '11px', color: '#028090', fontWeight: 600 }}>
                      {doc.specialization} • {doc.consultationFee}
                    </p>
                  </div>
                  <button
                    onClick={() => onBookDoctor && onBookDoctor(doc)}
                    style={{
                      backgroundColor: '#00A896',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Calendar size={13} /> Book
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Structured Slot List from Backend Tool */}
          {message.actionType === 'slot_list' && message.data && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                Select a slot for {message.data.date}:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {message.data.slots.map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => onBookSlot && onBookSlot(message.data.doctor, message.data.date, slot)}
                    style={{
                      backgroundColor: '#E6F8F6',
                      color: '#028090',
                      border: '1px solid #99F6E4',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Clock size={12} /> {slot.startTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Structured Appointment List from Backend Tool */}
          {message.actionType === 'appointment_list' && message.data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {message.data.map((appt) => (
                <div
                  key={appt.appointmentId}
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px'
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, color: '#0F172A' }}>
                    {appt.doctorName} ({appt.specialization})
                  </p>
                  <p style={{ margin: '2px 0 0', color: '#64748B' }}>
                    📅 {appt.date} at {appt.time} • <span className={`badge badge-${appt.status}`} style={{ fontSize: '10px' }}>{appt.status}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Quick Actions */}
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="chat-actions-container">
            {message.suggestedActions.map((action, idx) => (
              <button
                key={idx}
                className="chat-chip"
                onClick={() => onActionClick && onActionClick(action.query)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
