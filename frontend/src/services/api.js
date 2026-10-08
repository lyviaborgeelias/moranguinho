import axios from "axios";
import { clearAuth, getToken, updateToken } from "./auth";

const baseURL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL, timeout: 15000 });
const publicPaths = [
  "/login/",
  "/register/",
  "/password/reset/",
  "/password/reset/confirm/",
  "/health/",
];
let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !publicPaths.includes(config.url)) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status !== 401 || !request || publicPaths.includes(request.url))
      return Promise.reject(error);
    const refresh = getToken("refreshToken");
    if (request._retry || !refresh) {
      clearAuth();
      return Promise.reject(error);
    }
    request._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/token/refresh/`, { refresh }, { timeout: 15000 })
          .then(({ data }) => {
            updateToken(data.access);
            return data.access;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const access = await refreshPromise;
      request.headers.Authorization = `Bearer ${access}`;
      return api(request);
    } catch (refreshError) {
      if (refreshError.response?.status === 401 || refreshError.response?.status === 400)
        clearAuth();
      return Promise.reject(refreshError);
    }
  },
);

export function errorMessage(error) {
  if (!error.response)
    return "Não conseguimos conectar ao servidor. Verifique se o Django está rodando e tente novamente.";
  if (error.response.status >= 500)
    return "O servidor encontrou um problema. Tente novamente em alguns instantes.";
  return (
    error.response.data?.erro ||
    error.response.data?.detail ||
    "Não foi possível concluir. Tente novamente."
  );
}

export default api;
