import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

/**
 * Synchronize auth cookies between JWT tokens and user context
 * This ensures compatibility between the middleware (JWT) and context (username/level) systems
 */
export const syncAuthCookies = () => {
  try {
    // Try to get the access token
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    
    if (accessToken || refreshToken) {
      // Decode the token to get user info
      const token = accessToken || refreshToken;
      const decoded = jwtDecode(token);
      
      // Extract username and level from the JWT
      const username = decoded.username || decoded.sub || decoded.user;
      const level = decoded.level || decoded.role || decoded.user_role;
      
      if (username && level) {
        // Set the cookies that the UserContext expects
        Cookies.set('username', username, {
          expires: 0.29, // ~7 hours
          path: '/',
          sameSite: 'strict',
        });
        
        Cookies.set('level', level, {
          expires: 0.29,
          path: '/',
          sameSite: 'strict',
        });
        
        return { username, level };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Clear all auth-related cookies
 */
export const clearAuthCookies = () => {
  Cookies.remove('username', { path: '/' });
  Cookies.remove('level', { path: '/' });
  Cookies.remove('access_token', { path: '/' });
  Cookies.remove('refresh_token', { path: '/' });
};