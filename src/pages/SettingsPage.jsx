import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

function SettingsPage() {
  const { isDarkMode, toggleDarkMode, colors } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <Navbar title="Settings" />
        <div style={{
          padding: '30px',
          background: colors.background,
          minHeight: 'calc(100vh - 80px)',
          color: colors.text
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '30px'
            }}>Settings</h1>

            {/* Appearance Section */}
            <div style={{
              background: colors.surface,
              borderRadius: '15px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: `0 5px 15px ${colors.shadow}`
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '20px',
                borderBottom: `2px solid ${colors.border}`,
                paddingBottom: '10px'
              }}>Appearance</h2>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 0'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: colors.text,
                    margin: '0 0 5px 0'
                  }}>Dark Mode</h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: colors.textSecondary,
                    margin: 0
                  }}>Switch between light and dark themes</p>
                </div>

                <div
                  onClick={toggleDarkMode}
                  style={{
                    width: '60px',
                    height: '30px',
                    borderRadius: '15px',
                    background: isDarkMode ? colors.primary : colors.border,
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    left: isDarkMode ? '32px' : '2px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    {isDarkMode ? '🌙' : '☀️'}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div style={{
              background: colors.surface,
              borderRadius: '15px',
              padding: '30px',
              marginBottom: '30px',
              boxShadow: `0 5px 15px ${colors.shadow}`
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '20px',
                borderBottom: `2px solid ${colors.border}`,
                paddingBottom: '10px'
              }}>Preferences</h2>

              <div style={{
                display: 'grid',
                gap: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: `1px solid ${colors.border}`
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.text,
                      margin: '0 0 5px 0'
                    }}>Currency</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: colors.textSecondary,
                      margin: 0
                    }}>Default currency for transactions</p>
                  </div>
                  <select style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `2px solid ${colors.border}`,
                    background: colors.inputBackground,
                    color: colors.text,
                    fontSize: '14px'
                  }}>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0',
                  borderBottom: `1px solid ${colors.border}`
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.text,
                      margin: '0 0 5px 0'
                    }}>Language</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: colors.textSecondary,
                      margin: 0
                    }}>Application language</p>
                  </div>
                  <select style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `2px solid ${colors.border}`,
                    background: colors.inputBackground,
                    color: colors.text,
                    fontSize: '14px'
                  }}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 0'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.text,
                      margin: '0 0 5px 0'
                    }}>Notifications</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: colors.textSecondary,
                      margin: 0
                    }}>Enable budget alerts and reminders</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: colors.primary
                    }}
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div style={{
              background: colors.surface,
              borderRadius: '15px',
              padding: '30px',
              boxShadow: `0 5px 15px ${colors.shadow}`
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '20px',
                borderBottom: `2px solid ${colors.border}`,
                paddingBottom: '10px'
              }}>About</h2>

              <div style={{
                display: 'grid',
                gap: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ color: colors.textSecondary }}>Version</span>
                  <span style={{ color: colors.text, fontWeight: '600' }}>1.0.0</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ color: colors.textSecondary }}>Build</span>
                  <span style={{ color: colors.text, fontWeight: '600' }}>2025.01.01</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ color: colors.textSecondary }}>Developer</span>
                  <span style={{ color: colors.text, fontWeight: '600' }}>BudgetLy Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;