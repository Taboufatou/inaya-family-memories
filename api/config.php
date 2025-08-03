
<?php
// Configuration de l'API INAYA - Windows Server 2022
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Configuration PostgreSQL - Serveur Local Windows
define('DB_HOST', 'localhost');
define('DB_PORT', '5432');
define('DB_NAME', 'inaya_base');
define('DB_USER', 'faziz');
define('DB_PASS', 'VotreMotDePasseFaziz'); // À modifier selon votre configuration

try {
    $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_PERSISTENT => true
    ]);
} catch (PDOException $e) {
    error_log("Erreur PostgreSQL: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données']);
    exit;
}

// Configuration SMTP Local Windows
define('SMTP_HOST', 'localhost'); // ou votre serveur SMTP
define('SMTP_PORT', 587);
define('SMTP_USER', 'noreply@inaya.zidaf.fr');
define('SMTP_PASS', '$S@rrebourg57400$');
define('SMTP_ENCRYPT', 'tls');

// Fonction pour valider le token JWT avec gestion de session persistante
function validateToken($token) {
    global $pdo;
    if (empty($token)) return false;
    
    // Vérifier si le token existe en base
    try {
        $stmt = $pdo->prepare("SELECT user_id, expires_at FROM user_sessions WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        return $stmt->fetch() !== false;
    } catch (Exception $e) {
        return false;
    }
}

// Fonction pour obtenir l'utilisateur depuis le token avec session persistante
function getUserFromToken($token) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.user_type 
            FROM users u 
            JOIN user_sessions s ON u.id = s.user_id 
            WHERE s.token = ? AND s.expires_at > NOW()
        ");
        $stmt->execute([$token]);
        return $stmt->fetch();
    } catch (Exception $e) {
        return null;
    }
}

// Fonction pour créer une session persistante
function createUserSession($userId) {
    global $pdo;
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + (30 * 24 * 60 * 60)); // 30 jours
    
    try {
        $stmt = $pdo->prepare("INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $token, $expiresAt]);
        return $token;
    } catch (Exception $e) {
        return false;
    }
}

// Fonction pour supprimer une session
function destroyUserSession($token) {
    global $pdo;
    try {
        $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE token = ?");
        $stmt->execute([$token]);
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// Fonction pour envoyer un email
function sendEmail($to, $subject, $body) {
    require_once 'vendor/autoload.php';
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = 'ssl';
        $mail->Port = SMTP_PORT;
        
        $mail->setFrom(SMTP_USER, 'INAYA');
        $mail->addAddress($to);
        
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Erreur envoi email: " . $mail->ErrorInfo);
        return false;
    }
}

// Fonction pour valider la force du mot de passe
function validatePassword($password) {
    return strlen($password) >= 8 && preg_match('/[!$@*%]/', $password);
}

// Fonction pour vérifier les droits d'administration
function isAdmin($token) {
    $user = getUserFromToken($token);
    return $user && $user['user_type'] === 'admin';
}
?>
