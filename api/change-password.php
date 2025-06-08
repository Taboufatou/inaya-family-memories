
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
    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';

    if (empty($currentPassword) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'Mots de passe requis']);
        exit;
    }

    // Valider la force du nouveau mot de passe
    if (!validatePassword($newPassword)) {
        http_response_code(400);
        echo json_encode(['error' => 'Le mot de passe doit contenir au moins 8 caractères et un caractère spécial (!,$,@,*,%)']);
        exit;
    }

    try {
        // Vérifier le mot de passe actuel
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $userData = $stmt->fetch();

        if (!$userData || !password_verify($currentPassword, $userData['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Mot de passe actuel incorrect']);
            exit;
        }

        // Mettre à jour le mot de passe
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $user['id']]);

        // Envoyer un email de confirmation
        $emailSubject = "Changement de mot de passe - INAYASPACE";
        $emailBody = "Votre mot de passe a été modifié avec succès le " . date('d/m/Y à H:i');
        sendEmail($userData['email'] ?? '', $emailSubject, $emailBody);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la modification']);
    }
}
?>
