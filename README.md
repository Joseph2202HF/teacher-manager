# GestionEns — Système de gestion des enseignants

Application SPA complète de gestion des enseignants avec calcul automatique des salaires.

## 🏗 Architecture

```
gestion-enseignants/
├── frontend/          # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/  # Layout, Sidebar, Toast, Form partagé
│   │   ├── context/     # AuthContext (JWT)
│   │   ├── pages/       # Login, Dashboard, Enseignants, Bilan…
│   │   └── services/    # api.js (Axios)
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/           # PHP natif — API REST
│   ├── config/        # database.php, jwt.php
│   ├── controllers/   # AuthController, EnseignantController
│   ├── middleware/    # cors.php (CORS + requireAuth)
│   └── index.php      # Routeur unique
└── database/
    └── gestion_enseignants.sql
```

## ⚡ Prérequis

| Outil    | Version minimale |
|----------|-----------------|
| Node.js  | 18+             |
| npm      | 9+              |
| PHP      | 8.1+            |
| MySQL    | 8.0+            |

## 🚀 Installation rapide

### 1. Cloner / extraire le projet

```bash
cd gestion-enseignants
```

### 2. Base de données MySQL

```bash
mysql -u root -ppassword < database/gestion_enseignants.sql
```

Ou avec MySQL Workbench / phpMyAdmin : importer `database/gestion_enseignants.sql`.

### 3. Backend PHP

```bash
cd backend
php -S localhost:8000
```

> Le serveur PHP intégré écoute sur le port **8000**.  
> En production, configurer Apache/Nginx avec le `.htaccess` fourni.

### 4. Frontend React

```bash
cd frontend
cp .env.example .env   # optionnel
npm install
npm run dev
```

> Vite démarre sur **http://localhost:5173** et proxifie `/api` → `localhost:8000`.

---

## 🔑 Compte de démo

| Champ       | Valeur    |
|-------------|-----------|
| Identifiant | `admin`   |
| Mot de passe| `admin123`|

---

## 📋 Fonctionnalités

- ✅ **Authentification JWT** — login / logout sécurisé
- ✅ **Dashboard** — statistiques globales + tableau récent
- ✅ **Liste enseignants** — tri, recherche, pagination
- ✅ **Ajouter** — formulaire validé côté client et serveur
- ✅ **Modifier** — pré-remplissage des données
- ✅ **Supprimer** — modale de confirmation
- ✅ **Bilan** — salaire min/max/total + histogramme + camembert
- ✅ **Calcul automatique** `salaire = nbheures × tauxhoraire`
- ✅ **Thème sombre moderne** — sidebar responsive, animations légères

---

## 🔌 Endpoints API

| Méthode | Route                      | Description                       | Auth |
|---------|----------------------------|-----------------------------------|------|
| POST    | `/api/auth/login`          | Connexion → token JWT             | ❌   |
| POST    | `/api/auth/logout`         | Déconnexion                       | ✅   |
| GET     | `/api/auth/me`             | Utilisateur courant               | ✅   |
| GET     | `/api/enseignants`         | Liste complète                    | ✅   |
| POST    | `/api/enseignants`         | Créer un enseignant               | ✅   |
| GET     | `/api/enseignants/{id}`    | Détail enseignant                 | ✅   |
| PUT     | `/api/enseignants/{id}`    | Modifier enseignant               | ✅   |
| DELETE  | `/api/enseignants/{id}`    | Supprimer enseignant              | ✅   |
| GET     | `/api/enseignants/bilan`   | Statistiques globales             | ✅   |

---

## 🗄 Structure de la base de données

### Table `enseignant`
| Colonne     | Type           | Description                     |
|-------------|----------------|---------------------------------|
| numEns      | INT AUTO_INC   | Identifiant primaire            |
| nom         | VARCHAR(100)   | Nom complet                     |
| nbheures    | DECIMAL(8,2)   | Nombre d'heures effectuées      |
| tauxhoraire | DECIMAL(10,2)  | Taux horaire (Ar)               |
| created_at  | TIMESTAMP      | Date de création                |
| updated_at  | TIMESTAMP      | Dernière mise à jour            |

### Table `users`
| Colonne  | Type         | Description           |
|----------|--------------|-----------------------|
| id       | INT AUTO_INC | Identifiant           |
| username | VARCHAR(50)  | Nom d'utilisateur     |
| password | VARCHAR(255) | Hash bcrypt           |
| role     | ENUM         | admin / user          |

> **Salaire** = calculé dynamiquement en SQL : `nbheures × tauxhoraire`

---

## 🛠 Commandes utiles

```bash
# Build production frontend
cd frontend && npm run build

# Lancer le backend en production (Apache/Nginx)
# Pointer DocumentRoot vers le dossier backend/
# Le .htaccess redirige toutes les requêtes vers index.php

# Ajouter un utilisateur (hash bcrypt PHP)
php -r "echo password_hash('monmotdepasse', PASSWORD_BCRYPT);"
```

---

## 🏭 Déploiement production

1. **Frontend** : `npm run build` → déployer `dist/` sur CDN ou serveur statique
2. **Backend** : copier `backend/` sur le serveur PHP, configurer la base de données
3. **Variables d'env** : mettre à jour `VITE_API_URL` dans `.env`
4. **HTTPS** : configurer SSL (Let's Encrypt recommandé)
5. **CORS** : adapter `$allowedOrigins` dans `backend/middleware/cors.php`

---

## 📦 Dépendances principales

### Frontend
- React 18 + React Router DOM 6
- Axios (requêtes HTTP)
- TailwindCSS 3 (styles)
- Recharts (graphiques)
- Lucide React (icônes)

### Backend
- PHP 8.1+ natif (aucune dépendance Composer)
- PDO MySQL (requêtes préparées)
- JWT maison (HS256)

---

*Développé avec ❤ — thème sombre, architecture propre, prêt à la production.*
