<?php
/**
 * Utilitaire JWT  (HS256, sans librairie externe)
 * Génère et vérifie des tokens JSON Web Token
 */

define('JWT_SECRET', 'GestionEnseignants_S3cr3t_K3y_2024!');
define('JWT_EXPIRY', 3600 * 8); // 8 heures

class JWT {

    /**
     * Encode un payload en token JWT
     */
    public static function encode(array $payload): string {
        $header  = self::base64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $claims  = self::base64url(json_encode($payload));
        $sig     = self::base64url(hash_hmac('sha256', "$header.$claims", JWT_SECRET, true));
        return "$header.$claims.$sig";
    }

    /**
     * Décode et valide un token JWT
     *
     * @throws Exception si le token est invalide ou expiré
     */
    public static function decode(string $token): array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception('Token mal formé');
        }

        [$header, $claims, $sig] = $parts;

        // Vérifier la signature
        $expectedSig = self::base64url(hash_hmac('sha256', "$header.$claims", JWT_SECRET, true));
        if (!hash_equals($expectedSig, $sig)) {
            throw new Exception('Signature invalide');
        }

        $payload = json_decode(self::base64urlDecode($claims), true);
        if (!$payload) {
            throw new Exception('Payload invalide');
        }

        // Vérifier l'expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token expiré');
        }

        return $payload;
    }

    // ---- helpers ----

    private static function base64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64urlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }
}
