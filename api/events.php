
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
            $stmt = $pdo->prepare("SELECT * FROM events ORDER BY event_date ASC");
            $stmt->execute();
            $events = $stmt->fetchAll();
            echo json_encode($events);
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

        $title = $input['title'] ?? '';
        $description = $input['description'] ?? '';
        $date = $input['date'] ?? '';
        $time = $input['time'] ?? '';
        $location = $input['location'] ?? '';

        if (empty($title) || empty($date)) {
            http_response_code(400);
            echo json_encode(['error' => 'Titre et date requis']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO events (title, description, event_date, time, location, author, date_created) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$title, $description, $date, $time, $location, $user['type']]);
            
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

        // Vérifier que l'utilisateur peut modifier cet événement
        $stmt = $pdo->prepare("SELECT author FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $event = $stmt->fetch();

        if (!$event || ($user['type'] !== 'admin' && $event['author'] !== $user['type'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        $title = $input['title'] ?? '';
        $description = $input['description'] ?? '';
        $date = $input['date'] ?? '';
        $time = $input['time'] ?? '';
        $location = $input['location'] ?? '';

        try {
            $stmt = $pdo->prepare("UPDATE events SET title = ?, description = ?, event_date = ?, time = ?, location = ? WHERE id = ?");
            $stmt->execute([$title, $description, $date, $time, $location, $id]);
            
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

        // Vérifier que l'utilisateur peut supprimer cet événement
        $stmt = $pdo->prepare("SELECT author FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $event = $stmt->fetch();

        if (!$event || ($user['type'] !== 'admin' && $event['author'] !== $user['type'])) {
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
}
?>
