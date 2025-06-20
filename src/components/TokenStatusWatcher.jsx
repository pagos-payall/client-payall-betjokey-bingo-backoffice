'use client';
import { useEffect, useContext, useRef } from 'react';
import UsersContext from '@/context/users/UsersContext';
import tokenManager from '@/services/tokenManager';

const TokenStatusWatcher = () => {
  const { setTokenStatus, token_status } = useContext(UsersContext);
  const lastTokenStatus = useRef(null);

  useEffect(() => {
    // Function to check headers on page navigation  
    const checkTokenStatus = () => {
      // Get token status from meta tag (set by middleware)
      const tokenStatusMeta = document.querySelector('meta[name="token-status"]');
      const tokenStatus = tokenStatusMeta?.getAttribute('content');
      
      // Get token expiry time
      const tokenExpiryMeta = document.querySelector('meta[name="token-expiry"]');
      const tokenExpiry = tokenExpiryMeta?.getAttribute('content');

      // Only update if status actually changed from what we last saw
      if (tokenStatus && tokenStatus !== lastTokenStatus.current) {
        console.log('🔄 Token status changed from', lastTokenStatus.current, 'to', tokenStatus);
        lastTokenStatus.current = tokenStatus;
        
        if (tokenStatus === 'expired') {
          setTokenStatus(false); // This triggers isExpired = true
          tokenManager.notifySubscribers({ status: 'expired' });
        } else if (tokenStatus === 'active') {
          setTokenStatus(true); // This triggers isLogged = true
          // Schedule automatic refresh if we have expiry time
          if (tokenExpiry) {
            tokenManager.scheduleTokenRefresh();
          }
        }
      }
    };

    // Check on initial load
    checkTokenStatus();
    
    // Subscribe to token manager events
    const unsubscribe = tokenManager.subscribe((event) => {
      if (event.status === 'active') {
        setTokenStatus(true);
        lastTokenStatus.current = 'active';
      } else if (event.status === 'expired' || event.status === 'failed') {
        setTokenStatus(false);
        lastTokenStatus.current = 'expired';
      }
    });
    
    // Listen for custom token-expired event (triggered by 403 errors)
    const handleTokenExpired = () => {
      console.log('🔴 Token expired event received');
      checkTokenStatus();
    };
    
    window.addEventListener('token-expired', handleTokenExpired);
    
    return () => {
      unsubscribe();
      window.removeEventListener('token-expired', handleTokenExpired);
    };
  }, []); // Empty dependency array to prevent infinite loops

  return null; // This component doesn't render anything
};

export default TokenStatusWatcher;