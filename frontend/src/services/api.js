/**
 * Service API centralisé
 * Toutes les requêtes vers le backend PHP passent par ce fichier
 */

import axios from 'axios'

// URL de base de l'API  (proxy Vite en dev → PHP sur :8000)
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// Instance Axios configurée
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// ─── Intercepteur requêtes : injecter le JWT ───────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Intercepteur réponses : gérer les erreurs globales ────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expiré ou invalide → déconnexion automatique
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  // Connexion / Déconnexion
  login:  (credentials) => api.post('/auth/login',  credentials),
  logout: ()            => api.post('/auth/logout'),
  me:     ()            => api.get('/auth/me'),
  
  // ─── NOUVEAU : Inscription ───
  register: (userData) => api.post('/auth/register', userData),
  
  // ─── NOUVEAU : Mot de passe oublié ───
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  
  // ─── NOUVEAU : Vérifier le code de réinitialisation ───
  verifyResetCode: (data) => api.post('/auth/verify-reset-code', data),
  
  // ─── NOUVEAU : Réinitialiser le mot de passe ───
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// ─── Enseignants ───────────────────────────────────────────
export const enseignantAPI = {
  getAll:  ()         => api.get('/enseignants'),
  getById: (id)       => api.get(`/enseignants/${id}`),
  create:  (data)     => api.post('/enseignants', data),
  update:  (id, data) => api.put(`/enseignants/${id}`, data),
  delete:  (id)       => api.delete(`/enseignants/${id}`),
  bilan:   ()         => api.get('/enseignants/bilan'),
}

export default api
