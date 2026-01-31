import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { decryptLocalStorage } from "./DparcelHelper";

const apiUrl = import.meta.env.VITE_API_URL;

// Generic API Response type
export interface ApiResponse<T = any> {
  status: number;
  data: T;
}

// Main API Request function
export const ApiHelper = async <T = any>(
  method: Method,
  endpoint: string,
  data: Record<string, any> | FormData = {},
  headers: Record<string, string> = {},
  isFile: boolean = false
): Promise<ApiResponse<T>> => {
  try {
    const token = decryptLocalStorage("access_token");

    const config: AxiosRequestConfig = {
      method,
      url: `${apiUrl}${endpoint}`,
      headers: {
        ...(isFile ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(method.toLowerCase() === "get"
        ? { params: data }
        : { data }),
    };

    const response: AxiosResponse<T> = await axios(config);

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error: any) {
    const status = error.response?.status || 500;
    const responseData = error.response?.data || { message: "Network or server error" };

    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/signin"; // force re-login
    }

    return {
      status,
      data: responseData,
    };
  }
};
