import axios, { AxiosError } from "axios";

const API_URL = "http://localhost:8080/api";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    if (typeof window !== "undefined" && status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(new ApiError(message, status));
  }
);

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  try {
    const response = await api({
      url: endpoint,
      method,
      data: body,
    });

    return (response.data?.data ?? response.data) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Unable to connect to the server");
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}

export function isAuthError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function getAuthMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    if (error.message.toLowerCase().includes("expired")) {
      return "Your session has expired. Please log in again to continue.";
    }

    return "Please log in to continue.";
  }

  return "Please log in to continue.";
}

export default api;
