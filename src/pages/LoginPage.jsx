import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username || email.split('@')[0]);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", res.data.userId);
      console.log("Login successful, userId stored:", res.data.userId);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #E7DDFF 0%, #F5F2FF 50%, #FFFFFF 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative"
    }}>
      {/* Decorative circles */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "10%",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background: "rgba(231, 221, 255, 0.3)",
        zIndex: 0
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "15%",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        background: "rgba(231, 221, 255, 0.2)",
        zIndex: 0
      }}></div>
      
      <div style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "50px 40px",
        borderRadius: "24px",
        boxShadow: "0 25px 50px rgba(231, 221, 255, 0.3)",
        width: "100%",
        maxWidth: "420px",
        border: "1px solid rgba(231, 221, 255, 0.5)",
        position: "relative",
        zIndex: 1
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #E7DDFF, #D4C5FF)",
            borderRadius: "50%",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "white",
            fontWeight: "bold"
          }}>→</div>
          <h1 style={{ color: "#4A4A4A", fontSize: "32px", fontWeight: "700", margin: "0 0 8px 0" }}>Welcome Back</h1>
          <p style={{ color: "#8B8B8B", margin: 0, fontSize: "16px" }}>Sign in to continue your journey</p>
        </div>

        {error && (
          <div style={{
            background: "rgba(255, 107, 107, 0.1)",
            color: "#D63031",
            padding: "14px 16px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid rgba(255, 107, 107, 0.2)",
            fontSize: "14px"
          }}>{error}</div>
        )}

        {showSuccess && (
          <div style={{
            background: "rgba(0, 184, 148, 0.1)",
            color: "#00B894",
            padding: "14px 16px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid rgba(0, 184, 148, 0.2)",
            textAlign: "center",
            fontSize: "14px"
          }}>Login successful! Redirecting...</div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ position: "relative" }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "2px solid #E7DDFF",
                borderRadius: "16px",
                fontSize: "16px",
                outline: "none",
                background: "rgba(231, 221, 255, 0.05)",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4C5FF";
                e.target.style.background = "rgba(231, 221, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E7DDFF";
                e.target.style.background = "rgba(231, 221, 255, 0.05)";
              }}
            />
          </div>
          
          <div style={{ position: "relative" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "16px 20px",
                border: "2px solid #E7DDFF",
                borderRadius: "16px",
                fontSize: "16px",
                outline: "none",
                background: "rgba(231, 221, 255, 0.05)",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#D4C5FF";
                e.target.style.background = "rgba(231, 221, 255, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E7DDFF";
                e.target.style.background = "rgba(231, 221, 255, 0.05)";
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #E7DDFF 0%, #D4C5FF 100%)",
              color: "#4A4A4A",
              padding: "16px",
              border: "none",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 8px 20px rgba(231, 221, 255, 0.4)"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 25px rgba(231, 221, 255, 0.5)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 20px rgba(231, 221, 255, 0.4)";
            }}
          >
            <b>Sign In</b>
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <span style={{ color: "#8B8B8B", fontSize: "15px" }}>Don't have an account? </span>
          <span
            style={{ color: "#A084E8", cursor: "pointer", fontWeight: "600", fontSize: "15px" }}
            onClick={() => navigate("/register")}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
