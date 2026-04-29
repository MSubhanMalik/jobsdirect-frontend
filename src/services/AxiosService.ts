import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "@/config/environment";
import { api } from "@/config/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  status: number;
  data: T;
}

// ---------------------------------------------------------------------------
// Token helpers (localStorage – matching existing jd_access pattern)
// ---------------------------------------------------------------------------

const ACCESS_TOKEN_KEY = "jd_access";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

// ---------------------------------------------------------------------------
// Axios singleton
// ---------------------------------------------------------------------------

class AxiosService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
    config: InternalAxiosRequestConfig;
  }[] = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // ---- Interceptors -------------------------------------------------------

  private setupRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  private setupResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const newToken = response.headers["x-new-access-token"];
        if (newToken) {
          setAccessToken(newToken);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        const isAuthEndpoint =
          originalRequest.url?.includes("/auth/login") ||
          originalRequest.url?.includes("/auth/register") ||
          originalRequest.url?.includes("/auth/google") ||
          originalRequest.url?.includes("/auth/logout");

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve,
                reject,
                config: originalRequest,
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshRes = await this.instance.post(
              api.endpoints.REFRESH,
            );

            const newToken =
              refreshRes.data?.data?.accessToken ||
              refreshRes.headers["x-new-access-token"];

            if (newToken) {
              setAccessToken(newToken);
            }

            // Retry queued requests
            this.failedQueue.forEach(({ resolve, config }) => {
              const token = getAccessToken();
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
              resolve(this.instance(config));
            });
            this.failedQueue = [];

            // Retry the original request
            const token = getAccessToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            setAccessToken(null);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Normalize error
        const normalized: ApiResponse = {
          success: false,
          message:
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred",
          status: error.response?.status || 500,
          data: null,
        };

        return Promise.reject(normalized);
      },
    );
  }

  // ---- Public HTTP methods -------------------------------------------------

  private wrap<T>(
    promise: Promise<AxiosResponse<ApiResponse<T>>>,
  ): Promise<ApiResponse<T>> {
    return promise.then((res) => res.data);
  }

  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrap<T>(this.instance.get(url, config));
  }

  async post<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrap<T>(this.instance.post(url, data, config));
  }

  async put<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrap<T>(this.instance.put(url, data, config));
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrap<T>(this.instance.delete(url, config));
  }
}

// ---------------------------------------------------------------------------
// Exported helpers for auth operations that need direct token access
// ---------------------------------------------------------------------------

export { getAccessToken, setAccessToken };

const axiosInstance = new AxiosService();
export default axiosInstance;
