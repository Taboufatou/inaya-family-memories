
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
        case 'toggle':
            $contentType = $input['type'] ?? '';
            $contentId = $input['item_id'] ?? '';
            $emojiId = $input['emoji_id'] ?? 1; // Par défaut: coeur
            
            if (empty($contentType) || empty($contentId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Paramètres manquants']);
                exit;
            }
            
            try {
                // Vérifier si l'utilisateur a déjà liké
                $stmt = $pdo->prepare("SELECT id FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?");
                $stmt->execute([$user['id'], $contentType, $contentId]);
                $existingLike = $stmt->fetch();
                
                if ($existingLike) {
                    // Supprimer le like existant
                    $stmt = $pdo->prepare("DELETE FROM likes WHERE id = ?");
                    $stmt->execute([$existingLike['id']]);
                    echo json_encode(['success' => true, 'action' => 'removed']);
                } else {
                    // Créer un nouveau like
                    $stmt = $pdo->prepare("INSERT INTO likes (user_id, content_type, content_id, emoji_id) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$user['id'], $contentType, $contentId, $emojiId]);
                    echo json_encode(['success' => true, 'action' => 'added']);
                }
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur serveur']);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Action non reconnue']);
    }
}
?>
