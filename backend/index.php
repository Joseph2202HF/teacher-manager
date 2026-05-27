<?php
/**
 * Point d'entrée unique de l'API REST
 * Routeur minimal basé sur la méthode HTTP et le chemin URI
 */

require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/EnseignantController.php';

// 1. CORS + Headers JSON
handleCors();
setJsonHeaders();

// 2. Parser l'URI (sans le préfixe /api)
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Supprimer le préfixe /api s'il existe (utile si hébergé sous /api/)
$uri = preg_replace('#^/api#', '', $uri);

// 3. Router

// ─── Auth ────────────────────────────────────────────
if ($uri === '/auth/login'     && $method === 'POST') { AuthController::login();    exit; }
if ($uri === '/auth/register'  && $method === 'POST') { AuthController::register(); exit; }  // 🆕
if ($uri === '/auth/logout'    && $method === 'POST') { AuthController::logout();   exit; }
if ($uri === '/auth/me'        && $method === 'GET')  { AuthController::me();       exit; }

// ─── Forgot Password (sans token) ──────────────────── 🆕
if ($uri === '/auth/forgot-password'    && $method === 'POST') { AuthController::forgotPassword();    exit; }
if ($uri === '/auth/verify-reset-code'  && $method === 'POST') { AuthController::verifyResetCode();  exit; }
if ($uri === '/auth/reset-password'     && $method === 'POST') { AuthController::resetPassword();     exit; }

// ─── Bilan (avant /enseignants/{id} pour éviter le conflit) ──
if ($uri === '/enseignants/bilan' && $method === 'GET') { EnseignantController::bilan(); exit; }

// ─── Liste / Création ────────────────────────────────
if ($uri === '/enseignants') {
    match ($method) {
        'GET'  => EnseignantController::index(),
        'POST' => EnseignantController::store(),
        default => notFound(),
    };
    exit;
}

// ─── Détail / Modification / Suppression /enseignants/{id} ──
if (preg_match('#^/enseignants/(\d+)$#', $uri, $m)) {
    $id = (int) $m[1];
    match ($method) {
        'GET'    => EnseignantController::show($id),
        'PUT'    => EnseignantController::update($id),
        'DELETE' => EnseignantController::destroy($id),
        default  => notFound(),
    };
    exit;
}

// ─── 404 par défaut ──────────────────────────────────
notFound();

// ─── Helper ──────────────────────────────────────────
function notFound(): void {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Route introuvable.']);
}
