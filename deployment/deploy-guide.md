
# Guide de déploiement INAYASPACE sur O2Switch

## 1. Préparation du code

### Build de l'application React
```bash
npm run build
```

### Structure finale à uploader :
```
/public_html/
├── index.html (du build)
├── assets/ (du build)
├── api/
│   ├── config.php
│   ├── auth.php
│   ├── change-password.php
│   ├── photos.php
│   ├── videos.php
│   ├── consultations.php
│   ├── journal.php
│   └── events.php
├── uploads/
│   ├── photos/
│   └── videos/
├── .htaccess
└── robots.txt
```

## 2. Configuration de la base de données PostgreSQL

### Connexion à votre base de données O2Switch :
- **Host** : localhost
- **Database** : yepe0708_inaya
- **User** : Taboufatou
- **Password** : $S@rrebourg57400$

### Exécution du schéma :
1. Connectez-vous à votre panel O2Switch
2. Accédez à la section PostgreSQL
3. Exécutez le contenu du fichier `database/schema.sql`

### Vérification des utilisateurs créés :
- Papa : papa@inaya.zidaf.fr (P@paIn@ya2025)
- Maman : maman@inaya.zidaf.fr (M@manIn@ya2025)
- Admin : admin@inaya.zidaf.fr ($S@rrebourg57400$)

## 3. Configuration du serveur email

### Paramètres SMTP O2Switch :
- **Serveur** : pendragon.o2switch.net
- **Port** : 465
- **Chiffrement** : SSL
- **Utilisateur** : noreply@inaya.zidaf.fr (à créer)
- **Mot de passe** : (à définir dans le panel O2Switch)

### Configuration dans config.php :
Modifiez les constantes SMTP_USER et SMTP_PASS avec vos identifiants.

## 4. Upload des fichiers

### Via FTP/SFTP :
1. Connectez-vous à votre FTP O2Switch
2. Uploadez tous les fichiers du build dans `/public_html/`
3. Uploadez le dossier `api/` dans `/public_html/api/`
4. Renommez `deployment/htaccess.txt` en `.htaccess`

### Permissions recommandées :
- Dossiers : 755
- Fichiers PHP : 644
- Dossier uploads : 777 (temporaire, puis 755)

## 5. Configuration du serveur web

### Création du .htaccess :
Le fichier est déjà prêt dans `deployment/htaccess.txt`

### Vérifications importantes :
- ✅ Redirection HTTPS active
- ✅ Réécriture d'URL pour React Router
- ✅ Configuration CORS pour les API
- ✅ Sécurité des fichiers sensibles

## 6. Tests post-déploiement

### 1. Test de connexion :
- Accédez à https://inaya.zidaf.fr
- Testez la connexion avec chaque compte utilisateur

### 2. Test des API :
```bash
# Test auth
curl -X POST https://inaya.zidaf.fr/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{"email":"papa@inaya.zidaf.fr","password":"P@paIn@ya2025"}'

# Test photos (nécessite un token)
curl https://inaya.zidaf.fr/api/photos.php \
  -H "Authorization: papa_token"
```

### 3. Test de changement de mot de passe :
- Connectez-vous avec un compte
- Testez la fonctionnalité de changement de mot de passe
- Vérifiez la réception de l'email de confirmation

### 4. Test des uploads :
- Testez l'upload de photos
- Testez l'upload de vidéos
- Vérifiez les permissions du dossier `uploads/`

## 7. Configuration SSL

### Activation SSL chez O2Switch :
1. Accédez à votre panel O2Switch
2. Section "SSL/TLS"
3. Activez le certificat Let's Encrypt gratuit
4. Vérifiez la redirection automatique HTTP → HTTPS

## 8. Optimisations post-déploiement

### Cache et performance :
- Vérifiez la compression Gzip
- Testez la mise en cache des assets
- Optimisez les images si nécessaire

### Sécurité :
- Vérifiez les en-têtes de sécurité
- Testez la protection des fichiers sensibles
- Configurez la sauvegarde automatique

### Monitoring :
- Configurez les logs d'erreur PHP
- Testez les notifications email
- Vérifiez les performances de la base de données

## 9. Maintenance

### Sauvegardes :
- Base de données : automatique via O2Switch
- Fichiers : sauvegarde manuelle recommandée
- Uploads : sauvegarde régulière des médias

### Mises à jour :
- Surveillez les mises à jour de sécurité PHP
- Testez régulièrement les fonctionnalités
- Vérifiez l'espace disque utilisé

## 10. Dépannage

### Problèmes courants :
1. **Erreur 500** : Vérifiez les logs PHP et les permissions
2. **API non accessible** : Vérifiez la réécriture d'URL
3. **Upload impossible** : Vérifiez les permissions du dossier uploads
4. **Email non envoyé** : Vérifiez la configuration SMTP

### Logs à consulter :
- Logs Apache : `/logs/`
- Logs PHP : via le panel O2Switch
- Logs de l'application : dans le navigateur (Console)

## 11. Synchronisation avec GitHub

### 1. Connexion à GitHub depuis Lovable :
1. Cliquez sur le bouton GitHub en haut à droite de l'interface Lovable
2. Autorisez l'application Lovable GitHub
3. Sélectionnez votre compte/organisation GitHub
4. Créez un nouveau repository ou connectez-vous à un existant

### 2. Synchronisation automatique :
- Toutes les modifications dans Lovable sont automatiquement synchronisées avec GitHub
- Les modifications faites directement sur GitHub sont synchronisées vers Lovable
- La synchronisation est bidirectionnelle et en temps réel

### 3. Déploiement depuis GitHub :
Une fois le code synchronisé avec GitHub, vous pouvez :
- Cloner le repository localement
- Faire des modifications avec votre IDE préféré
- Utiliser GitHub Actions pour le déploiement automatique
- Continuer à utiliser Lovable pour le développement

### 4. Structure du repository GitHub :
```
votre-repo/
├── src/                 # Code source React
├── public/             # Fichiers publics
├── api/                # Endpoints PHP
├── database/           # Scripts SQL
├── deployment/         # Fichiers de déploiement
├── package.json        # Dépendances Node.js
├── vite.config.ts      # Configuration Vite
└── README.md          # Documentation
```

## Contact support

En cas de problème technique persistant :
- Support O2Switch : https://www.o2switch.fr/support/
- Documentation O2Switch : https://faq.o2switch.fr/
- Support Lovable : https://docs.lovable.dev/
