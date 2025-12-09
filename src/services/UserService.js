import axios from "axios";

const API_URL = "http://localhost:9090/user";

class UserService {
  getProfile() {
    const token = localStorage.getItem('token');
    return axios.get(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  updateProfile(data) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/profile`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  uploadProfileImage(formData) {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/upload-image`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  }

  deleteProfileImage() {
    const token = localStorage.getItem('token');
    return axios.delete(`${API_URL}/delete-image`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}

export default new UserService();
