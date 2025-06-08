
-- Base de données pour INAYASPACE
-- Configuration pour PostgreSQL chez O2Switch

-- Table des utilisateurs avec les nouveaux comptes
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
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER,
    file_type VARCHAR(50)
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
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration VARCHAR(10),
    file_size INTEGER,
    file_type VARCHAR(50)
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

-- Table pour les logs de changement de mot de passe
CREATE TABLE IF NOT EXISTS password_changes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET
);

-- Insertion des utilisateurs avec les nouveaux mots de passe hashés
-- Papa : P@paIn@ya2025
-- Maman : M@manIn@ya2025  
-- Admin : $S@rrebourg57400$

INSERT INTO users (email, password, user_type) VALUES 
('papa@inaya.zidaf.fr', '$2y$10$XQR8vBGRHZzLzm9zAaKVz.E7KOgD1mNF8rQa.RzG9QpU4nW2mKfFu', 'papa'),
('maman@inaya.zidaf.fr', '$2y$10$YdF2mHj3kLOPq0aA5zBvX.H8xNW7JfPz3K9D2tG8BvT6Q1m4LpRcS', 'maman'),
('admin@inaya.zidaf.fr', '$2y$10$ZeG3nIk4lMPGr1bB6aCwY.I9yOX8KgQz4L0E3uH9CwU7R2n5MqSdT', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date_created);
CREATE INDEX IF NOT EXISTS idx_photos_author ON photos(author);
CREATE INDEX IF NOT EXISTS idx_videos_date ON videos(date_created);
CREATE INDEX IF NOT EXISTS idx_videos_author ON videos(author);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
