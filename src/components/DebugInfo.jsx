'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import useUser from '@/hooks/useUser';

const DebugInfo = () => {
  const [cookies, setCookies] = useState({});
  const { username, level, token_status, isLogged } = useUser();

  useEffect(() => {
    // Get all cookies
    const allCookies = {
      username: Cookies.get('username'),
      level: Cookies.get('level'),
      refresh_token: Cookies.get('refresh_token'),
      access_token: Cookies.get('access_token'),
    };
    setCookies(allCookies);
    
    console.log('🍪 All Cookies:', allCookies);
    console.log('👤 User State:', { username, level, token_status, isLogged });
  }, [username, level, token_status, isLogged]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>Debug Info</h4>
      <p>Username: {username || 'null'}</p>
      <p>Level: {level || 'null'}</p>
      <p>Token Status: {token_status || 'null'}</p>
      <p>Is Logged: {isLogged ? 'Yes' : 'No'}</p>
      <hr />
      <p>Cookies:</p>
      {Object.entries(cookies).map(([key, value]) => (
        <p key={key}>{key}: {value ? '✓' : '✗'}</p>
      ))}
    </div>
  );
};

export default DebugInfo;