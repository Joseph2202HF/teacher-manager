<?php
/**
 * AuthController
 * Gère la connexion et la déconnexion des utilisateurs
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

class AuthController {

    /**
     * POST /api/auth/login
     * Corps : { "username": "...", "password": "..." }
     */
    public static function login(): void {
        // Lire le corps JSON
        $body = json_decode(file_get_contents('php://input'), true);

        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        // Validation basique
        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identifiant et mot de passe requis.']);
            return;
        }

        // Chercher l'utilisateur
        $db   = getDB();
        $stmt = $db->prepare('SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        // Vérifier le mot de passe (hash bcrypt)
        // Le mot de passe par défaut pour admin est : admin123
        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
            return;
        }

        // Générer le JWT
        $token = JWT::encode([
            'sub'      => $user['id'],
            'username' => $user['username'],
            'role'     => $user['role'],
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie.',
            'token'   => $token,
            'user'    => [
                'id'       => (int) $user['id'],
                'username' => $user['username'],
                'role'     => $user['role'],
            ],
        ]);
    }

    /**
     * POST /api/auth/logout
     * Le frontend doit supprimer le token côté client.
     */
    public static function logout(): void {
        echo json_encode(['success' => true, 'message' => 'Déconnexion effectuée.']);
    }

    /**
     * GET /api/auth/me  — retourne l'utilisateur courant
     */
    public static function me(): void {
        $payload = requireAuth();
        echo json_encode([
            'success' => true,
            'user'    => [
                'id'       => $payload['sub'],
                'username' => $payload['username'],
                'role'     => $payload['role'],
            ],
        ]);
    }
}
