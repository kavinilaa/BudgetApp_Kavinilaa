import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Profile from "../components/Profile";

function ProfilePage() {
  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: "280px",
        minHeight: "100vh",
        background: "#E8EAF6"
      }}>
        <Navbar />
        <Profile />
      </div>
    </>
  );
}

export default ProfilePage;