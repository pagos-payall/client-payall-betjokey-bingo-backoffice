'use client';
import { useEffect, useContext, useRef } from 'react';
import UsersContext from '@/context/users/UsersContext';

const TokenStatusWatcher = () => {
  const { setTokenStatus, token_status } = useContext(UsersContext);
  const lastTokenStatus = useRef(null);

  useEffect(() => {
    // Function to check headers on page navigation  
    const checkTokenStatus = () => {
      // Get token status from meta tag (set by middleware)
      const tokenStatusMeta = document.querySelector('meta[name="token-status"]');
      const tokenStatus = tokenStatusMeta?.getAttribute('content');

      // Only update if status actually changed from what we last saw
      if (tokenStatus && tokenStatus !== lastTokenStatus.current) {
        console.log('🔄 Token status changed from', lastTokenStatus.current, 'to', tokenStatus);
        lastTokenStatus.current = tokenStatus;
        
        if (tokenStatus === 'expired') {
          setTokenStatus(false); // This triggers isExpired = true
        } else if (tokenStatus === 'active') {
          setTokenStatus(true); // This triggers isLogged = true
        }
      }
    };

    // Check on initial load only - do NOT re-run on setTokenStatus changes
    checkTokenStatus();
  }, []); // Empty dependency array to prevent infinite loops

  return null; // This component doesn't render anything
};

export default TokenStatusWatcher;