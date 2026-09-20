import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Bot, Sparkles, AlertCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import chatbotService from '../../services/chatbotService';
import BookAppointmentModal from '../../pages/patient/BookAppointmentModal';

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am St. Jude's AI Healthcare Assistant. 🏥\n\nI can help you find specialists, check doctor availability, view schedules, and assist with hospital policies. How can I assist you today?",
      suggestedActions: [
        { label: 'Find a Cardiologist', query: 'Find a cardiologist' },
        { label: 'Dr. Arun Sharma Availability', query: 'When is Dr. Arun Sharma available?' },
        { label: 'Visiting Hours Policy', query: 'What are the hospital visiting hours?' }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text) => {
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await chatbotService.sendMessage(text, history);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.message || res.reply || "I'm sorry, I couldn't process that request right now.",
        actionType: res.actionType,
        data: res.data,
        suggestedActions: res.suggestedActions || []
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I encountered an issue reaching the hospital knowledge service. Please try again or contact the reception desk directly at (800) 555-0199.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookDoctorFromChat = (doc) => {
    setBookingDoctor({
      doctor_id: doc.doctorId || doc.doctor_id,
      name: doc.name,
      specialization_name: doc.specialization,
      consultation_fee: doc.consultationFee,
      experience: doc.experience || 10
    });
    setSelectedDate(null);
    setSelectedSlot(null);
    setIsBookModalOpen(true);
  };

  const handleBookSlotFromChat = (doctor, date, slot) => {
    setBookingDoctor(doctor);
    setSelectedDate(date);
    setSelectedSlot(slot.startTime);
    setIsBookModalOpen(true);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          className="chatbot-trigger"
          onClick={() => setIsOpen(true)}
          title="Open AI Health Assistant"
        >
          <div style={{ position: 'relative' }}>
            <Bot size={28} />
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: '10px',
              height: '10px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              border: '2px solid #ffffff'
            }} />
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00A896'
              }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  St. Jude Assistant
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: 'rgba(0, 168, 150, 0.3)',
                    color: '#99F6E4',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    AI
                  </span>
                </h4>
                <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>
                  Active • Doctor & Policy Knowledge
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Clinical Disclaimer Banner */}
          <div style={{
            backgroundColor: '#EFF6FF',
            borderBottom: '1px solid #DBEAFE',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: '#1E40AF'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>AI Assistant handles scheduling & FAQs. For emergencies call <strong>911</strong>.</span>
          </div>

          {/* Messages Area */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onActionClick={handleSendMessage}
                onBookDoctor={handleBookDoctorFromChat}
                onBookSlot={handleBookSlotFromChat}
              />
            ))}

            {loading && (
              <div className="chat-message bot">
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#00A896',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={16} />
                </div>
                <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
                  <Sparkles size={14} className="animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
      )}

      {/* Book Appointment Modal triggered directly from chat */}
      {isBookModalOpen && (
        <BookAppointmentModal
          doctor={bookingDoctor}
          initialDate={selectedDate}
          initialSlot={selectedSlot}
          onClose={() => setIsBookModalOpen(false)}
          onSuccess={() => {
            setIsBookModalOpen(false);
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: 'bot',
                text: `✅ Fantastic! Your appointment with ${bookingDoctor?.name || 'the physician'} has been confirmed. You can view all details in your Patient Portal.`
              }
            ]);
          }}
        />
      )}
    </>
  );
}
