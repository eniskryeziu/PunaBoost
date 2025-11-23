import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7227/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const getErrorMessage = (data: any): string | string[] => {
  if (typeof data === 'string') {
    return data;
  }
  
  if (Array.isArray(data) && data.length > 0) {
    const descriptions: string[] = [];
    for (const item of data) {
      if (item && typeof item === 'object' && item.description) {
        descriptions.push(item.description);
      } else if (typeof item === 'string') {
        descriptions.push(item);
      }
    }
    if (descriptions.length > 0) {
      return descriptions;
    }
  }
  
  if (data && typeof data === 'object') {
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return typeof data.error === 'string' ? data.error : data.error.message || String(data.error);
    }
    
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages: string[] = [];
      for (const key in data.errors) {
        if (Array.isArray(data.errors[key])) {
          errorMessages.push(...data.errors[key]);
        } else {
          errorMessages.push(String(data.errors[key]));
        }
      }
      if (errorMessages.length > 0) {
        return errorMessages.join(', ');
      }
    }
    
    if (data.title) {
      return data.title;
    }
  }
  
  return 'An error occurred';
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const requestUrl = error.config?.url || '';
      const isLoginEndpoint = requestUrl.includes('/account/login');
      const hasToken = !!localStorage.getItem('token');

      if (status === 401) {
        if (isLoginEndpoint) {
          const message = getErrorMessage(data) || 'Invalid credentials. Please check your email and password.';
          if (Array.isArray(message)) {
            message.forEach((desc) => toast.error(desc));
          } else {
            toast.error(message);
          }
        } else if (hasToken) {
          const isEnrichmentEndpoint = 
            requestUrl.includes('/company/my-company') || 
            requestUrl.includes('/candidate') && requestUrl.includes('/all');
          
          if (isEnrichmentEndpoint) {
            return Promise.reject(error);
          }
      
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          toast.error('Session expired. Please login again.');
        } else {
          const message = getErrorMessage(data) || 'Unauthorized. Please login.';
          if (Array.isArray(message)) {
            message.forEach((desc) => toast.error(desc));
          } else {
            toast.error(message);
          }
        }
      } else if (status === 403) {
        const message = getErrorMessage(data) || 'You do not have permission to perform this action.';
        if (Array.isArray(message)) {
          message.forEach((desc) => toast.error(desc));
        } else {
          toast.error(message);
        }
      } else if (status === 404) {
        const message = getErrorMessage(data) || 'Resource not found.';
        if (Array.isArray(message)) {
          message.forEach((desc) => toast.error(desc));
        } else {
          toast.error(message);
        }
      } else if (status === 400) {
        const message = getErrorMessage(data);
        if (Array.isArray(message)) {
          message.forEach((desc) => toast.error(desc));
        } else {
          toast.error(message);
        }
      } else if (status >= 500) {
        const message = getErrorMessage(data) || 'Server error. Please try again later.';
        if (Array.isArray(message)) {
          message.forEach((desc) => toast.error(desc));
        } else {
          toast.error(message);
        }
      } else {
        const message = getErrorMessage(data);
        if (Array.isArray(message)) {
          message.forEach((desc) => toast.error(desc));
        } else {
          toast.error(message);
        }
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

export default api;

