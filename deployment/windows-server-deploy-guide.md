# Guide de Déploiement INAYA - Windows Server 2022

## Prérequis Vérifiés
- ✅ Windows Server 2022
- ✅ IIS avec PHP installé
- ✅ PostgreSQL installé
- ✅ Certificat SSL Let's Encrypt (inaya_SSL)
- ✅ Base de données `inaya_base` créée
- ✅ Utilisateur PostgreSQL `faziz` avec tous les droits

## 1. Configuration PostgreSQL

### 1.1 Vérification de la Base de Données
```sql
-- Connectez-vous à PostgreSQL en tant qu'utilisateur faziz
psql -U faziz -d inaya_base

-- Vérifiez la connexion
\dt
```

### 1.2 Exécution du Schema
```bash
# Naviguez vers le dossier du projet
cd C:\inetpub\wwwroot\inaya

# Exécutez le schema PostgreSQL
psql -U faziz -d inaya_base -f database/schema.sql
```

### 1.3 Configuration de PostgreSQL pour IIS
Ajoutez dans `postgresql.conf` :
```
listen_addresses = 'localhost'
port = 5432
max_connections = 100
```

Redémarrez le service PostgreSQL :
```cmd
net stop postgresql-x64-14
net start postgresql-x64-14
```

## 2. Configuration IIS

### 2.1 Structure des Dossiers
```
C:\inetpub\wwwroot\inaya\
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── api/
│   ├── config.php
│   ├── auth.php
│   ├── photos.php
│   ├── videos.php
│   ├── journal.php
│   ├── events.php
│   ├── consultations.php
│   ├── likes.php
│   ├── comments.php
│   ├── admin.php
│   └── change-password.php
├── uploads/
│   ├── photos/
│   └── videos/
└── web.config
```

### 2.2 Configuration web.config
Créez `C:\inetpub\wwwroot\inaya\web.config` :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <defaultDocument>
            <files>
                <clear />
                <add value="index.html" />
            </files>
        </defaultDocument>
        
        <!-- Configuration HTTPS -->
        <rewrite>
            <rules>
                <rule name="Redirect to HTTPS" stopProcessing="true">
                    <match url=".*" />
                    <conditions>
                        <add input="{HTTPS}" pattern="off" ignoreCase="true" />
                    </conditions>
                    <action type="Redirect" url="https://{HTTP_HOST}/{R:0}" 
                            redirectType="Permanent" />
                </rule>
                
                <!-- Réécriture pour SPA -->
                <rule name="React Routes" stopProcessing="true">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                        <add input="{REQUEST_URI}" pattern="^/api/" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/index.html" />
                </rule>
            </rules>
        </rewrite>
        
        <!-- Headers CORS -->
        <httpProtocol>
            <customHeaders>
                <add name="Access-Control-Allow-Origin" value="https://inaya.zidaf.fr" />
                <add name="Access-Control-Allow-Methods" value="GET, POST, PUT, DELETE, OPTIONS" />
                <add name="Access-Control-Allow-Headers" value="Content-Type, Authorization" />
                <add name="Access-Control-Allow-Credentials" value="true" />
            </customHeaders>
        </httpProtocol>
        
        <!-- Configuration PHP -->
        <handlers>
            <add name="PHP" path="*.php" verb="*" 
                 modules="FastCgiModule" 
                 scriptProcessor="C:\php\php-cgi.exe" 
                 resourceType="File" />
        </handlers>
        
        <!-- Sécurité -->
        <security>
            <requestFiltering>
                <requestLimits maxAllowedContentLength="52428800" />
                <fileExtensions>
                    <add fileExtension=".php" allowed="true" />
                </fileExtensions>
            </requestFiltering>
        </security>
    </system.webServer>
</configuration>
```

### 2.3 Configuration SSL
1. Ouvrez **Gestionnaire IIS**
2. Sélectionnez votre site **inaya**
3. Double-cliquez sur **Liaisons**
4. Ajoutez une liaison HTTPS :
   - Type : https
   - Port : 443
   - Certificat SSL : inaya_SSL
   - Exiger SNI : coché

## 3. Configuration PHP

### 3.1 Vérification des Extensions
Assurez-vous que ces extensions sont activées dans `php.ini` :
```ini
extension=pdo_pgsql
extension=pgsql
extension=openssl
extension=curl
extension=mbstring
extension=fileinfo
extension=gd
```

### 3.2 Configuration PHP pour PostgreSQL
Dans `php.ini` :
```ini
pgsql.allow_persistent = On
pgsql.auto_reset_persistent = Off
pgsql.max_persistent = -1
pgsql.max_links = -1
```

### 3.3 Redémarrage des Services
```cmd
iisreset
net restart w3svc
```

## 4. Déploiement des Fichiers

### 4.1 Build de l'Application React
```bash
# Sur votre machine de développement
npm run build
```

### 4.2 Transfert des Fichiers
Copiez le contenu du dossier `dist/` vers `C:\inetpub\wwwroot\inaya\`

### 4.3 Configuration des Permissions
1. Clic droit sur `C:\inetpub\wwwroot\inaya\`
2. Propriétés → Sécurité
3. Ajoutez l'utilisateur **IIS_IUSRS** avec :
   - Contrôle total sur le dossier `uploads/`
   - Lecture et exécution sur les autres dossiers

## 5. Configuration de la Base de Données

### 5.1 Mise à Jour du Mot de Passe PostgreSQL
```sql
-- Connectez-vous en tant que postgres
psql -U postgres

