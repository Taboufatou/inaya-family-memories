
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Validation du token et droits admin
$headers = getallheaders();
$token = $headers['Authorization'] ?? '';
if (!validateToken($token) || !isAdmin($token)) {
    http_response_code(401);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit;
}

$user = getUserFromToken($token);

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'config':
            try {
                $stmt = $pdo->query("SELECT * FROM app_config ORDER BY config_key");
                $config = $stmt->fetchAll();
                echo json_encode(['config' => $config]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur serveur']);
            }
            break;
            
        case 'stats':
            try {
                $stats = [];
                
                // Compter les éléments par table
                $tables = ['photos', 'videos', 'consultations', 'journal_entries', 'events'];
                foreach ($tables as $table) {
                    $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
                    $count = $stmt->fetch();
                    $stats[$table] = $count['count'];
                }
                
                // Compter les utilisateurs
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE user_type != 'admin'");
                $userCount = $stmt->fetch();
                $stats['users'] = $userCount['count'];
                
                // Compter les likes et commentaires
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM likes");
                $likeCount = $stmt->fetch();
                $stats['likes'] = $likeCount['count'];
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM comments");
                $commentCount = $stmt->fetch();
                $stats['comments'] = $commentCount['count'];
                
                echo json_encode(['stats' => $stats]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur serveur']);
            }
            break;
            
        case 'logs':
            try {
                $stmt = $pdo->prepare("
                    SELECT al.*, u.email 
                    FROM admin_logs al 
                    JOIN users u ON al.admin_id = u.id 
                    ORDER BY al.created_at DESC 
                    LIMIT 100
                ");
                $stmt->execute();
                $logs = $stmt->fetchAll();
                echo json_encode(['logs' => $logs]);
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

elseif ($method === 'POST') {
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'update_config':
            $configKey = $input['config_key'] ?? '';
            $configValue = $input['config_value'] ?? '';
            
            if (empty($configKey)) {
                http_response_code(400);
                echo json_encode(['error' => 'Clé de configuration manquante']);
                exit;
            }
            
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO app_config (config_key, config_value, updated_by) 
                    VALUES (?, ?, ?) 
                    ON CONFLICT (config_key) 
                    DO UPDATE SET config_value = EXCLUDED.config_value, updated_by = EXCLUDED.updated_by, updated_at = CURRENT_TIMESTAMP
                ");
                $stmt->execute([$configKey, $configValue, $user['id']]);
                
                // Log de l'action
                $stmt = $pdo->prepare("INSERT INTO admin_logs (admin_id, action, details) VALUES (?, ?, ?)");
                $stmt->execute([$user['id'], 'config_update', "Mise à jour de $configKey"]);
                
                echo json_encode(['success' => true]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Erreur serveur']);
            }
            break;
            
        case 'manage_content':
            $contentType = $input['content_type'] ?? '';
            $contentId = $input['content_id'] ?? '';
            $operation = $input['operation'] ?? '';
            $data = $input['data'] ?? [];
            
            if (empty($contentType) || empty($operation)) {
                http_response_code(400);
                echo json_encode(['error' => 'Paramètres manquants']);
                exit;
            }
            
            try {
                $table = $contentType;
                if ($contentType === 'journal') $table = 'journal_entries';
                
                switch ($operation) {
                    case 'update':
                        if (empty($contentId)) {
                            http_response_code(400);
                            echo json_encode(['error' => 'ID de contenu manquant']);
                            exit;
                        }
                        
                        $setParts = [];
                        $values = [];
                        foreach ($data as $key => $value) {
                            $setParts[] = "$key = ?";
                            $values[] = $value;
                        }
                        $values[] = $contentId;
                        
                        $sql = "UPDATE $table SET " . implode(', ', $setParts) . " WHERE id = ?";
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute($values);
                        break;
                        
                    case 'delete':
                        if (empty($contentId)) {
                            http_response_code(400);
                            echo json_encode(['error' => 'ID de contenu manquant']);
                            exit;
                        }
                        
                        $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
                        $stmt->execute([$contentId]);
                        break;
                }
                
                // Log de l'action
                $stmt = $pdo->prepare("INSERT INTO admin_logs (admin_id, action, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$user['id'], $operation, $table, $contentId, json_encode($data)]);
                
                echo json_encode(['success' => true]);
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
