
-- Base de données pour INAYASPACE
-- À exécuter dans PostgreSQL

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('papa', 'maman', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des photos
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'Général',
    author VARCHAR(10) NOT NULL CHECK (author IN ('papa', 'maman')),
    likes INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des vidéos
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'Général',
    author VARCHAR(10) NOT NULL CHECK (author IN ('papa', 'maman')),
    likes INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des consultations
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    lieu VARCHAR(200) NOT NULL,
    professionnel VARCHAR(200) NOT NULL,
    consultation_date DATE NOT NULL,
    heure TIME,
    commentaires TEXT,
    author VARCHAR(10) NOT NULL CHECK (author IN ('papa', 'maman')),
    likes INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du journal
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    entry_date DATE NOT NULL,
    author VARCHAR(10) NOT NULL CHECK (author IN ('papa', 'maman')),
    likes INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    time TIME,
    location VARCHAR(200),
    author VARCHAR(10) NOT NULL CHECK (author IN ('papa', 'maman')),
    likes INTEGER DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des utilisateurs par défaut
INSERT INTO users (email, password, user_type) VALUES 
('papa@inaya.zidaf.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'papa'),
('maman@inaya.zidaf.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'maman'),
('admin@inaya.zidaf.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Note: Les mots de passe ci-dessus sont hashés pour "password"
-- Vous devrez les remplacer par les vrais mots de passe hashés :
-- Papa : P@paIn@ya2025
-- Maman : M@manIn@ya2025  
-- Admin : $S@rrebourg57400$
