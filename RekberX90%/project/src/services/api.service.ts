import { errorService } from './error.service';
import { NetworkError } from '../types/errors';

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiService {
  private baseURL: string;
  private defaultTimeout = 10000;
  private defaultRetries = 3;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = 1000
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestConfig: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      signal: controller.signal
    };

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    let lastError: any;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🌐 API Request (attempt ${attempt}):`, { method, url, body });

        const response = await fetch(url, requestConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          const networkError = errorService.createNetworkError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            endpoint
          );

          // Don't retry client errors (4xx)
          if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
            throw networkError;
          }

          lastError = networkError;
          
          if (attempt === retries) {
            throw networkError;
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          continue;
        }

        const data = await response.json();
        console.log('✅ API Response:', data);
        return data;

      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          const timeoutError = errorService.createNetworkError(
            'Request timeout',
            408,
            endpoint
          );
          lastError = timeoutError;
          
          if (attempt === retries) {
            throw timeoutError;
          }
        } else if (error instanceof TypeError && error.message.includes('fetch')) {
          const networkError = errorService.createNetworkError(
            'Network connection failed',
            undefined,
            endpoint
          );
          lastError = networkError;
          
          if (attempt === retries) {
            throw networkError;
          }
        } else {
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    throw lastError;
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create default instance
export const apiService = new ApiService();