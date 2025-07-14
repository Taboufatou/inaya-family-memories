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

if ($method === 'POST') {
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'get':
            try {
                $stmt = $pdo->prepare("SELECT * FROM events ORDER BY event_date DESC");
                $stmt->execute();
                $events = $stmt->fetchAll();
                echo json_encode(['success' => true, 'events' => $events]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de la récupération']);
            }
            break;

        case 'add':
            if ($user['user_type'] === 'admin') {
                http_response_code(403);
                echo json_encode(['error' => 'Non autorisé']);
                exit;
            }

            $titre = $input['titre'] ?? '';
            $description = $input['description'] ?? '';
            $date = $input['date'] ?? '';
            $lieu = $input['lieu'] ?? '';
            $type = $input['type'] ?? '';

            if (empty($titre) || empty($date)) {
                http_response_code(400);
                echo json_encode(['error' => 'Titre et date requis']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("INSERT INTO events (titre, description, event_date, lieu, type, author, date_created) VALUES (?, ?, ?, ?, ?, ?, NOW())");
                $stmt->execute([$titre, $description, $date, $lieu, $type, $user['user_type']]);
                
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de la création']);
            }
            break;

        case 'update':
            $id = $input['id'] ?? '';
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['error' => 'ID requis']);
                exit;
            }

            // Vérifier que l'utilisateur peut modifier cet événement
            $stmt = $pdo->prepare("SELECT author FROM events WHERE id = ?");
            $stmt->execute([$id]);
            $event = $stmt->fetch();

            if (!$event || ($user['user_type'] !== 'admin' && $event['author'] !== $user['user_type'])) {
                http_response_code(403);
                echo json_encode(['error' => 'Non autorisé']);
                exit;
            }

            $titre = $input['titre'] ?? '';
            $description = $input['description'] ?? '';
            $date = $input['date'] ?? '';
            $lieu = $input['lieu'] ?? '';
            $type = $input['type'] ?? '';

            try {
                $stmt = $pdo->prepare("UPDATE events SET titre = ?, description = ?, event_date = ?, lieu = ?, type = ? WHERE id = ?");
                $stmt->execute([$titre, $description, $date, $lieu, $type, $id]);
                
                echo json_encode(['success' => true]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de la modification']);
            }
            break;

        case 'delete':
            $id = $input['id'] ?? '';
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['error' => 'ID requis']);
                exit;
            }

            // Vérifier que l'utilisateur peut supprimer cet événement
            $stmt = $pdo->prepare("SELECT author FROM events WHERE id = ?");
            $stmt->execute([$id]);
            $event = $stmt->fetch();

            if (!$event || ($user['user_type'] !== 'admin' && $event['author'] !== $user['user_type'])) {
                http_response_code(403);
                echo json_encode(['error' => 'Non autorisé']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
                $stmt->execute([$id]);
                
                echo json_encode(['success' => true]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de la suppression']);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Action non reconnue']);
    }
}
?>