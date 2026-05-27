<?php
/**
 * AuthController
 * Gère l'authentification : connexion, inscription, réinitialisation de mot de passe
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

class AuthController {

    /**
     * POST /api/auth/login
     * Corps : { "username": "...", "password": "..." }
     */
    public static function login(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Identifiant et mot de passe requis.']);
            return;
        }

        $db   = getDB();
        $stmt = $db->prepare('SELECT id, username, email, password, role FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Identifiant ou mot de passe incorrect.']);
            return;
        }

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
                'email'    => $user['email'],
                'role'     => $user['role'],
            ],
        ]);
    }

    /**
     * POST /api/auth/register
     * Corps : { "username": "...", "email": "...", "password": "..." }
     */
    public static function register(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $username = trim($body['username'] ?? '');
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        // Validation
        if (empty($username) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires.']);
            return;
        }

        if (strlen($username) < 3) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le nom d\'utilisateur doit contenir au moins 3 caractères.']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Adresse email invalide.']);
            return;
        }

        if (strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères.']);
            return;
        }

        $db = getDB();

        // Vérifier si username ou email existe déjà
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1');
        $stmt->execute([$username, $email]);

        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Ce nom d\'utilisateur ou cet email est déjà utilisé.']);
            return;
        }

        // Hasher le mot de passe
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        // Créer l'utilisateur
        $stmt = $db->prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, \'user\')');
        $stmt->execute([$username, $email, $hashedPassword]);

        echo json_encode([
            'success' => true,
            'message' => 'Compte créé avec succès !'
        ]);
    }

    /**
     * POST /api/auth/forgot-password
     * Corps : { "email": "..." }
     * Envoie un code de réinitialisation par email
     */
    public static function forgotPassword(): void {
        $body = json_decode(file_get_contents('php://input'), true);
        $email = trim($body['email'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Adresse email invalide.']);
            return;
        }

        $db = getDB();

        // Vérifier si l'email existe
        $stmt = $db->prepare('SELECT id, username FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // Ne pas révéler si l'email existe (sécurité)
            echo json_encode([
                'success' => true,
                'message' => 'Si cet email est enregistré, un code de réinitialisation a été envoyé.'
            ]);
            return;
        }

        // Générer un code à 6 chiffres
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Désactiver les anciens codes
        $stmt = $db->prepare('UPDATE password_resets SET used = 1 WHERE email = ?');
        $stmt->execute([$email]);

        // Sauvegarder le nouveau code (expire dans 15 minutes)
        $stmt = $db->prepare(
            'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))'
        );
        $stmt->execute([$email, $code]);

        // TODO: Envoyer l'email
        // mail($email, "Réinitialisation de mot de passe", "Votre code : $code");
        error_log("Code de réinitialisation pour $email : $code");

        echo json_encode([
            'success' => true,
            'message' => 'Code de réinitialisation envoyé.',
            'debug_code' => $code  // ⚠️ À retirer en production !
        ]);
    }

    /**
     * POST /api/auth/verify-reset-code
     * Corps : { "email": "...", "code": "..." }
     * Vérifie si le code est valide
     */
    public static function verifyResetCode(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $email = trim($body['email'] ?? '');
        $code  = trim($body['code'] ?? '');

        if (empty($email) || empty($code)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email et code requis.']);
            return;
        }

        $db = getDB();

        $stmt = $db->prepare(
            'SELECT id FROM password_resets 
             WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() 
             ORDER BY created_at DESC LIMIT 1'
        );
        $stmt->execute([$email, $code]);

        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Code incorrect ou expiré.']);
            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Code vérifié avec succès.'
        ]);
    }

    /**
     * POST /api/auth/reset-password
     * Corps : { "email": "...", "code": "...", "password": "..." }
     * Réinitialise le mot de passe après vérification du code
     */
    public static function resetPassword(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $email    = trim($body['email'] ?? '');
        $code     = trim($body['code'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($email) || empty($code) || empty($password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires.']);
            return;
        }

        if (strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères.']);
            return;
        }

        $db = getDB();

        // Vérifier le code
        $stmt = $db->prepare(
            'SELECT id FROM password_resets 
             WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() 
             ORDER BY created_at DESC LIMIT 1'
        );
        $stmt->execute([$email, $code]);
        $reset = $stmt->fetch();

        if (!$reset) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Code invalide ou expiré.']);
            return;
        }

        // Mettre à jour le mot de passe
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('UPDATE users SET password = ? WHERE email = ?');
        $stmt->execute([$hashedPassword, $email]);

        // Marquer tous les codes comme utilisés
        $stmt = $db->prepare('UPDATE password_resets SET used = 1 WHERE email = ?');
        $stmt->execute([$email]);

        echo json_encode([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès !'
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
