
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Configuration de la base de données
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

// Fonction pour valider le token JWT (simple pour cet exemple)
function validateToken($token) {
    // Dans un vrai projet, utilisez une vraie validation JWT
    return !empty($token);
}

// Fonction pour obtenir l'utilisateur depuis le token
function getUserFromToken($token) {
    // Simulation - dans un vrai projet, décodez le JWT
    if ($token === 'papa_token') return ['id' => 1, 'type' => 'papa'];
    if ($token === 'maman_token') return ['id' => 2, 'type' => 'maman'];
    if ($token === 'admin_token') return ['id' => 3, 'type' => 'admin'];
    return null;
}
?>
