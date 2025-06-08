
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
            $stmt = $pdo->prepare("SELECT * FROM journal_entries ORDER BY entry_date DESC");
            $stmt->execute();
            $entries = $stmt->fetchAll();
            echo json_encode($entries);
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
        $content = $input['content'] ?? '';
        $mood = $input['mood'] ?? '';
        $date = $input['date'] ?? date('Y-m-d');

        if (empty($title) || empty($content)) {
            http_response_code(400);
            echo json_encode(['error' => 'Titre et contenu requis']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO journal_entries (title, content, mood, entry_date, author, date_created) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$title, $content, $mood, $date, $user['type']]);
            
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

        // Vérifier que l'utilisateur peut modifier cette entrée
        $stmt = $pdo->prepare("SELECT author FROM journal_entries WHERE id = ?");
        $stmt->execute([$id]);
        $entry = $stmt->fetch();

        if (!$entry || ($user['type'] !== 'admin' && $entry['author'] !== $user['type'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        $title = $input['title'] ?? '';
        $content = $input['content'] ?? '';
        $mood = $input['mood'] ?? '';
        $date = $input['date'] ?? '';

        try {
            $stmt = $pdo->prepare("UPDATE journal_entries SET title = ?, content = ?, mood = ?, entry_date = ? WHERE id = ?");
            $stmt->execute([$title, $content, $mood, $date, $id]);
            
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

        // Vérifier que l'utilisateur peut supprimer cette entrée
        $stmt = $pdo->prepare("SELECT author FROM journal_entries WHERE id = ?");
        $stmt->execute([$id]);
        $entry = $stmt->fetch();

        if (!$entry || ($user['type'] !== 'admin' && $entry['author'] !== $user['type'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM journal_entries WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la suppression']);
        }
        break;
}
?>
