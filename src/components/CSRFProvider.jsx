'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from '@/config/axiosConfig'

const CSRFContext = createContext()

export function CSRFProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCSRFToken = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await axios.get('/api/csrf')
      
      if (response.data.success) {
        setCsrfToken(response.data.csrfToken)
        
        // Add token to meta tag for form submissions
        let metaTag = document.querySelector('meta[name="csrf-token"]')
        if (!metaTag) {
          metaTag = document.createElement('meta')
          metaTag.name = 'csrf-token'
          document.head.appendChild(metaTag)
        }
        metaTag.content = response.data.csrfToken
      } else {
        throw new Error('Failed to fetch CSRF token')
      }
    } catch (err) {
      console.error('Error fetching CSRF token:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshCSRFToken = useCallback(async () => {
    await fetchCSRFToken()
  }, [fetchCSRFToken])

  useEffect(() => {
    fetchCSRFToken()

    // Refresh token every 25 minutes (before 30-minute expiry)
    const interval = setInterval(() => {
      fetchCSRFToken()
    }, 25 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchCSRFToken])

  // Axios interceptor to automatically add CSRF token
  useEffect(() => {
    if (!csrfToken) return

    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Add CSRF token to requests that modify data
        if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
          config.headers['X-CSRF-Token'] = csrfToken
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // If CSRF token is invalid, refresh it
        if (error.response?.status === 403 && 
            error.response?.data?.message?.includes('CSRF')) {
          console.log('CSRF token invalid, refreshing...')
          await refreshCSRFToken()
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [csrfToken, refreshCSRFToken])

  const value = {
    csrfToken,
    isLoading,
    error,
    refreshCSRFToken
  }

  return (
    <CSRFContext.Provider value={value}>
      {children}
    </CSRFContext.Provider>
  )
}

export function useCSRF() {
  const context = useContext(CSRFContext)
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider')
  }
  return context
}

export default CSRFProvider