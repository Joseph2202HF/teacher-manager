<?php
/**
 * EnseignantController
 * CRUD complet sur la table `enseignant`
 * Toutes les routes sont protégées par JWT
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/cors.php';

class EnseignantController {

    // -------------------------------------------------------
    // GET /api/enseignants — liste complète avec salaire calculé
    // -------------------------------------------------------
    public static function index(): void {
        requireAuth();

        $db   = getDB();
        $stmt = $db->query(
            'SELECT numEns, nom, nbheures, tauxhoraire,
                    ROUND(nbheures * tauxhoraire, 2) AS salaire,
                    created_at, updated_at
             FROM enseignant
             ORDER BY nom ASC'
        );

        $rows = $stmt->fetchAll();
        // Caster les types numériques
        foreach ($rows as &$r) {
            $r['numEns']      = (int)   $r['numEns'];
            $r['nbheures']    = (float) $r['nbheures'];
            $r['tauxhoraire'] = (float) $r['tauxhoraire'];
            $r['salaire']     = (float) $r['salaire'];
        }

        echo json_encode(['success' => true, 'data' => $rows]);
    }

    // -------------------------------------------------------
    // GET /api/enseignants/{id}
    // -------------------------------------------------------
    public static function show(int $id): void {
        requireAuth();

        $db   = getDB();
        $stmt = $db->prepare(
            'SELECT numEns, nom, nbheures, tauxhoraire,
                    ROUND(nbheures * tauxhoraire, 2) AS salaire,
                    created_at, updated_at
             FROM enseignant WHERE numEns = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();

        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Enseignant introuvable.']);
            return;
        }

        $row['numEns']      = (int)   $row['numEns'];
        $row['nbheures']    = (float) $row['nbheures'];
        $row['tauxhoraire'] = (float) $row['tauxhoraire'];
        $row['salaire']     = (float) $row['salaire'];

        echo json_encode(['success' => true, 'data' => $row]);
    }

    // -------------------------------------------------------
    // POST /api/enseignants — créer un enseignant
    // -------------------------------------------------------
    public static function store(): void {
        requireAuth();

        $body = json_decode(file_get_contents('php://input'), true);

        [$ok, $errors, $data] = self::validate($body);
        if (!$ok) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $errors]);
            return;
        }

        $db   = getDB();
        $stmt = $db->prepare(
            'INSERT INTO enseignant (nom, nbheures, tauxhoraire) VALUES (?, ?, ?)'
        );
        $stmt->execute([$data['nom'], $data['nbheures'], $data['tauxhoraire']]);

        $id = (int) $db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Enseignant ajouté avec succès.',
            'data'    => array_merge(['numEns' => $id], $data, [
                'salaire' => round($data['nbheures'] * $data['tauxhoraire'], 2),
            ]),
        ]);
    }

    // -------------------------------------------------------
    // PUT /api/enseignants/{id} — modifier un enseignant
    // -------------------------------------------------------
    public static function update(int $id): void {
        requireAuth();

        // Vérifier l'existence
        $db   = getDB();
        $chk  = $db->prepare('SELECT numEns FROM enseignant WHERE numEns = ?');
        $chk->execute([$id]);
        if (!$chk->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Enseignant introuvable.']);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true);

        [$ok, $errors, $data] = self::validate($body);
        if (!$ok) {
            http_response_code(422);
            echo json_encode(['success' => false, 'errors' => $errors]);
            return;
        }

        $stmt = $db->prepare(
            'UPDATE enseignant SET nom = ?, nbheures = ?, tauxhoraire = ? WHERE numEns = ?'
        );
        $stmt->execute([$data['nom'], $data['nbheures'], $data['tauxhoraire'], $id]);

        echo json_encode([
            'success' => true,
            'message' => 'Enseignant modifié avec succès.',
            'data'    => array_merge(['numEns' => $id], $data, [
                'salaire' => round($data['nbheures'] * $data['tauxhoraire'], 2),
            ]),
        ]);
    }

    // -------------------------------------------------------
    // DELETE /api/enseignants/{id}
    // -------------------------------------------------------
    public static function destroy(int $id): void {
        requireAuth();

        $db   = getDB();
        $stmt = $db->prepare('DELETE FROM enseignant WHERE numEns = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Enseignant introuvable.']);
            return;
        }

        echo json_encode(['success' => true, 'message' => 'Enseignant supprimé avec succès.']);
    }

    // -------------------------------------------------------
    // GET /api/enseignants/bilan — statistiques
    // -------------------------------------------------------
    public static function bilan(): void {
        requireAuth();

        $db   = getDB();
        $stmt = $db->query(
            'SELECT
               COUNT(*)                                   AS total,
               MIN(ROUND(nbheures * tauxhoraire, 2))      AS salaire_min,
               MAX(ROUND(nbheures * tauxhoraire, 2))      AS salaire_max,
               SUM(ROUND(nbheures * tauxhoraire, 2))      AS salaire_total,
               AVG(ROUND(nbheures * tauxhoraire, 2))      AS salaire_moyen,
               SUM(nbheures)                              AS total_heures
             FROM enseignant'
        );
        $stats = $stmt->fetch();

        // Détail par enseignant pour les graphiques
        $detail = $db->query(
            'SELECT nom, ROUND(nbheures * tauxhoraire, 2) AS salaire
             FROM enseignant ORDER BY salaire DESC'
        )->fetchAll();

        foreach ($detail as &$d) {
            $d['salaire'] = (float) $d['salaire'];
        }

        echo json_encode([
            'success' => true,
            'data'    => [
                'total'         => (int)   $stats['total'],
                'salaire_min'   => (float) $stats['salaire_min'],
                'salaire_max'   => (float) $stats['salaire_max'],
                'salaire_total' => (float) $stats['salaire_total'],
                'salaire_moyen' => (float) round($stats['salaire_moyen'] ?? 0, 2),
                'total_heures'  => (float) $stats['total_heures'],
                'detail'        => $detail,
            ],
        ]);
    }

    // -------------------------------------------------------
    // Validation commune
    // -------------------------------------------------------
    private static function validate(?array $body): array {
        $errors = [];
        $data   = [];

        $nom        = trim($body['nom']        ?? '');
        $nbheures   = $body['nbheures']   ?? null;
        $tauxhoraire = $body['tauxhoraire'] ?? null;

        if (empty($nom)) {
            $errors['nom'] = 'Le nom est obligatoire.';
        } elseif (strlen($nom) > 100) {
            $errors['nom'] = 'Le nom ne doit pas dépasser 100 caractères.';
        } else {
            $data['nom'] = $nom;
        }

        if ($nbheures === null || $nbheures === '') {
            $errors['nbheures'] = 'Le nombre d\'heures est obligatoire.';
        } elseif (!is_numeric($nbheures) || (float)$nbheures < 0) {
            $errors['nbheures'] = 'Le nombre d\'heures doit être un nombre positif.';
        } else {
            $data['nbheures'] = (float) $nbheures;
        }

        if ($tauxhoraire === null || $tauxhoraire === '') {
            $errors['tauxhoraire'] = 'Le taux horaire est obligatoire.';
        } elseif (!is_numeric($tauxhoraire) || (float)$tauxhoraire < 0) {
            $errors['tauxhoraire'] = 'Le taux horaire doit être un nombre positif.';
        } else {
            $data['tauxhoraire'] = (float) $tauxhoraire;
        }

        return [empty($errors), $errors, $data];
    }
}
