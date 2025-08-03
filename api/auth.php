
<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Vérifier que l'input JSON est valide
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON invalide']);
    exit;
}

if ($method === 'POST') {
    $action = $input['action'] ?? 'login';
    
    if ($action === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email et mot de passe requis']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                // Créer une session persistante
                $token = createUserSession($user['id']);
                
                if ($token) {
                    echo json_encode([
                        'success' => true,
                        'token' => $token,
                        'user' => [
                            'id' => $user['id'],
                            'email' => $user['email'],
                            'type' => $user['user_type']
                        ]
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Erreur lors de la création de session']);
                }
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Identifiants invalides']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur serveur']);
        }
    }
    
    elseif ($action === 'logout') {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        
        if (destroyUserSession($token)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erreur lors de la déconnexion']);
        }
    }
    
    elseif ($action === 'verify') {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        
        if (validateToken($token)) {
            $user = getUserFromToken($token);
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'type' => $user['user_type']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Session expirée']);
        }
    }
}
?>
