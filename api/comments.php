
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

if ($method === 'GET') {
    $contentType = $_GET['content_type'] ?? '';
    $contentId = $_GET['content_id'] ?? '';
    
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
        
        echo json_encode(['comments' => $comments]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}

elseif ($method === 'POST') {
    $contentType = $input['content_type'] ?? '';
    $contentId = $input['content_id'] ?? '';
    $commentText = trim($input['comment_text'] ?? '');
    
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
}

elseif ($method === 'PUT') {
    $commentId = $input['comment_id'] ?? '';
    $commentText = trim($input['comment_text'] ?? '');
    
    if (empty($commentId) || empty($commentText)) {
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
        // Vérifier que l'utilisateur peut modifier ce commentaire
        $stmt = $pdo->prepare("SELECT user_id FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();
        
        if (!$comment || ($comment['user_id'] != $user['id'] && $user['user_type'] !== 'admin')) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE comments SET comment_text = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$commentText, $commentId]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}

elseif ($method === 'DELETE') {
    $commentId = $input['comment_id'] ?? '';
    
    if (empty($commentId)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de commentaire manquant']);
        exit;
    }
    
    try {
        // Vérifier que l'utilisateur peut supprimer ce commentaire
        $stmt = $pdo->prepare("SELECT user_id FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();
        
        if (!$comment || ($comment['user_id'] != $user['id'] && $user['user_type'] !== 'admin')) {
            http_response_code(403);
            echo json_encode(['error' => 'Non autorisé']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
        $stmt->execute([$commentId]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}
?>
