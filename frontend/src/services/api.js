import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// Attach token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ─── Produtos ────────────────────────────────────────────────────────────────
export const produtosAPI = {
  list: (params) => api.get('/produtos', { params }),
  get: (id) => api.get(`/produtos/${id}`),
  create: (data) => api.post('/produtos', data),
  update: (id, data) => api.put(`/produtos/${id}`, data),
  toggle: (id) => api.patch(`/produtos/${id}/toggle`),
  delete: (id) => api.delete(`/produtos/${id}`),
  categorias: () => api.get('/produtos/categorias/lista'),
};

// ─── Usuários ────────────────────────────────────────────────────────────────
export const usuariosAPI = {
  list: (params) => api.get('/usuarios', { params }),
  get: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  toggle: (id) => api.patch(`/usuarios/${id}/toggle`),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

export default api;
