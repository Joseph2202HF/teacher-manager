-- ============================================================
-- Base de données : gestion_enseignants
-- Description : Script de création et d'initialisation
-- Version : 2.0 (avec support inscription et reset password)
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_enseignants
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gestion_enseignants;

-- -------------------------------------------------------
-- Table : enseignant
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS enseignant (
  numEns       INT AUTO_INCREMENT PRIMARY KEY,
  nom          VARCHAR(100)   NOT NULL,
  nbheures     DECIMAL(8, 2)  NOT NULL DEFAULT 0,
  tauxhoraire  DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Table : users  (authentification)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,           -- 🆕 Ajouté pour l'inscription
  password   VARCHAR(255) NOT NULL,                   -- bcrypt hash
  role       ENUM('admin','user') NOT NULL DEFAULT 'user',
  active     TINYINT(1) NOT NULL DEFAULT 1,           -- 🆕 Pour désactiver un compte
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Table : password_resets  (réinitialisation de mot de passe) 🆕
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(100) NOT NULL,
  code        VARCHAR(10)  NOT NULL,
  token       VARCHAR(64)  NULL,                      -- Token optionnel pour lien de reset
  used        TINYINT(1) NOT NULL DEFAULT 0,          -- 0 = non utilisé, 1 = utilisé
  expires_at  TIMESTAMP NOT NULL,                     -- Date d'expiration du code
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_code (code),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Données de démo
-- -------------------------------------------------------

-- Utilisateur admin  (mot de passe : admin123)
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@gestionens.mg', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Utilisateur test (mot de passe : test123)
INSERT INTO users (username, email, password, role) VALUES
  ('user', 'user@gestionens.mg', '$2y$12$LJ3m4ys3GZ0XkHHbJRAOueHfWm1JOxQREqLqVOgWv0mvsEP5MmK3e', 'user');

-- Enseignants de démonstration
INSERT INTO enseignant (nom, nbheures, tauxhoraire) VALUES
  ('Rakoto Jean',       120.00, 2500.00),
  ('Rabe Marie',         95.50, 3000.00),
  ('Randria Paul',      110.00, 2800.00),
  ('Raharison Sophie',   80.00, 3200.00),
  ('Rajaonarison Marc', 150.00, 2200.00),
  ('Andriantsoa Luc',   100.00, 2600.00),
  ('Razafindrabe Eva',   88.00, 2900.00);
