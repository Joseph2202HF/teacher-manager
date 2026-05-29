<?php
/**
 * AuthController
 * Gère l'authentification : connexion, inscription, réinitialisation de mot de passe
 * Supporte la connexion par email OU nom d'utilisateur (comme GitHub)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class AuthController {

    /**
     * POST /api/auth/login
     * Corps : { "username": "..." } OU { "email": "..." } + { "password": "..." }
     * 
     * L'utilisateur peut se connecter avec :
     * - Son nom d'utilisateur + mot de passe
     * - Son adresse email + mot de passe
     */
    public static function login(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $username = trim($body['username'] ?? '');
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        // ═══ 1. Vérifier qu'au moins un identifiant est fourni ═══
        if (empty($username) && empty($email)) {
            http_response_code(422);
            echo json_encode([
                'success' => false, 
                'message' => 'Veuillez fournir un email ou un nom d\'utilisateur.'
            ]);
            return;
        }

        if (empty($password)) {
            http_response_code(422);
            echo json_encode([
                'success' => false, 
                'message' => 'Veuillez fournir votre mot de passe.'
            ]);
            return;
        }

        $db = getDB();

        // ═══ 2. Rechercher l'utilisateur par email OU par username ═══
        if (!empty($email)) {
            $stmt = $db->prepare('SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1');
            $stmt->execute([$email]);
        } else {
            $stmt = $db->prepare('SELECT id, username, email, password, role FROM users WHERE username = ? LIMIT 1');
            $stmt->execute([$username]);
        }
        
        $user = $stmt->fetch();

        // ═══ 3. Compte introuvable → 404 ═══
        if (!$user) {
            http_response_code(404);
            echo json_encode([
                'success' => false, 
                'message' => !empty($email) 
                    ? 'Aucun compte trouvé avec cette adresse email.' 
                    : 'Aucun compte trouvé avec ce nom d\'utilisateur.'
            ]);
            return;
        }

        // ═══ 4. Mot de passe incorrect → 401 ═══
        if (!password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false, 
                'message' => 'Mot de passe incorrect.'
            ]);
            return;
        }

        // ═══ 5. Connexion réussie → 200 ═══
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

        // ═══ Validation champs requis ═══
        if (empty($username) && empty($email) && empty($password)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires.']);
            return;
        }

        if (empty($username)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le nom d\'utilisateur est obligatoire.']);
            return;
        }

        if (empty($email)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'L\'adresse email est obligatoire.']);
            return;
        }

        if (empty($password)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le mot de passe est obligatoire.']);
            return;
        }

        // ═══ Validation format ═══
        if (strlen($username) < 3) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le nom d\'utilisateur doit contenir au moins 3 caractères.']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Format d\'adresse email invalide.']);
            return;
        }

        if (strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères.']);
            return;
        }

        $db = getDB();

        // ═══ Vérifier si l'email existe déjà ═══
        $stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Cette adresse email est déjà utilisée par un autre compte.']);
            return;
        }

        // ═══ Vérifier si le username existe déjà ═══
        $stmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Ce nom d\'utilisateur est déjà pris. Choisissez-en un autre.']);
            return;
        }

        // ═══ Création du compte ═══
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, \'user\')');
        $stmt->execute([$username, $email, $hashedPassword]);

        echo json_encode([
            'success' => true,
            'message' => 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.'
        ]);
    }

    /**
     * POST /api/auth/forgot-password
     * Corps : { "email": "..." }
     */
    public static function forgotPassword(): void {
        $body = json_decode(file_get_contents('php://input'), true);
        $email = trim($body['email'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Veuillez fournir une adresse email valide.']);
            return;
        }

        $db = getDB();

        $stmt = $db->prepare('SELECT id, username FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // ═══ Pour la sécurité, on ne révèle pas si l'email existe ou non ═══
        if (!$user) {
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

        // Sauvegarder le nouveau code
        $stmt = $db->prepare(
            'INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))'
        );
        $stmt->execute([$email, $code]);

        // Envoi de l'email
        $mailSent = self::sendResetEmail($email, $user['username'], $code);

        if ($mailSent) {
            echo json_encode([
                'success' => true,
                'message' => 'Un code de réinitialisation a été envoyé à votre adresse email.'
            ]);
        } else {
            // Fallback développement
            echo json_encode([
                'success' => true,
                'message' => 'Code envoyé (mode debug).',
                'debug_code' => $code
            ]);
        }
    }

    /**
     * Envoyer l'email de réinitialisation
     */
    private static function sendResetEmail(string $email, string $username, string $code): bool {
        try {
            $mailConfig = require __DIR__ . '/../config/mail.php';
            
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = $mailConfig['host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $mailConfig['username'];
            $mail->Password   = $mailConfig['password'];
            $mail->SMTPSecure = $mailConfig['encryption'];
            $mail->Port       = $mailConfig['port'];
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom($mailConfig['from_email'], $mailConfig['from_name']);
            $mail->addAddress($email, $username);

            $mail->isHTML(true);
            $mail->Subject = 'Code de réinitialisation - GestionEns';
            $mail->Body    = '
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
                <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; padding: 30px;">
                    <h2 style="color: #333;">Bonjour ' . htmlspecialchars($username) . ',</h2>
                    <p style="color: #666;">Vous avez demandé la réinitialisation de votre mot de passe.</p>
                    <p style="color: #666;">Voici votre code :</p>
                    <div style="background: #00b8c8; color: white; font-size: 32px; font-weight: bold; letter-spacing: 10px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        ' . $code . '
                    </div>
                    <p style="color: #999; font-size: 13px;">Ce code expire dans 15 minutes.</p>
                    <p style="color: #999; font-size: 13px;">Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                </div>
            </body>
            </html>';

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Erreur envoi email : " . $e->getMessage());
            return false;
        }
    }

    /**
     * POST /api/auth/verify-reset-code
     */
    public static function verifyResetCode(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $email = trim($body['email'] ?? '');
        $code  = trim($body['code'] ?? '');

        if (empty($email) || empty($code)) {
            http_response_code(422);
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
            echo json_encode(['success' => false, 'message' => 'Code incorrect ou expiré. Veuillez réessayer.']);
            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Code vérifié avec succès.'
        ]);
    }

    /**
     * POST /api/auth/reset-password
     */
    public static function resetPassword(): void {
        $body = json_decode(file_get_contents('php://input'), true);

        $email    = trim($body['email'] ?? '');
        $code     = trim($body['code'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($email) || empty($code) || empty($password)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Tous les champs sont obligatoires.']);
            return;
        }

        if (strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Le mot de passe doit contenir au moins 6 caractères.']);
            return;
        }

        $db = getDB();

        $stmt = $db->prepare(
            'SELECT id FROM password_resets 
             WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() 
             ORDER BY created_at DESC LIMIT 1'
        );
        $stmt->execute([$email, $code]);
        $reset = $stmt->fetch();

        if (!$reset) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Code invalide ou expiré. Veuillez réessayer.']);
            return;
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $db->prepare('UPDATE users SET password = ? WHERE email = ?');
        $stmt->execute([$hashedPassword, $email]);

        $stmt = $db->prepare('UPDATE password_resets SET used = 1 WHERE email = ?');
        $stmt->execute([$email]);

        echo json_encode([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.'
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public static function logout(): void {
        echo json_encode(['success' => true, 'message' => 'Déconnexion effectuée.']);
    }

    /**
     * GET /api/auth/me
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
