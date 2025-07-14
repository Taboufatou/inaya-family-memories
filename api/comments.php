
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
            $contentType = $input['type'] ?? '';
            $contentId = $input['item_id'] ?? '';
            
            if (empty($contentType) || empty($contentId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Paramètres manquants']);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare("
                    SELECT c.*, u.email, u.user_type 
                    FROM comments c 
                    JOIN users u ON c.user_id = u.id 
                    WHERE c.content_type = ? AND c.content_id = ?
                    ORDER BY c.created_at ASC
                ");
                $stmt->execute([$contentType, $contentId]);
                $comments = $stmt->fetchAll();
                
                echo json_encode(['success' => true, 'comments' => $comments]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur serveur']);
            }
            break;

        case 'add':
            $contentType = $input['type'] ?? '';
            $contentId = $input['item_id'] ?? '';
            $commentText = trim($input['content'] ?? '');
            
            if (empty($contentType) || empty($contentId) || empty($commentText)) {
                http_response_code(400);
                echo json_encode(['error' => 'Paramètres manquants']);
                exit;
            }
            
            if (strlen($commentText) > 150) {
                http_response_code(400);
                echo json_encode(['error' => 'Le commentaire ne peut pas dépasser 150 caractères']);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare("INSERT INTO comments (user_id, content_type, content_id, comment_text) VALUES (?, ?, ?, ?)");
                $stmt->execute([$user['id'], $contentType, $contentId, $commentText]);
                
                $commentId = $pdo->lastInsertId();
                
                // Retourner le commentaire créé
                $stmt = $pdo->prepare("
                    SELECT c.*, u.email, u.user_type 
                    FROM comments c 
                    JOIN users u ON c.user_id = u.id 
                    WHERE c.id = ?
                ");
                $stmt->execute([$commentId]);
                $comment = $stmt->fetch();
                
                echo json_encode(['success' => true, 'comment' => $comment]);
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
