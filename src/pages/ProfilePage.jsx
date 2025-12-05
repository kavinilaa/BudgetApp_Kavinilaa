import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Profile from "../components/Profile";
import { useTheme } from '../contexts/ThemeContext';

function ProfilePage() {
  const { colors } = useTheme();
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Profile" />
        <Profile />
      </div>
    </div>
  );
}

export default ProfilePage;