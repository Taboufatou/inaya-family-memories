
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Validation du token
$headers = getallheaders();
$token = $headers['Authorization'] ?? '';
if (!validateToken($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token invalide']);
    exit;
}

$user = getUserFromToken($token);

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->prepare("SELECT * FROM consultations ORDER BY consultation_date DESC");
            $stmt->execute();
            $consultations = $stmt->fetchAll();
            echo json_encode($consultations);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la récupération']);
        }
        break;

    case 'POST':
        if ($user['type'] === 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        $lieu = $input['lieu'] ?? '';
        $professionnel = $input['professionnel'] ?? '';
        $date = $input['date'] ?? '';
        $heure = $input['heure'] ?? '';
        $commentaires = $input['commentaires'] ?? '';

        if (empty($lieu) || empty($professionnel) || empty($date)) {
            http_response_code(400);
            echo json_encode(['error' => 'Lieu, professionnel et date requis']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO consultations (lieu, professionnel, consultation_date, heure, commentaires, author, date_created) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$lieu, $professionnel, $date, $heure, $commentaires, $user['type']]);
            
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la création']);
        }
        break;

    case 'PUT':
        $id = $input['id'] ?? '';
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requis']);
            exit;
        }

        // Vérifier que l'utilisateur peut modifier cette consultation
        $stmt = $pdo->prepare("SELECT author FROM consultations WHERE id = ?");
        $stmt->execute([$id]);
        $consultation = $stmt->fetch();

        if (!$consultation || ($user['type'] !== 'admin' && $consultation['author'] !== $user['type'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        $lieu = $input['lieu'] ?? '';
        $professionnel = $input['professionnel'] ?? '';
        $date = $input['date'] ?? '';
        $heure = $input['heure'] ?? '';
        $commentaires = $input['commentaires'] ?? '';

        try {
            $stmt = $pdo->prepare("UPDATE consultations SET lieu = ?, professionnel = ?, consultation_date = ?, heure = ?, commentaires = ? WHERE id = ?");
            $stmt->execute([$lieu, $professionnel, $date, $heure, $commentaires, $id]);
            
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la modification']);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'ID requis']);
            exit;
        }

        // Vérifier que l'utilisateur peut supprimer cette consultation
        $stmt = $pdo->prepare("SELECT author FROM consultations WHERE id = ?");
        $stmt->execute([$id]);
        $consultation = $stmt->fetch();

        if (!$consultation || ($user['type'] !== 'admin' && $consultation['author'] !== $user['type'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM consultations WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la suppression']);
        }
        break;
}
?>
