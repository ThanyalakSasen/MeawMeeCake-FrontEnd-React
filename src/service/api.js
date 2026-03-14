import axios from "axios";

const DEFAULT_API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

const normalizeApiPath = (url) => {
  if (typeof url !== "string") return url;
  if (url === "/api") return "/";
  if (url.startsWith("/api/")) return url.replace("/api", "");
  return url;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  config.url = normalizeApiPath(config.url);

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  },
);

const unwrap = async (requestPromise) => {
  const response = await requestPromise;
  return response.data;
};

const extractTokenAndUser = (payload) => {
  const token = payload?.token || payload?.accessToken || payload?.data?.token;
  const user = payload?.user || payload?.data?.user;

  if (token) {
    localStorage.setItem("token", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return payload;
};

export const authAPI = {
  login: async (email, password) => {
    const data = await unwrap(
      apiClient.post("/auth/login", {
        email,
        password,
      }),
    );

    return extractTokenAndUser(data);
  },

  register: async (userData) => {
    return unwrap(apiClient.post("/auth/register", userData));
  },

  logout: async () => {
    try {
      await unwrap(apiClient.post("/auth/logout"));
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  verifyEmail: async (token) => {
    return unwrap(apiClient.get(`/auth/verify-email/${token}`));
  },

  getCurrentUser: async () => {
    return unwrap(apiClient.get("/auth/me"));
  },

  getGoogleAuthUrl: () => {
    return `${API_BASE_URL}/auth/google`;
  },
};
export const productAPI = {
  createProduct: async (productData) => {
    return unwrap(apiClient.post("/products", productData));
  },
  getProducts: async () => {
    return unwrap(apiClient.get("/products"));
  },
  getProductById: async (id) => {
    return unwrap(apiClient.get(`/products/${id}`));
  },
  updateProduct: async (id, productData) => {
    return unwrap(apiClient.put(`/products/${id}`, productData));
  },
  deleteProduct: async (id) => {
    return unwrap(apiClient.delete(`/products/${id}`));
  },
  softDeleteProduct: async (id) => {
    return unwrap(apiClient.post(`/products/softDelete/${id}`));
  },
  restoreProduct: async (id) => {
    return unwrap(apiClient.put(`/products/restore/${id}`));
  },
};

export default apiClient;
