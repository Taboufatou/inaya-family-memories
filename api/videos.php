
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
            $stmt = $pdo->prepare("SELECT * FROM videos ORDER BY date_created DESC");
            $stmt->execute();
            $videos = $stmt->fetchAll();
            echo json_encode($videos);
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
        $url = $input['url'] ?? '';
        $category = $input['category'] ?? 'Général';

        if (empty($title) || empty($url)) {
            http_response_code(400);
            echo json_encode(['error' => 'Titre et URL requis']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO videos (title, description, url, category, author, date_created) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$title, $description, $url, $category, $user['type']]);
            
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

        // Vérifier que l'utilisateur peut modifier cette vidéo
        $stmt = $pdo->prepare("SELECT author FROM videos WHERE id = ?");
        $stmt->execute([$id]);
        $video = $stmt->fetch();

        if (!$video || ($user['type'] !== 'admin' && $video['author'] !== $user['type'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        $title = $input['title'] ?? '';
        $description = $input['description'] ?? '';
        $url = $input['url'] ?? '';
        $category = $input['category'] ?? '';

        try {
            $stmt = $pdo->prepare("UPDATE videos SET title = ?, description = ?, url = ?, category = ? WHERE id = ?");
            $stmt->execute([$title, $description, $url, $category, $id]);
            
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

        // Vérifier que l'utilisateur peut supprimer cette vidéo
        $stmt = $pdo->prepare("SELECT author FROM videos WHERE id = ?");
        $stmt->execute([$id]);
        $video = $stmt->fetch();

        if (!$video || ($user['type'] !== 'admin' && $video['author'] !== $user['type'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM videos WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la suppression']);
        }
        break;
}
?>
