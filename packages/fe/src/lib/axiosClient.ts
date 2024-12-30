import axios, { AxiosInstance } from "axios";

export const axiosClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:5003",
  // headers: { "Content-Type": "application/json" },
  withCredentials: true
});

export interface BaseResponseSuccess {
  status: string;
  message: string;
  data?: any;
}