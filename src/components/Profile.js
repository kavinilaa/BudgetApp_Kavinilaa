import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/UserService';
import { useTheme } from '../contexts/ThemeContext';
import './Profile.css';

const Profile = () => {
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }
    
    // Fetch profile
    UserService.getProfile()
      .then(response => {
        setUser(response.data);
        setFormData(response.data);
        localStorage.setItem('fullName', response.data.fullName || '');
        if (response.data.profileImage) {
          localStorage.setItem('profileImage', response.data.profileImage);
        }
      })
      .catch(error => {
        console.log('Error fetching profile:', error);
      });
    
    // Fetch total income
    const token = localStorage.getItem('token');
    fetch('http://localhost:9090/transactions/incomes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(incomes => {
        if (Array.isArray(incomes)) {
          const total = incomes.reduce((sum, income) => sum + income.amount, 0);
          setTotalIncome(total);
        }
      })
      .catch(error => console.error('Error fetching income:', error));
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;
    
    if (selectedImage.size > 5 * 1024 * 1024) {
      alert('❌ Image too large. Please select an image smaller than 5MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      
      try {
        const response = await UserService.updateProfile({ profileImage: base64Image });
        setUser(response.data);
        setSelectedImage(null);
        setImagePreview(null);
        localStorage.setItem('profileImage', base64Image);
        alert('✅ Profile image updated!');
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('❌ Error: ' + (error.response?.data?.message || error.message));
      }
    };
    reader.readAsDataURL(selectedImage);
  };

  const handleDeleteImage = async () => {
    try {
      const response = await UserService.updateProfile({ profileImage: '' });
      setUser(response.data);
      setImagePreview(null);
      setSelectedImage(null);
      alert('✅ Profile image deleted!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('❌ Error deleting image');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const response = await UserService.updateProfile(formData);
      setUser(response.data);
      setFormData(response.data);
      localStorage.setItem('fullName', response.data.fullName || '');
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleResetData = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will delete ALL your transactions, budgets, and financial records.\n\nYour profile will remain, but all financial data will be lost permanently.\n\nAre you absolutely sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = window.prompt(
      'Type "RESET" in capital letters to confirm this action:'
    );
    
    if (doubleConfirm !== 'RESET') {
      alert('Reset cancelled. Text did not match.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:9090/user/reset-data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ All data has been reset successfully. Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        throw new Error(data.message || 'Failed to reset data');
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('❌ Error resetting data: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '🚨 FINAL WARNING: This will PERMANENTLY delete your entire account.\n\n- All your data will be erased\n- Your profile will be deleted\n- You will not be able to recover your account\n\nAre you absolutely sure?'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = window.prompt(
      'Type "DELETE MY ACCOUNT" in capital letters to confirm permanent deletion:'
    );
    
    if (doubleConfirm !== 'DELETE MY ACCOUNT') {
      alert('Account deletion cancelled. Text did not match.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:9090/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Your account has been deleted. You will be logged out now.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('❌ Error deleting account: ' + error.message);
    }
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container" style={{ background: colors.background, color: colors.text }}>
      <div className="profile-header">
        <div className="profile-image-section">
          <div className="profile-image-wrapper">
            <img 
              src={imagePreview || user.profileImage || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
              alt="Profile" 
              className="profile-image"
            />
            <div className="image-upload-overlay">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="image-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-btn">
                📷
              </label>
            </div>
          </div>
          {selectedImage && (
            <button onClick={handleImageUpload} className="save-image-btn">
              Save Image
            </button>
          )}
          {user.profileImage && isEditing && (
            <button onClick={handleDeleteImage} className="delete-image-btn">
              Delete Image
            </button>
          )}
        </div>
        
        <div className="profile-info">
          <h1>{user.fullName || user.username}</h1>
          <p className="username">@{user.username}</p>
          <p className="email">{user.email}</p>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="edit-profile-btn"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="profile-content">
        {/* Personal Details Section */}
        <div className="profile-section" style={{ background: colors.cardBackground, color: colors.text }}>
          <h2 style={{ color: colors.text }}>Personal Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              {isEditing ? (
                <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleInputChange} className="edit-input" />
              ) : (
                <span>{user.fullName || 'Not provided'}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Email</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="edit-input" />
              ) : (
                <span>{user.email}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Mobile</label>
              {isEditing ? (
                <input type="tel" name="mobile" value={formData.mobile || ''} onChange={handleInputChange} className="edit-input" />
              ) : (
                <span>{user.mobile || 'Not provided'}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Total Income</label>
              <span>{user.preferredCurrency || 'INR'} {totalIncome.toFixed(2)}</span>
            </div>
            
            <div className="info-item">
              <label>Preferred Currency</label>
              {isEditing ? (
                <select name="preferredCurrency" value={formData.preferredCurrency || ''} onChange={handleInputChange} className="edit-input">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              ) : (
                <span>{user.preferredCurrency || 'USD'}</span>
              )}
            </div>
            
            <div className="info-item full-width">
              <label>Financial Goal</label>
              {isEditing ? (
                <input type="text" name="financialGoal" value={formData.financialGoal || ''} onChange={handleInputChange} className="edit-input" placeholder="e.g., Save for a new laptop" />
              ) : (
                <span>{user.financialGoal || 'Not set'}</span>
              )}
            </div>
          </div>
          
          {isEditing && (
            <div className="edit-actions">
              <button onClick={handleSave} className="save-btn">Save Changes</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="profile-section" style={{ background: colors.cardBackground, color: colors.text }}>
          <h2 style={{ color: colors.text }}>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Username</label>
              <span>{user.username}</span>
            </div>
            
            <div className="info-item">
              <label>Member Since</label>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="info-item">
              <label>Account Status</label>
              <span className="status-active">Active</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="profile-section" style={{ borderTop: '3px solid #ff4444', background: colors.cardBackground, color: colors.text }}>
          <h2 style={{ color: '#ff4444' }}>⚠️ Danger Zone</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>These actions are irreversible. Please be certain before proceeding.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ 
              padding: '20px', 
              background: '#fff3cd', 
              borderRadius: '8px', 
              border: '1px solid #ffc107' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>Reset All Data</h3>
              <p style={{ margin: '0 0 15px 0', color: '#856404', fontSize: '14px' }}>
                This will delete all your transactions, budgets, and financial records. Your profile information will be preserved.
              </p>
              <button 
                onClick={handleResetData}
                style={{
                  padding: '10px 20px',
                  background: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.background = '#e0a800'}
                onMouseOut={(e) => e.target.style.background = '#ffc107'}
              >
                🗑️ Reset All Data
              </button>
            </div>

            <div style={{ 
              padding: '20px', 
              background: '#f8d7da', 
              borderRadius: '8px', 
              border: '1px solid #f5c2c7' 
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#842029' }}>Delete Account</h3>
              <p style={{ margin: '0 0 15px 0', color: '#842029', fontSize: '14px' }}>
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button 
                onClick={handleDeleteAccount}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.background = '#bb2d3b'}
                onMouseOut={(e) => e.target.style.background = '#dc3545'}
              >
                ❌ Delete Account Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;