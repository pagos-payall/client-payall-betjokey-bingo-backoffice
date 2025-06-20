/**
 * Centralized Token Management Service
 * Handles all token-related operations to prevent race conditions
 * and ensure consistent state across the application
 */

class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.subscribers = new Set();
    this.tokenExpiryTimeout = null;
    this.refreshAttempts = 0;
    this.maxRefreshAttempts = 3;
    
    // Token expiry times (in ms)
    this.ACCESS_TOKEN_DURATION = 15 * 60 * 1000; // 15 minutes
    this.REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.REFRESH_BUFFER = 60 * 1000; // Refresh 1 minute before expiry
  }

  /**
   * Subscribe to token status changes
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notify all subscribers of token status change
   */
  notifySubscribers(status) {
    this.subscribers.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Token subscriber error:', error);
      }
    });
  }

  /**
   * Get current token expiry time from metadata
   */
  getTokenExpiry() {
    if (typeof document === 'undefined') return null;
    
    const expiryMeta = document.querySelector('meta[name="token-expiry"]');
    if (expiryMeta) {
      const expiry = parseInt(expiryMeta.getAttribute('content'));
      return isNaN(expiry) ? null : expiry;
    }
    return null;
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    const now = Date.now();
    return now >= expiry;
  }

  /**
   * Check if token needs refresh (before actual expiry)
   */
  needsRefresh() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    const now = Date.now();
    return now >= (expiry - this.REFRESH_BUFFER);
  }

  /**
   * Schedule automatic token refresh before expiry
   */
  scheduleTokenRefresh() {
    // Clear any existing timeout
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
    }

    const expiry = this.getTokenExpiry();
    if (!expiry) return;

    const now = Date.now();
    const timeUntilRefresh = Math.max(0, expiry - now - this.REFRESH_BUFFER);

    // Schedule refresh
    this.tokenExpiryTimeout = setTimeout(() => {
      console.log('🔄 Auto-refreshing token before expiry');
      this.refreshToken();
    }, timeUntilRefresh);
  }

  /**
   * Refresh the authentication token
   * Prevents multiple simultaneous refresh attempts
   */
  async refreshToken() {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      console.log('🔄 Token refresh already in progress');
      return this.refreshPromise;
    }

    // Check if we've exceeded max attempts
    if (this.refreshAttempts >= this.maxRefreshAttempts) {
      console.error('❌ Max refresh attempts reached');
      this.notifySubscribers({ status: 'failed', reason: 'max_attempts' });
      throw new Error('Max refresh attempts reached');
    }

    // Create refresh promise
    this.refreshPromise = this._performRefresh()
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  /**
   * Perform the actual token refresh
   */
  async _performRefresh() {
    try {
      this.refreshAttempts++;
      this.notifySubscribers({ status: 'refreshing' });

      // Use fetch with the base URL from window location
      const baseUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : '';
      
      // Call the backend API directly
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiHost}${apiUrl}/auth`, {
        method: 'HEAD',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }

      // Reset attempts on success
      this.refreshAttempts = 0;
      
      // Update token expiry metadata (15 minutes from now)
      this.updateTokenMetadata();
      
      // Schedule next refresh
      this.scheduleTokenRefresh();
      
      // Notify success
      this.notifySubscribers({ status: 'active', refreshed: true });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.notifySubscribers({ status: 'expired', error: error.message });
      throw error;
    }
  }

  /**
   * Update token metadata after refresh
   */
  updateTokenMetadata() {
    if (typeof document === 'undefined') return;
    
    // Update expiry time (15 minutes from now)
    const newExpiry = Date.now() + this.ACCESS_TOKEN_DURATION;
    const expiryMeta = document.querySelector('meta[name="token-expiry"]');
    if (expiryMeta) {
      expiryMeta.setAttribute('content', newExpiry.toString());
    }

    // Update token status
    const statusMeta = document.querySelector('meta[name="x-token-status"]');
    if (statusMeta) {
      statusMeta.setAttribute('content', 'active');
    }
  }

  /**
   * Clear all token-related data
   */
  clearTokens() {
    if (this.tokenExpiryTimeout) {
      clearTimeout(this.tokenExpiryTimeout);
    }
    this.refreshPromise = null;
    this.refreshAttempts = 0;
    this.notifySubscribers({ status: 'logged_out' });
  }

  /**
   * Get pending requests that need retry after refresh
   */
  getPendingRequests() {
    return this.pendingRequests || [];
  }

  /**
   * Add request to retry queue
   */
  addPendingRequest(request) {
    if (!this.pendingRequests) {
      this.pendingRequests = [];
    }
    this.pendingRequests.push(request);
  }

  /**
   * Clear and return all pending requests
   */
  flushPendingRequests() {
    const requests = this.pendingRequests || [];
    this.pendingRequests = [];
    return requests;
  }
}

// Export singleton instance
export default new TokenManager();