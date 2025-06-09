
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Configuration de la base de données avec les nouveaux paramètres
define('DB_HOST', 'localhost');
define('DB_NAME', 'yepe0708_inaya');
define('DB_USER', 'Taboufatou');
define('DB_PASS', '$S@rrebourg57400$');

try {
    $pdo = new PDO("pgsql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de connexion à la base de données']);
    exit;
}

// Configuration email O2Switch avec les nouveaux identifiants
define('SMTP_HOST', 'pendragon.o2switch.net');
define('SMTP_PORT', 465);
define('SMTP_USER', 'noreply@inaya.zidaf.fr');
define('SMTP_PASS', '$S@rrebourg57400$');
define('IMAP_HOST', 'pendragon.o2switch.net');
define('IMAP_PORT', 993);

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
        
        $mail->setFrom(SMTP_USER, 'INAYASPACE');
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
