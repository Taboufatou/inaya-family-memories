
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
define('DB_NAME', 'yepe078_inaya');
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

// Configuration email O2Switch
define('SMTP_HOST', 'pendragon.o2switch.net');
define('SMTP_PORT', 465);
define('SMTP_USER', 'noreply@inaya.zidaf.fr'); // À configurer
define('SMTP_PASS', ''); // À configurer
define('IMAP_HOST', 'pendragon.o2switch.net');
define('IMAP_PORT', 993);

// Fonction pour valider le token JWT (simple pour cet exemple)
function validateToken($token) {
    return !empty($token) && strpos($token, '_token') !== false;
}

// Fonction pour obtenir l'utilisateur depuis le token
function getUserFromToken($token) {
    if ($token === 'papa_token') return ['id' => 1, 'type' => 'papa'];
    if ($token === 'maman_token') return ['id' => 2, 'type' => 'maman'];
    if ($token === 'admin_token') return ['id' => 3, 'type' => 'admin'];
    return null;
}

// Fonction pour envoyer un email
function sendEmail($to, $subject, $body) {
    // Configuration PHPMailer pour O2Switch
    require_once 'vendor/autoload.php'; // Si PHPMailer est installé via Composer
    
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
    // Au moins 8 caractères et au moins un caractère spécial (!,$,@,*,%)
    return strlen($password) >= 8 && preg_match('/[!$@*%]/', $password);
}
?>
