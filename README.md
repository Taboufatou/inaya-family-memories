# INAYASPACE - Application de Gestion Familiale

INAYASPACE est une application web sécurisée dédiée à la gestion et au partage de contenus familiaux (photos, vidéos, journal, consultations médicales, événements).

## Technologies utilisées

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: PHP avec PostgreSQL
- **Serveur**: Windows Server 2022 avec IIS et SSL Let's Encrypt
- **Base de données**: PostgreSQL (inaya_base)

## Fonctionnalités

- **Authentification sécurisée** avec session persistante
- **Gestion multi-utilisateurs** (Papa, Maman, Admin)
- **Photos et Vidéos** avec système de commentaires et likes
- **Journal familial** avec historique complet
- **Suivi des consultations médicales**
- **Calendrier des événements**
- **Interface d'administration** complète

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Installation et Déploiement

Consultez le guide détaillé : [Guide de déploiement Windows Server 2022](deployment/windows-server-deploy-guide.md)

### Prérequis
- Windows Server 2022
- IIS avec PHP 8.x
- PostgreSQL 15+
- Certificat SSL Let's Encrypt

### Configuration rapide
```bash
# Cloner le projet
git clone [repository-url]

# Configuration base de données
psql -U postgres -c "CREATE DATABASE inaya_base;"
psql -U postgres -c "CREATE USER faziz WITH PASSWORD 'VotreMotDePasseFaziz';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE inaya_base TO faziz;"

# Import du schéma
psql -U faziz -d inaya_base -f database/schema.sql
```

## Architecture du Projet

### Frontend (React/TypeScript)
- `src/components/` - Composants réutilisables
- `src/hooks/` - Hooks personnalisés (auth, API)
- `src/utils/` - Utilitaires (client API centralisé)
- `src/pages/` - Pages principales

### Backend (PHP)
- `api/` - Scripts PHP pour les endpoints
- `database/` - Schéma et migrations PostgreSQL
- `deployment/` - Guides et fichiers de configuration

### Configuration
- `web.config` - Configuration IIS
- `tailwind.config.ts` - Configuration Tailwind CSS
- `vite.config.ts` - Configuration Vite
