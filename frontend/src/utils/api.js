import axios from "axios";

export const BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// plain client with no interceptors, used for the refresh call itself so it
// can't recursively trigger another refresh attempt
const rawClient = axios.create({ baseURL: BASE_URL });

const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const goToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// all concurrent 401s while a refresh is in flight share this single promise
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem("refreshToken");
    refreshPromise = (refreshToken
      ? rawClient.post("/user/refresh", { refreshToken })
      : Promise.reject(new Error("No refresh token")))
      .then(({ data }) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data.token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    // login/register/google failures (e.g. wrong password) are handled inline
    // by the calling page - never intercept those
    const isAuthRoute = ["/user/login", "/user/register", "/user/google"].some(
      (path) => config?.url?.includes(path),
    );

    if (isAuthRoute || response?.status !== 401) {
      return Promise.reject(error);
    }

    if (config._retry) {
      // already tried refreshing once for this request - session is dead
      clearAuth();
      goToLogin();
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      const newToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      return api(config);
    } catch {
      clearAuth();
      goToLogin();
      return Promise.reject(error);
    }
  },
);

export default api;
