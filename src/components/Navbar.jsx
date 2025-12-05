import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';

function Navbar({ profile, title = "BudgetLy" }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "16px 32px",
      background: colors.surface,
      boxShadow: `0 2px 10px ${colors.shadow}`,
      alignItems: "center",
      borderBottom: `1px solid ${colors.border}`
    }}>
      <h2 style={{
        cursor: "pointer",
        color: colors.primary,
        fontSize: "24px",
        fontWeight: "700",
        margin: 0
      }} onClick={() => navigate("/")}>{title}</h2>

      <div style={{ position: "relative" }} ref={dropdownRef}>
        <div 
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span style={{
            color: colors.text,
            fontWeight: "500",
            fontSize: "16px"
          }}>
            {localStorage.getItem('fullName') || localStorage.getItem('username') || profile?.name || "User"}
          </span>
          
          <img
            src={localStorage.getItem('profileImage') || profile?.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: `2px solid ${colors.border}`,
              objectFit: "cover"
            }}
          />
        </div>

        {showDropdown && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "8px",
            background: colors.surface,
            borderRadius: "12px",
            boxShadow: `0 8px 25px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            minWidth: "180px",
            zIndex: 1000
          }}>
            <div
              onClick={() => {
                navigate("/profile");
                setShowDropdown(false);
              }}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#333",
                fontSize: "14px"
              }}
              onMouseOver={(e) => e.target.style.background = "#f8f9fa"}
              onMouseOut={(e) => e.target.style.background = "white"}
            >
              <span>👤</span> Profile
            </div>
            
            <div
              onClick={() => {
                setShowDropdown(false);
              }}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#333",
                fontSize: "14px"
              }}
              onMouseOver={(e) => e.target.style.background = "#f8f9fa"}
              onMouseOut={(e) => e.target.style.background = "white"}
            >
              <span>⚙</span> Settings
            </div>
            
            <div
              onClick={() => {
                handleLogout();
                setShowDropdown(false);
              }}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#ff6b6b",
                fontSize: "14px",
                borderRadius: "0 0 12px 12px"
              }}
              onMouseOver={(e) => e.target.style.background = "#fff5f5"}
              onMouseOut={(e) => e.target.style.background = "white"}
            >
              <span>→</span> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
