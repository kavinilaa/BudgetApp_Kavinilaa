import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';

function Sidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/transactions", icon: "💳", label: "Transactions" },
    { path: "/budget", icon: "💰", label: "Budget" },
    { path: "/savings", icon: "🏦", label: "Savings" },
    { path: "/analytics", icon: "📈", label: "Trends" },
    { path: "/profile", icon: "👤", label: "Profile" },
    { path: "/forum", icon: "💬", label: "Forum" },
    { path: "/export", icon: "📥", label: "Export" },
    { path: "/ai-assistant", icon: "🤖", label: "AI Assistant" },
    { path: "/settings", icon: "⚙️", label: "Settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div 
      style={{
        width: "280px",
        height: "100vh",
        background: colors.sidebarGradient,
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        boxSizing: "border-box",
        position: "fixed",
        left: 0,
        top: 0,
        overflowY: "auto",
        boxShadow: "2px 0 10px rgba(0,0,0,0.05)"
      }}
    >
      {/* Logo/Brand Section */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "24px",
        padding: "8px"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.primaryLight})`,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px"
        }}>📱</div>
        <h2 style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: "700",
          color: colors.primary,
          letterSpacing: "-0.5px"
        }}>BudgetLy</h2>
      </div>

      {/* Search Bar */}
      <div style={{
        position: "relative",
        marginBottom: "24px"
      }}>
        <div style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "18px",
          color: colors.textMuted
        }}>🔍</div>
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 12px 12px 40px",
            border: `2px solid ${colors.border}`,
            borderRadius: "12px",
            background: colors.inputBackground,
            fontSize: "14px",
            color: colors.text,
            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s ease"
          }}
          onFocus={(e) => {
            e.target.style.background = colors.surface;
            e.target.style.borderColor = colors.primary;
            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.background = colors.inputBackground;
            e.target.style.borderColor = colors.border;
            e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.08)";
          }}
        />
      </div>

      {/* Menu Items */}
      <nav style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: isActive(item.path) ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primaryLight} 100%)` : colors.surfaceLight,
              boxShadow: isActive(item.path) ? `0 2px 8px ${colors.shadow}` : "none",
              color: isActive(item.path) ? colors.primary : colors.text,
              fontWeight: isActive(item.path) ? "600" : "500"
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = colors.surfaceLight;
                e.currentTarget.style.transform = "translateX(4px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.path)) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }
            }}
          >
            <span style={{
              fontSize: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px"
            }}>{item.icon}</span>
            <span style={{
              fontSize: "15px",
              flex: 1,
              letterSpacing: "0.2px"
            }}>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: "20px" }}></div>

      {/* Footer or Additional Info */}
      <div style={{
        marginTop: "16px",
        padding: "12px",
        background: colors.surfaceLight,
        borderRadius: "10px",
        textAlign: "center",
        border: `1px solid ${colors.border}`
      }}>
        <p style={{
          margin: 0,
          fontSize: "11px",
          color: colors.textMuted,
          fontWeight: "500"
        }}>Budget App © 2025</p>
      </div>
    </div>
  );
}

export default Sidebar;
