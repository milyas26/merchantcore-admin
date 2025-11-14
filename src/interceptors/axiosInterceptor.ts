/* eslint-disable @typescript-eslint/no-unused-expressions */
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

// Interceptor: Request
api.interceptors.request.use(
  (config) => {
    // Inject Authorization token (kalau ada)
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper refresh token (opsional)
let isRefreshing = false;
let failedQueue: { resolve: any; reject: any }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve(token);
  });
  failedQueue = [];
};

// Interceptor: Response
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Kalau token expired (HTTP 401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await api.post("/auth/refresh", {
          refresh_token: refreshToken,
        });

        const newToken = res.data.access_token;
        localStorage.setItem("access_token", newToken);

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // optional: redirect ke login
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Error global lainnya
    return Promise.reject(error);
  }
);

export default api;