-- Changez le mot de passe de faziz si nécessaire
ALTER USER faziz PASSWORD 'VotreNouveauMotDePasse';

-- Accordez tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE inaya_base TO faziz;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO faziz;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO faziz;
```

### 5.2 Mise à Jour de config.php
Modifiez `api/config.php` avec le bon mot de passe :
```php
$password = 'VotreNouveauMotDePasseFaziz';
```

## 6. Tests de Fonctionnement

### 6.1 Test de Connexion PostgreSQL
Créez `C:\inetpub\wwwroot\inaya\test_db.php` :
```php
<?php
try {
    $pdo = new PDO("pgsql:host=localhost;port=5432;dbname=inaya_base", "faziz", "VotreMotDePasse");
    echo "Connexion PostgreSQL : OK\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    echo "Nombre d'utilisateurs : " . $stmt->fetchColumn() . "\n";
} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage();
}
?>
```

Accédez à : `https://inaya.zidaf.fr/test_db.php`

### 6.2 Test SSL
Vérifiez que le site redirige automatiquement vers HTTPS :
- `http://inaya.zidaf.fr` → `https://inaya.zidaf.fr`

### 6.3 Test de l'Application
1. Accédez à `https://inaya.zidaf.fr`
2. Testez la connexion avec les comptes :
   - papa@inaya.zidaf.fr / P@paIn@ya2025
   - maman@inaya.zidaf.fr / M@manIn@ya2025
   - admin@inaya.zidaf.fr / $S@rrebourg57400$

## 7. Optimisations et Maintenance

### 7.1 Optimisation PostgreSQL
```sql
-- Optimisation des performances
VACUUM ANALYZE;
REINDEX DATABASE inaya_base;
```

### 7.2 Logs et Monitoring
```cmd
# Logs IIS
C:\inetpub\logs\LogFiles\

# Logs PHP
C:\php\logs\

# Logs PostgreSQL
C:\Program Files\PostgreSQL\14\data\log\
```

### 7.3 Sauvegarde Automatique
Créez un script PowerShell `backup_inaya.ps1` :
```powershell
$date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupPath = "C:\Backups\inaya_$date.sql"

# Sauvegarde PostgreSQL
& "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe" -U faziz -d inaya_base -f $backupPath

# Compression
Compress-Archive -Path $backupPath -DestinationPath "$backupPath.zip"
Remove-Item $backupPath
```

Planifiez dans le Planificateur de tâches Windows.

## 8. Sécurité

### 8.1 Pare-feu Windows
Ouvrez les ports :
- 80 (HTTP - pour redirection)
- 443 (HTTPS)
- 5432 (PostgreSQL - localhost uniquement)

### 8.2 Sécurisation PHP
Dans `php.ini` :
```ini
expose_php = Off
allow_url_fopen = Off
allow_url_include = Off
display_errors = Off
log_errors = On
```

### 8.3 Headers de Sécurité
Ajoutez dans `web.config` :
```xml
<add name="X-Frame-Options" value="DENY" />
<add name="X-Content-Type-Options" value="nosniff" />
<add name="X-XSS-Protection" value="1; mode=block" />
<add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
```

## 9. Dépannage

### 9.1 Erreurs Courantes
**Erreur 500 - Internal Server Error**
- Vérifiez les logs IIS
- Contrôlez les permissions des dossiers
- Vérifiez la configuration PHP

**Erreur de connexion PostgreSQL**
- Vérifiez que le service PostgreSQL est démarré
- Contrôlez les paramètres de connexion dans config.php
- Vérifiez les permissions de l'utilisateur faziz

**Problèmes SSL**
- Vérifiez que le certificat est bien installé
- Contrôlez la configuration des liaisons IIS

### 9.2 Outils de Diagnostic
```cmd
# Test PostgreSQL
psql -U faziz -d inaya_base -c "SELECT version();"

# Test PHP
php -m | findstr pgsql

# Test IIS
appcmd list sites
```

## Support et Contact
En cas de problème, consultez :
- Logs PostgreSQL : `C:\Program Files\PostgreSQL\14\data\log\`
- Logs IIS : `C:\inetpub\logs\LogFiles\`
- Logs PHP : Configurés dans `php.ini`

L'application est maintenant configurée pour fonctionner sur votre serveur Windows avec PostgreSQL et SSL.