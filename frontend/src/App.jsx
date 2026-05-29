/**
 * App.jsx — configuration du routeur React
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute        from './components/PrivateRoute'
import Layout              from './components/Layout'
import Login               from './pages/Login'
import Dashboard           from './pages/Dashboard'
import Enseignants         from './pages/Enseignants'
import AjouterEnseignant   from './pages/AjouterEnseignant'
import ModifierEnseignant  from './pages/ModifierEnseignant'
import Bilan               from './pages/Bilan'
import Apparence           from './pages/Parametres/Apparence'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protégé */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard"                    element={<Dashboard />} />
              <Route path="/enseignants"                  element={<Enseignants />} />
              <Route path="/enseignants/ajouter"          element={<AjouterEnseignant />} />
              <Route path="/enseignants/:id/modifier"     element={<ModifierEnseignant />} />
              <Route path="/bilan"                        element={<Bilan />} />
              <Route path="/parametres/apparence"         element={<Apparence />} />
            </Route>
          </Route>

          {/* Redirect racine */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
