import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { createClient } from "@supabase/supabase-js";

// Types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
  status?: number;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    return error.response?.status === 429 || error.response?.status >= 500;
  },
};

// Custom error class
export class ApiClientError extends Error {
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly status?: number;

  constructor(
    message: string,
    code?: string,
    details?: unknown,
    status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

// API Client class
export class ApiClient {
  private client: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(
    baseURL: string = API_BASE_URL,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
  ) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.retryConfig = retryConfig;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (
          originalRequest &&
          this.shouldRetry(error) &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          await this.delay(this.retryConfig.retryDelay);
          return this.client(originalRequest);
        }

        return Promise.reject(this.transformError(error));
      },
    );
  }

  private getAuthToken(): string | null {
    // This will be implemented based on your auth system
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!this.retryConfig.retryCondition) return false;
    return this.retryConfig.retryCondition(error);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private transformError(error: AxiosError): ApiClientError {
    const responseData = error.response?.data as
      | Record<string, unknown>
      | undefined;
    const message =
      (responseData?.message as string) ||
      error.message ||
      "An unexpected error occurred";
    const code = (responseData?.code as string) || error.code;
    const details = responseData?.details || responseData;
    const status = error.response?.status;

    return new ApiClientError(message, code, details, status);
  }

  // HTTP methods
  async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<T>(url, config);
    return { data: response.data, status: response.status };
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<T>(url, config);
    return { data: response.data, status: response.status };
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Supabase client for real-time features
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default apiClient;
