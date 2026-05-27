-- ============================================================
-- Base de données : gestion_enseignants
-- Description : Script de création et d'initialisation
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
  password   VARCHAR(255) NOT NULL,  -- bcrypt hash
  role       ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Données de démo
-- -------------------------------------------------------

-- Utilisateur admin  (mot de passe : admin123)
INSERT INTO users (username, password, role) VALUES
  ('admin', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Enseignants de démonstration
INSERT INTO enseignant (nom, nbheures, tauxhoraire) VALUES
  ('Rakoto Jean',       120.00, 2500.00),
  ('Rabe Marie',         95.50, 3000.00),
  ('Randria Paul',      110.00, 2800.00),
  ('Raharison Sophie',   80.00, 3200.00),
  ('Rajaonarison Marc', 150.00, 2200.00),
  ('Andriantsoa Luc',   100.00, 2600.00),
  ('Razafindrabe Eva',   88.00, 2900.00);
