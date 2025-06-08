
<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
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
            // Dans un vrai projet, générez un vrai JWT
            $token = $user['user_type'] . '_token';
            
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
            http_response_code(401);
            echo json_encode(['error' => 'Identifiants invalides']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}
?>
