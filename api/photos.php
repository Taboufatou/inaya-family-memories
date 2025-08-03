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
                $stmt = $pdo->prepare("SELECT * FROM photos ORDER BY date_prise DESC");
                $stmt->execute();
                $photos = $stmt->fetchAll();
                echo json_encode(['success' => true, 'photos' => $photos]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de la récupération']);
            }
            break;

        case 'add':
            if ($user['user_type'] !== 'admin' && $user['user_type'] !== 'papa' && $user['user_type'] !== 'maman') {
                http_response_code(403);
                echo json_encode(['error' => 'Non autorisé']);
                exit;
            }

            $titre = $input['titre'] ?? '';
            $description = $input['description'] ?? '';
            $url = $input['url'] ?? '';
            $date_prise = $input['date_prise'] ?? date('Y-m-d');
            $lieu = $input['lieu'] ?? '';

            if (empty($titre) || empty($url)) {
                http_response_code(400);
                echo json_encode(['error' => 'Titre et URL requis']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("INSERT INTO photos (titre, description, url, date_prise, lieu, author, date_upload) VALUES (?, ?, ?, ?, ?, ?, NOW())");
                $stmt->execute([$titre, $description, $url, $date_prise, $lieu, $user['user_type']]);
                
                echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur lors de l\'ajout']);
            }
            break;

        case 'update':
            $id = $input['id'] ?? '';
            if (empty($id)) {
                http_response_code(400);
                echo json_encode(['error' => 'ID requis']);
                exit;
            }

            // Vérifier que l'utilisateur peut modifier cette photo
            $stmt = $pdo->prepare("SELECT author FROM photos WHERE id = ?");
            $stmt->execute([$id]);
            $photo = $stmt->fetch();

            if (!$photo || ($user['user_type'] !== 'admin' && $photo['author'] !== $user['user_type'])) {
                http_response_code(403);
                echo json_encode(['error' => 'Non autorisé']);
                exit;
            }

            $titre = $input['titre'] ?? '';
            $description = $input['description'] ?? '';
            $date_prise = $input['date_prise'] ?? '';
            $lieu = $input['lieu'] ?? '';

            try {
                $stmt = $pdo->prepare("UPDATE photos SET titre = ?, description = ?, date_prise = ?, lieu = ? WHERE id = ?");
                $stmt->execute([$titre, $description, $date_prise, $lieu, $id]);
                
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

            // Vérifier que l'utilisateur peut supprimer cette photo
            $stmt = $pdo->prepare("SELECT author FROM photos WHERE id = ?");
            $stmt->execute([$id]);
            $photo = $stmt->fetch();

            if (!$photo || ($user['user_type'] !== 'admin' && $photo['author'] !== $user['user_type'])) {
                http_response_code(403);
                echo json_encode(['error' => 'Non autorisé']);
                exit;
            }

            try {
                $stmt = $pdo->prepare("DELETE FROM photos WHERE id = ?");
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