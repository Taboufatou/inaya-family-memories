
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
        // Récupérer les likes avec émojis
        $stmt = $pdo->prepare("
            SELECT l.id, l.user_id, e.emoji, e.name as emoji_name, u.email, l.created_at
            FROM likes l 
            JOIN emoji_types e ON l.emoji_id = e.id 
            JOIN users u ON l.user_id = u.id 
            WHERE l.content_type = ? AND l.content_id = ?
            ORDER BY l.created_at DESC
        ");
        $stmt->execute([$contentType, $contentId]);
        $likes = $stmt->fetchAll();
        
        // Compter par emoji
        $emojiCounts = [];
        foreach ($likes as $like) {
            $emoji = $like['emoji'];
            if (!isset($emojiCounts[$emoji])) {
                $emojiCounts[$emoji] = ['count' => 0, 'users' => []];
            }
            $emojiCounts[$emoji]['count']++;
            $emojiCounts[$emoji]['users'][] = $like['email'];
        }
        
        // Vérifier si l'utilisateur a déjà liké
        $userLike = array_filter($likes, function($like) use ($user) {
            return $like['user_id'] == $user['id'];
        });
        
        echo json_encode([
            'likes' => $likes,
            'emoji_counts' => $emojiCounts,
            'user_has_liked' => !empty($userLike),
            'user_emoji' => !empty($userLike) ? array_values($userLike)[0]['emoji'] : null
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}

elseif ($method === 'POST') {
    $contentType = $input['content_type'] ?? '';
    $contentId = $input['content_id'] ?? '';
    $emojiId = $input['emoji_id'] ?? '';
    
    if (empty($contentType) || empty($contentId) || empty($emojiId)) {
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
            // Mettre à jour l'emoji
            $stmt = $pdo->prepare("UPDATE likes SET emoji_id = ? WHERE id = ?");
            $stmt->execute([$emojiId, $existingLike['id']]);
            echo json_encode(['success' => true, 'action' => 'updated']);
        } else {
            // Créer un nouveau like
            $stmt = $pdo->prepare("INSERT INTO likes (user_id, content_type, content_id, emoji_id) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user['id'], $contentType, $contentId, $emojiId]);
            echo json_encode(['success' => true, 'action' => 'created']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}

elseif ($method === 'DELETE') {
    $contentType = $input['content_type'] ?? '';
    $contentId = $input['content_id'] ?? '';
    
    if (empty($contentType) || empty($contentId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Paramètres manquants']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?");
        $stmt->execute([$user['id'], $contentType, $contentId]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}
?>
