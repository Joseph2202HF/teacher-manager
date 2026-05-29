/**
 * Service API centralisé
 * Toutes les requêtes vers le backend PHP passent par ce fichier
 */

import axios from 'axios'

// URL de base de l'API (proxy Vite en dev → PHP sur :8000)
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
    // ⚠️ Ne PAS déconnecter si on est déjà sur la page login
    // (sinon on perd le message d'erreur de connexion)
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    
    // Token expiré ou invalide → déconnexion automatique
    // SAUF si c'est une tentative de login (401 = mot de passe faux)
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Rediriger seulement si on n'est pas déjà sur /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────
export const authAPI = {
  /**
   * Connexion — supporte email OU username + mot de passe
   * @param {Object} credentials - { username?: string, email?: string, password: string }
   */
  login: (credentials) => api.post('/auth/login', credentials),
  
  /**
   * Déconnexion
   */
  logout: () => api.post('/auth/logout'),
  
  /**
   * Récupérer l'utilisateur connecté
   */
  me: () => api.get('/auth/me'),
  
  /**
   * Inscription
   * @param {Object} userData - { username: string, email: string, password: string }
   */
  register: (userData) => api.post('/auth/register', userData),
  
  /**
   * Mot de passe oublié — envoi du code par email
   * @param {Object} data - { email: string }
   */
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  
  /**
   * Vérifier le code de réinitialisation
   * @param {Object} data - { email: string, code: string }
   */
  verifyResetCode: (data) => api.post('/auth/verify-reset-code', data),
  
  /**
   * Réinitialiser le mot de passe
   * @param {Object} data - { email: string, code: string, password: string }
   */
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// ─── Enseignants ───────────────────────────────────────────
export const enseignantAPI = {
  /** Liste complète */
  getAll: () => api.get('/enseignants'),
  
  /** Détail d'un enseignant */
  getById: (id) => api.get(`/enseignants/${id}`),
  
  /** Créer un enseignant */
  create: (data) => api.post('/enseignants', data),
  
  /** Modifier un enseignant */
  update: (id, data) => api.put(`/enseignants/${id}`, data),
  
  /** Supprimer un enseignant */
  delete: (id) => api.delete(`/enseignants/${id}`),
  
  /** Bilan / statistiques */
  bilan: () => api.get('/enseignants/bilan'),
}

export default api
