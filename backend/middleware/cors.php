<?php
/**
 * Middleware CORS
 * Autorise les requêtes cross-origin depuis le frontend Vite (port 5173)
 */

function handleCors(): void {
    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Pendant le développement, on autorise tout
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // cache pre-flight 24h

    // Répondre immédiatement aux requêtes pre-flight OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Forcer les réponses en JSON
 */
function setJsonHeaders(): void {
    header('Content-Type: application/json; charset=UTF-8');
}

/**
 * Récupérer le token JWT depuis l'en-tête Authorization
 *
 * @return string|null
 */
function getBearerToken(): ?string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/', $auth, $m)) {
        return trim($m[1]);
    }
    return null;
}

/**
 * Protéger une route : vérifie le JWT et retourne le payload
 *
 * @return array  payload du token
 */
function requireAuth(): array {
   require_once __DIR__ . '/../config/jwt.php';

    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token manquant']);
        exit;
    }

    try {
        return JWT::decode($token);
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}
