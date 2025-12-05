import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

const AIAssistantPage = () => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI Financial Assistant. I can help you with budgeting advice, expense analysis, and financial planning. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessage = (content) => {
    // Split by lines and format
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for numbered lists
      if (/^\d+\./.test(trimmedLine)) {
        return (
          <div key={index} style={{ margin: '8px 0', paddingLeft: '10px' }}>
            <strong style={{ color: '#A084E8' }}>{trimmedLine}</strong>
          </div>
        );
      }
      
      // Check for bullet points
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        return (
          <div key={index} style={{ margin: '6px 0', paddingLeft: '15px', display: 'flex', alignItems: 'flex-start' }}>
            <span style={{ color: '#A084E8', marginRight: '8px', fontWeight: 'bold' }}>•</span>
            <span>{trimmedLine.substring(1).trim()}</span>
          </div>
        );
      }
      
      // Regular paragraphs
      return (
        <div key={index} style={{ margin: '10px 0', lineHeight: '1.6' }}>
          {trimmedLine}
        </div>
      );
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Get AI response from Ollama
    try {
      const aiContent = await getAIResponse(inputMessage);
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I encountered an error. Please make sure Ollama is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = async (message) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:9090/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      return data.response || 'I apologize, but I\'m having trouble processing your request right now. Please try again.';
    } catch (error) {
      console.error('AI API error:', error);
      return 'I\'m currently unable to connect to the AI service. Please try again later.';
    }
  };

  const quickActions = [
    'Help me create a budget',
    'Analyze my spending patterns',
    'Savings tips',
    'Debt management advice'
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: '280px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar profile={{ name: 'User', email: 'user@example.com' }} title="AI Assistant" />
        
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '1200px',
          margin: '20px auto 0',
          width: '100%',
          padding: '0 20px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              color: colors.text,
              fontSize: '32px',
              fontWeight: '700',
              margin: '0 0 8px 0'
            }}>
              🤖 AI Financial Assistant
            </h1>
            <p style={{ color: colors.textSecondary, margin: 0 }}>
              Get personalized financial advice and insights
            </p>
          </div>

          {/* Chat Container */}
          <div style={{
            flex: 1,
            background: colors.surface,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: `0 10px 30px ${colors.shadow}`,
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              maxHeight: '500px'
            }}>
              {messages.map((message) => (
                <div key={message.id} style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    padding: '15px 20px',
                    borderRadius: message.type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                    background: message.type === 'user' 
                      ? 'linear-gradient(135deg, #A084E8, #8B6FDE)'
                      : 'linear-gradient(135deg, #E7DDFF, #D4C5FF)',
                    color: message.type === 'user' ? 'white' : '#4A4A4A',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '16px', lineHeight: '1.5' }}>
                      {message.type === 'ai' ? formatMessage(message.content) : message.content}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      opacity: 0.7,
                      marginTop: '8px'
                    }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    padding: '15px 20px',
                    borderRadius: '20px 20px 20px 5px',
                    background: 'linear-gradient(135deg, #E7DDFF, #D4C5FF)',
                    color: '#4A4A4A'
                  }}>
                    <div style={{ fontSize: '16px' }}>AI is typing...</div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div style={{
              padding: '15px 20px',
              borderTop: '1px solid #f0f0f0',
              background: '#f8f9fa'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Quick actions:
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(action)}
                    style={{
                      background: 'white',
                      border: '1px solid #A084E8',
                      color: '#A084E8',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#A084E8';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'white';
                      e.target.style.color = '#A084E8';
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid #f0f0f0',
              background: 'white'
            }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your finances..."
                  style={{
                    flex: 1,
                    padding: '15px 20px',
                    border: '2px solid #E7DDFF',
                    borderRadius: '25px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#A084E8'}
                  onBlur={(e) => e.target.style.borderColor = '#E7DDFF'}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  style={{
                    background: inputMessage.trim() && !isTyping 
                      ? 'linear-gradient(135deg, #A084E8, #8B6FDE)'
                      : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    cursor: inputMessage.trim() && !isTyping ? 'pointer' : 'not-allowed',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;