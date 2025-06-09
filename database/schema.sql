
-- Base de données complète pour INAYASPACE
-- Configuration pour PostgreSQL chez O2Switch

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('papa', 'maman', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sessions pour la persistance
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des émojis disponibles pour les likes
CREATE TABLE IF NOT EXISTS emoji_types (
    id SERIAL PRIMARY KEY,
    emoji VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL
);

-- Table des likes avec choix d'émojis et unicité par utilisateur
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('photo', 'video', 'consultation', 'journal', 'event')),
    content_id INTEGER NOT NULL,
    emoji_id INTEGER REFERENCES emoji_types(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_type, content_id)
);

-- Table des commentaires
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('photo', 'video', 'consultation', 'journal', 'event')),
    content_id INTEGER NOT NULL,
    comment_text VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des photos
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100) DEFAULT 'Général',
    author_id INTEGER REFERENCES users(id),
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
    author_id INTEGER REFERENCES users(id),
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
    author_id INTEGER REFERENCES users(id),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table du journal
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    entry_date DATE NOT NULL,
    author_id INTEGER REFERENCES users(id),
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
    author_id INTEGER REFERENCES users(id),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour la configuration de l'application (pour l'admin)
CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'administration
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des types d'émojis
INSERT INTO emoji_types (emoji, name) VALUES 
('❤️', 'Cœur'),
('😍', 'Yeux cœur'),
('🥰', 'Sourire amoureux'),
('😊', 'Sourire'),
('👏', 'Applaudissements'),
('🎉', 'Fête'),
('✨', 'Étoiles'),
('🔥', 'Feu')
ON CONFLICT DO NOTHING;

-- Insertion des utilisateurs avec les nouveaux mots de passe hashés
INSERT INTO users (email, password, user_type) VALUES 
('papa@inaya.zidaf.fr', '$2y$10$XQR8vBGRHZzLzm9zAaKVz.E7KOgD1mNF8rQa.RzG9QpU4nW2mKfFu', 'papa'),
('maman@inaya.zidaf.fr', '$2y$10$YdF2mHj3kLOPq0aA5zBvX.H8xNW7JfPz3K9D2tG8BvT6Q1m4LpRcS', 'maman'),
('admin@inaya.zidaf.fr', '$2y$10$ZeG3nIk4lMPGr1bB6aCwY.I9yOX8KgQz4L0E3uH9CwU7R2n5MqSdT', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Configuration par défaut de l'application
INSERT INTO app_config (config_key, config_value) VALUES 
('app_title', 'INAYASPACE'),
('app_subtitle', 'L\'espace dédié à notre princesse'),
('sections_order', '["dashboard", "photos", "videos", "consultations", "journal", "events"]'),
('theme_color', 'gradient-primary')
ON CONFLICT (config_key) DO NOTHING;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_likes_user_content ON likes(user_id, content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date_created);
CREATE INDEX IF NOT EXISTS idx_photos_author ON photos(author_id);
CREATE INDEX IF NOT EXISTS idx_videos_date ON videos(date_created);
CREATE INDEX IF NOT EXISTS idx_videos_author ON videos(author_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
