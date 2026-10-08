import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PRESET_QUESTIONS, answerEventQuestion, getEventAssistantDetails } from '../../services/eventAiService';

export default function EventAIChatbot() {
  const location = useLocation();
  const { events } = useSelector((state) => state.events);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Detect event from URL if on /events/:id
  useEffect(() => {
    const match = location.pathname.match(/\/events\/([^/]+)/);
    if (match && match[1]) {
      const pathId = match[1];
      const found = events.find((e) => String(e.id) === String(pathId));
      if (found) {
        setSelectedEventId(String(found.id));
        return;
      }
    }
    // Default to first event if none selected yet
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(String(events[0].id));
    }
  }, [location.pathname, events, selectedEventId]);

  const currentEvent = events.find((e) => String(e.id) === String(selectedEventId)) || events[0] || null;

  // Initialize or reset greeting when currentEvent changes
  useEffect(() => {
    if (currentEvent) {
      const details = getEventAssistantDetails(currentEvent);
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello! I am your EventPro AI Assistant for "${details.title}".\n\nAsk me anything or click one of the quick questions below for instant answers!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [selectedEventId]);

  // Listen for custom trigger events from any component
  useEffect(() => {
    const handleTrigger = (e) => {
      const { eventId, question } = e.detail || {};
      if (eventId) {
        setSelectedEventId(String(eventId));
      }
      setIsOpen(true);
      if (question) {
        setTimeout(() => {
          handleSendMessage(question);
        }, 150);
      }
    };

    window.addEventListener('open-event-ai', handleTrigger);
    return () => window.removeEventListener('open-event-ai', handleTrigger);
  }, [events, selectedEventId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now() + '-user',
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Instant realistic response delay (180ms)
    setTimeout(() => {
      const replyText = answerEventQuestion(query, currentEvent);
      const aiMsg = {
        id: Date.now() + '-ai',
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 180);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClear = () => {
    if (currentEvent) {
      const details = getEventAssistantDetails(currentEvent);
      setMessages([
        {
          id: 'cleared-welcome',
          sender: 'ai',
          text: `Chat cleared. Ready for your questions about "${details.title}"!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([]);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          id="event-ai-launcher"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9990,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 22px',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            border: '1.5px solid rgba(165, 180, 252, 0.5)',
            borderRadius: '9999px',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.9rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(99, 102, 241, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 14px 36px rgba(0, 0, 0, 0.55), 0 0 26px rgba(129, 140, 248, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(99, 102, 241, 0.3)';
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
              display: 'inline-block',
            }}
          />
          <span>AI ASSISTANT</span>
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 8px',
              background: 'rgba(255, 255, 255, 0.16)',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            INSTANT
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          id="event-ai-window"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: 'min(440px, calc(100vw - 32px))',
            height: 'min(620px, calc(100vh - 48px))',
            maxHeight: '90vh',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(15, 23, 42, 0.97)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(129, 140, 248, 0.4)',
            borderRadius: '18px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.25)',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 8px #22c55e',
                    display: 'inline-block',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff', letterSpacing: '0.04em' }}>
                    EVENT AI ASSISTANT
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                    Instant Event Concierge & Support
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear conversation"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '6px',
                    color: '#fca5a5',
                    cursor: 'pointer',
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>

            {/* Event Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>
                EVENT:
              </span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(30, 41, 59, 0.95)',
                  border: '1px solid rgba(129, 140, 248, 0.3)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '6px 10px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} style={{ background: '#0f172a', color: '#ffffff' }}>
                    {ev.title} ({ev.location || 'India'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Question Chips */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(15, 23, 42, 0.8)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Questions (Click for instant answer):
            </div>
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'thin',
              }}
            >
              {PRESET_QUESTIONS.map((questionText) => (
                <button
                  key={questionText}
                  type="button"
                  onClick={() => handleSendMessage(questionText)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '5px 12px',
                    background: 'rgba(99, 102, 241, 0.16)',
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    borderRadius: '999px',
                    color: '#e0e7ff',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.32)';
                    e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.16)';
                    e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.35)';
                  }}
                >
                  {questionText}
                </button>
              ))}
            </div>
          </div>

          {/* Message Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: isUser ? '#a5b4fc' : '#38bdf8',
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>{isUser ? 'YOU' : 'AI ASSISTANT'}</span>
                    <span style={{ color: '#64748b' }}>•</span>
                    <span style={{ color: '#64748b' }}>{msg.time}</span>
                  </div>

                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '12px 16px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                        : 'rgba(30, 41, 59, 0.95)',
                      color: '#ffffff',
                      border: isUser
                        ? '1px solid rgba(165, 180, 252, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxShadow: isUser
                        ? '0 4px 14px rgba(79, 70, 229, 0.3)'
                        : '0 4px 14px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                  AI ASSISTANT IS TYPING...
                </div>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(30, 41, 59, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    fontStyle: 'italic',
                  }}
                >
                  Analyzing event details...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(15, 23, 42, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask: 'Where is the event?', 'Chief guest', etc..."
              style={{
                flex: 1,
                padding: '12px 14px',
                background: 'rgba(30, 41, 59, 0.85)',
                border: '1.5px solid rgba(129, 140, 248, 0.35)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(165, 180, 252, 0.8)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(129, 140, 248, 0.35)')}
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              style={{
                padding: '12px 18px',
                background: inputText.trim()
                  ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
                  : 'rgba(75, 85, 99, 0.5)',
                border: '1px solid rgba(165, 180, 252, 0.4)',
                borderRadius: '10px',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </>
  );
}
