import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function HomePage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setProfile(res.data))
        .catch(err => {
          console.log("Profile fetch failed:", err);
          setProfile({ name: "User", email: "user@example.com" });
        });
    }
  }, []);

  if (!profile) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ color: "#A084E8", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: "280px",
        minHeight: "100vh",
        background: "#E8EAF6",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar profile={profile} />
        
        <div style={{ flex: 1, padding: "40px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
              <h1 style={{ fontSize: "48px", fontWeight: "800", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 16px 0" }}>Welcome to BudgetLy! 💰</h1>
              <p style={{ fontSize: "20px", color: "#666", maxWidth: "600px", margin: "0 auto" }}>Your personal finance companion. Track, analyze, and optimize your spending habits.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
              {[{icon: "📊", title: "Dashboard", desc: "Overview of your finances", path: "/dashboard", color: "#667eea"}, {icon: "💳", title: "Transactions", desc: "Manage income & expenses", path: "/transactions", color: "#f093fb"}, {icon: "📈", title: "Analytics", desc: "Visualize spending trends", path: "/analytics", color: "#4facfe"}, {icon: "💰", title: "Budget", desc: "Set and track budgets", path: "/budget", color: "#43e97b"}].map((item, i) => (
                <div key={i} onClick={() => navigate(item.path)} style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", cursor: "pointer", transition: "all 0.3s ease", border: "2px solid transparent" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)"; e.currentTarget.style.borderColor = item.color; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "transparent"; }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>{item.icon}</div>
                  <h3 style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 8px 0", color: "#333" }}>{item.title}</h3>
                  <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "40px", borderRadius: "20px", textAlign: "center", color: "white" }}>
              <h2 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 16px 0" }}>Ready to take control? 🚀</h2>
              <p style={{ fontSize: "16px", margin: "0 0 24px 0", opacity: 0.9 }}>Start by adding your first transaction or explore your dashboard</p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => navigate('/transactions')} style={{ background: "white", color: "#667eea", border: "none", padding: "14px 32px", borderRadius: "10px", cursor: "pointer", fontSize: "16px", fontWeight: "600", transition: "all 0.2s ease" }} onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.target.style.transform = "scale(1)"}> Add Transaction</button>
                <button onClick={() => navigate('/dashboard')} style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid white", padding: "14px 32px", borderRadius: "10px", cursor: "pointer", fontSize: "16px", fontWeight: "600", transition: "all 0.2s ease" }} onMouseEnter={(e) => { e.target.style.background = "white"; e.target.style.color = "#667eea"; }} onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.color = "white"; }}>View Dashboard</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;