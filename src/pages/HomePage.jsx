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
        
        {/* Main Content Area */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px"
        }}>
          <div style={{
            background: "white",
            padding: "50px 40px",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            textAlign: "center",
            maxWidth: "700px",
            width: "100%"
          }}>
            <h1 style={{
              color: "#1A237E",
              fontSize: "36px",
              fontWeight: "700",
              margin: "0 0 16px 0",
              letterSpacing: "-0.5px"
            }}>Welcome, {profile?.name || "User"}!</h1>
            <p style={{
              color: "#546E7A",
              fontSize: "17px",
              margin: "0 0 32px 0",
              lineHeight: "1.7"
            }}>We help you keep track of your money and suggest ways to improve your finances. Use the navigation on the left to get started.</p>
            
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate('/dashboard')} style={{
                background: "linear-gradient(135deg, #5C6BC0 0%, #3F51B5 100%)",
                color: "white", border: "none", padding: "14px 28px", borderRadius: "10px",
                cursor: "pointer", fontSize: "15px", fontWeight: "600",
                boxShadow: "0 4px 12px rgba(92, 107, 192, 0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(92, 107, 192, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(92, 107, 192, 0.3)";
              }}>📊 View Dashboard</button>
              <button onClick={() => navigate('/analytics')} style={{
                background: "linear-gradient(135deg, #7E57C2 0%, #673AB7 100%)",
                color: "white", border: "none", padding: "14px 28px", borderRadius: "10px",
                cursor: "pointer", fontSize: "15px", fontWeight: "600",
                boxShadow: "0 4px 12px rgba(126, 87, 194, 0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(126, 87, 194, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(126, 87, 194, 0.3)";
              }}>📈 View Analytics</button>
              <button onClick={() => navigate('/add-transaction')} style={{
                background: "linear-gradient(135deg, #26A69A 0%, #00897B 100%)",
                color: "white", border: "none", padding: "14px 28px", borderRadius: "10px",
                cursor: "pointer", fontSize: "15px", fontWeight: "600",
                boxShadow: "0 4px 12px rgba(38, 166, 154, 0.3)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(38, 166, 154, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(38, 166, 154, 0.3)";
              }}>+ Add Transaction</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;