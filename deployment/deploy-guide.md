
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
│   ├── events.php
│   ├── likes.php
│   ├── comments.php
│   └── admin.php
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

### Exécution du schéma étendu :
1. Connectez-vous à votre panel O2Switch
2. Accédez à la section PostgreSQL
3. Exécutez le contenu du fichier `database/schema.sql`

### Fonctionnalités de la base de données :
- **Sessions persistantes** : Les utilisateurs restent connectés
- **Système de likes avec émojis** : Choix d'émojis pour les likes
- **Commentaires** : Système complet avec modification/suppression
- **Panel d'administration** : Configuration dynamique de l'application
- **Logs d'administration** : Traçabilité des actions admin

### Vérification des utilisateurs créés :
- Papa : papa@inaya.zidaf.fr (P@paIn@ya2025)
- Maman : maman@inaya.zidaf.fr (M@manIn@ya2025)
- Admin : admin@inaya.zidaf.fr ($S@rrebourg57400$)

## 3. Configuration du serveur email

### Paramètres SMTP O2Switch (Mis à jour) :
- **Serveur** : pendragon.o2switch.net
- **Port** : 465
- **Chiffrement** : SSL
- **Utilisateur** : noreply@inaya.zidaf.fr
- **Mot de passe** : $S@rrebourg57400$

### Configuration dans config.php :
Les identifiants email sont maintenant configurés avec vos paramètres.

## 4. Upload des fichiers

### Via FTP/SFTP :
1. Connectez-vous à votre FTP O2Switch
2. Uploadez tous les fichiers du build dans `/public_html/`
3. Uploadez le dossier `api/` complet dans `/public_html/api/`
4. Renommez `deployment/htaccess.txt` en `.htaccess`

### Nouveaux endpoints API :
- `/api/likes.php` - Gestion des likes avec émojis
- `/api/comments.php` - Système de commentaires
- `/api/admin.php` - Panel d'administration

### Permissions recommandées :
- Dossiers : 755
- Fichiers PHP : 644
- Dossier uploads : 777 (temporaire, puis 755)

## 5. Fonctionnalités avancées implémentées

### 1. Système de likes unique avec émojis :
- Chaque utilisateur ne peut liker qu'une fois par contenu
- Choix d'émojis : ❤️ 😍 🥰 😊 👏 🎉 ✨ 🔥
- Possibilité de changer son emoji ou retirer son like

### 2. Système de commentaires complet :
- Limite de 150 caractères par commentaire
- Modification et suppression par le propriétaire
- L'admin peut tout modifier/supprimer

### 3. Panel d'administration dynamique :
- Modification en temps réel de la configuration
- Statistiques complètes de l'application
- Logs de toutes les actions administrateur
- Changement du titre, sous-titre, ordre des sections

### 4. Persistance complète :
- Sessions sécurisées avec tokens
- Reconnexion automatique après rafraîchissement
- Expiration de session après 30 jours

### 5. Filtres d'historique avancés :
- Filtrage par période, auteur, recherche
- Dates personnalisées
- Application dans toutes les sections

## 6. Tests post-déploiement

### 1. Test de connexion et persistance :
```bash
# Test auth avec session
curl -X POST https://inaya.zidaf.fr/api/auth.php \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"papa@inaya.zidaf.fr","password":"P@paIn@ya2025"}'
```

### 2. Test des nouvelles fonctionnalités :
- Testez les likes avec émojis
- Testez les commentaires
- Testez le panel d'administration (compte admin)
- Vérifiez la persistance en rafraîchissant la page

### 3. Test du panel d'administration :
- Connectez-vous avec le compte admin
- Modifiez le titre de l'application
- Vérifiez que les changements s'appliquent immédiatement

## 7. Synchronisation avec GitHub

### 1. Connexion à GitHub depuis Lovable :
1. Cliquez sur le bouton GitHub en haut à droite de l'interface Lovable
2. Autorisez l'application Lovable GitHub
3. Sélectionnez votre compte/organisation GitHub
4. Créez un nouveau repository ou connectez-vous à un existant

### 2. Synchronisation automatique :
- Toutes les modifications dans Lovable sont automatiquement synchronisées avec GitHub
- Les modifications faites directement sur GitHub sont synchronisées vers Lovable
- La synchronisation est bidirectionnelle et en temps réel

### 3. Structure du repository GitHub mise à jour :
```
votre-repo/
├── src/                 # Code source React avec nouveaux composants
│   ├── components/
│   │   ├── EmojiLikeButton.tsx
│   │   ├── CommentsSection.tsx
│   │   ├── AdminPanel.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useAuth.tsx  # Hook d'authentification persistante
│   └── ...
├── api/                 # Endpoints PHP complets
│   ├── likes.php        # API likes avec émojis
│   ├── comments.php     # API commentaires
│   ├── admin.php        # API administration
│   └── ...
├── database/
│   └── schema.sql       # Schéma étendu avec toutes les tables
├── deployment/
│   └── deploy-guide.md  # Ce guide
└── ...
```

### 4. Workflow de déploiement recommandé :
1. Développement dans Lovable
2. Synchronisation automatique vers GitHub
3. Tests en local si nécessaire
4. Déploiement depuis GitHub vers O2Switch

## 8. Monitoring et maintenance

### Nouvelles tables à surveiller :
- `user_sessions` : Sessions actives
- `likes` : Likes avec émojis
- `comments` : Commentaires des utilisateurs
- `admin_logs` : Actions d'administration
- `app_config` : Configuration dynamique

### Nettoyage automatique :
- Les sessions expirées sont automatiquement nettoyées
- Les logs d'administration peuvent être archivés périodiquement

## 9. Sécurité avancée

### Tokens de session :
- Tokens sécurisés générés aléatoirement
- Expiration automatique après 30 jours
- Validation côté serveur pour chaque requête

### Contrôle d'accès :
- Validation des droits pour chaque action
- L'admin peut tout modifier
- Les utilisateurs ne peuvent modifier que leur contenu

## 10. Optimisations de performance

### Index de base de données :
- Index sur les tokens de session
- Index sur les likes par utilisateur/contenu
- Index sur les dates pour les filtres

### Cache côté client :
- Persistance des données utilisateur
- Rechargement intelligent des listes

## Contact support

En cas de problème technique :
- Support O2Switch : https://www.o2switch.fr/support/
- Support Lovable : https://docs.lovable.dev/
- Documentation PostgreSQL : https://www.postgresql.org/docs/
