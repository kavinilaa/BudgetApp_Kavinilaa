import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      localStorage.setItem('google_auth_code', code);
      navigate('/export');
    } else {
      navigate('/export');
    }
  }, [navigate]);

  return <div style={{ padding: '50px', textAlign: 'center' }}>Processing authorization...</div>;
}

export default OAuthCallback;
