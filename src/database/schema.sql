-- ============================================
-- FEETI - Schéma de Base de Données SQL
-- Plateforme de Billetterie en Ligne
-- ============================================
-- 
-- Ce fichier contient le schéma SQL complet pour la plateforme Feeti.
-- Compatible avec PostgreSQL, MySQL, et autres SGBD relationnels.
--
-- Note: Ce schéma est fourni comme référence pour ceux qui préfèrent
-- une base de données SQL traditionnelle à la place de Firebase.
-- ============================================

-- ============================================
-- TABLE: users
-- Gestion des utilisateurs et authentification
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uid VARCHAR(255) UNIQUE NOT NULL, -- Firebase UID ou identifiant externe
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar TEXT,
    password_hash VARCHAR(255), -- Stocker uniquement le hash, jamais le mot de passe en clair
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin', 'super_admin')),
    admin_role VARCHAR(50) DEFAULT 'user' CHECK (admin_role IN ('super_admin', 'admin', 'moderator', 'support', 'organizer', 'user')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'banned')),
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- TABLE: events
-- Gestion des événements
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL, -- URL-friendly version du titre
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(500),
    latitude DECIMAL(10, 8), -- Coordonnées GPS pour la carte
    longitude DECIMAL(11, 8),
    image TEXT, -- URL de l'image principale
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'FCFA',
    category VARCHAR(100) NOT NULL,
    tags TEXT[], -- Array de tags pour la recherche
    attendees INTEGER DEFAULT 0,
    max_attendees INTEGER NOT NULL,
    is_live BOOLEAN DEFAULT FALSE,
    organizer_name VARCHAR(255),
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_is_live ON events(is_live);
CREATE INDEX idx_events_slug ON events(slug);

-- Index pour la recherche full-text (PostgreSQL)
CREATE INDEX idx_events_search ON events USING GIN(to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- ============================================
-- TABLE: tickets
-- Gestion des billets
-- ============================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(50) UNIQUE NOT NULL, -- Code unique du billet (ex: FEETI-2024-001234)
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_title VARCHAR(500),
    event_date DATE,
    event_time TIME,
    event_location VARCHAR(500),
    event_image TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'FCFA',
    holder_name VARCHAR(255) NOT NULL,
    holder_email VARCHAR(255) NOT NULL,
    holder_phone VARCHAR(50),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    qr_code TEXT NOT NULL, -- URL du QR code ou données encodées
    status VARCHAR(50) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'expired', 'cancelled', 'refunded')),
    purchase_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_date TIMESTAMP,
    expired_date TIMESTAMP,
    cancelled_date TIMESTAMP,
    refunded_date TIMESTAMP,
    quantity INTEGER DEFAULT 1,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    validation_code VARCHAR(20), -- Code de validation à 6 chiffres
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Organisateur qui a validé le billet
    notes TEXT, -- Notes de l'organisateur
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_tickets_qr ON tickets(qr_code);
CREATE INDEX idx_tickets_transaction ON tickets(transaction_id);

-- ============================================
-- TABLE: transactions
-- Gestion des transactions financières
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(50) UNIQUE NOT NULL, -- Code unique de transaction
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'FCFA',
    fees DECIMAL(10, 2) DEFAULT 0, -- Frais de transaction
    total_amount DECIMAL(10, 2) NOT NULL, -- Montant total = amount + fees
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('stripe', 'paystack', 'mobile_money', 'cash', 'bank_transfer')),
    payment_provider_id VARCHAR(255), -- ID de la transaction chez le fournisseur de paiement
    tickets_count INTEGER NOT NULL DEFAULT 1,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    billing_address TEXT,
    error_message TEXT, -- Message d'erreur en cas d'échec
    refund_reason TEXT,
    metadata JSONB, -- Données supplémentaires (format JSON)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_event ON transactions(event_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_code ON transactions(transaction_code);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX idx_transactions_date ON transactions(created_at);

-- ============================================
-- TABLE: event_reviews
-- Avis et notes sur les événements
-- ============================================
CREATE TABLE event_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    helpful_count INTEGER DEFAULT 0, -- Nombre de "utile"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id) -- Un utilisateur ne peut laisser qu'un seul avis par événement
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_reviews_event ON event_reviews(event_id);
CREATE INDEX idx_reviews_user ON event_reviews(user_id);
CREATE INDEX idx_reviews_rating ON event_reviews(rating);

-- ============================================
-- TABLE: favorites
-- Événements favoris des utilisateurs
-- ============================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_event ON favorites(event_id);

-- ============================================
-- TABLE: notifications
-- Notifications utilisateurs
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'ticket', 'event', 'promotion')),
    link TEXT, -- Lien vers la ressource concernée
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at);

-- ============================================
-- TABLE: blog_posts
-- Articles de blog
-- ============================================
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_featured ON blog_posts(is_featured);

-- ============================================
-- TABLE: analytics_events
-- Tracking des événements analytics
-- ============================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- page_view, event_view, ticket_purchase, etc.
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    referrer TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes analytics
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_event ON analytics_events(event_id);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_date ON analytics_events(created_at);

-- ============================================
-- VUES (VIEWS)
-- Vues utiles pour les statistiques
-- ============================================

-- Vue: Statistiques des événements
CREATE VIEW event_stats AS
SELECT 
    e.id,
    e.title,
    e.organizer_id,
    COUNT(DISTINCT t.id) as tickets_sold,
    SUM(t.price) as total_revenue,
    AVG(r.rating) as average_rating,
    COUNT(DISTINCT r.id) as review_count,
    e.view_count,
    e.share_count
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('valid', 'used')
LEFT JOIN event_reviews r ON e.id = r.event_id AND r.status = 'approved'
GROUP BY e.id;

-- Vue: Top organisateurs
CREATE VIEW top_organizers AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT e.id) as events_count,
    COUNT(DISTINCT t.id) as tickets_sold,
    SUM(t.price) as total_revenue
FROM users u
LEFT JOIN events e ON u.id = e.organizer_id
LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('valid', 'used')
WHERE u.role IN ('organizer', 'admin', 'super_admin')
GROUP BY u.id
ORDER BY total_revenue DESC;

-- Vue: Revenus mensuels
CREATE VIEW monthly_revenue AS
SELECT 
    DATE_TRUNC('month', completed_at) as month,
    COUNT(*) as transaction_count,
    SUM(total_amount) as revenue,
    AVG(total_amount) as avg_transaction
FROM transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', completed_at)
ORDER BY month DESC;

-- ============================================
-- FONCTIONS
-- Fonctions utiles pour la base de données
-- ============================================

-- Fonction: Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables pertinentes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Générer un code de billet unique
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_code VARCHAR(50);
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'FEETI-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
        SELECT EXISTS(SELECT 1 FROM tickets WHERE ticket_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Fonction: Générer un code de transaction unique
CREATE OR REPLACE FUNCTION generate_transaction_code()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_code VARCHAR(50);
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := 'TRX-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999999)::TEXT, 7, '0');
        SELECT EXISTS(SELECT 1 FROM transactions WHERE transaction_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DONNÉES DE TEST (SEED DATA)
-- Données de démonstration pour le développement
-- ============================================

-- Utilisateur administrateur de test
INSERT INTO users (uid, name, email, password_hash, role, admin_role, is_verified, status)
VALUES 
    ('admin-001', 'Admin Feeti', 'admin@feeti.com', '$2b$10$example', 'super_admin', 'super_admin', TRUE, 'active'),
    ('organizer-001', 'MusicEvents Pro', 'organizer@feeti.com', '$2b$10$example', 'organizer', 'organizer', TRUE, 'active'),
    ('user-001', 'John Doe', 'user@feeti.com', '$2b$10$example', 'user', 'user', TRUE, 'active');

-- Événements de test
INSERT INTO events (title, slug, description, date, time, location, image, price, currency, category, tags, max_attendees, is_live, organizer_name, organizer_id, status, moderation_status)
VALUES 
    (
        'Festival Électro Summer',
        'festival-electro-summer',
        'Le plus grand festival de musique électronique.',
        '2024-07-15',
        '20:00:00',
        'Brazzaville',
        'https://images.unsplash.com/photo-1686327139120-04ff48b9f8aa',
        45000,
        'FCFA',
        'Music',
        ARRAY['Music', 'Festival', 'Électro'],
        5000,
        TRUE,
        'MusicEvents Pro',
        (SELECT id FROM users WHERE email = 'organizer@feeti.com'),
        'published',
        'approved'
    ),
    (
        'Concert Jazz Live',
        'concert-jazz-live',
        'Soirée jazz intimiste en streaming.',
        '2024-06-20',
        '18:30:00',
        'Studio Live Brazzaville',
        'https://images.unsplash.com/photo-1559537660-293b028544a7',
        15000,
        'FCFA',
        'Concert',
        ARRAY['Concert', 'Jazz', 'Live'],
        500,
        TRUE,
        'MusicEvents Pro',
        (SELECT id FROM users WHERE email = 'organizer@feeti.com'),
        'published',
        'approved'
    );

-- ============================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================

COMMENT ON TABLE users IS 'Table des utilisateurs avec authentification et rôles';
COMMENT ON TABLE events IS 'Table des événements avec toutes leurs informations';
COMMENT ON TABLE tickets IS 'Table des billets vendus avec codes QR et validation';
COMMENT ON TABLE transactions IS 'Table des transactions financières et paiements';
COMMENT ON TABLE event_reviews IS 'Avis et notes laissés par les utilisateurs sur les événements';
COMMENT ON TABLE favorites IS 'Événements mis en favoris par les utilisateurs';
COMMENT ON TABLE notifications IS 'Notifications push et emails envoyées aux utilisateurs';
COMMENT ON TABLE blog_posts IS 'Articles de blog et actualités de la plateforme';
COMMENT ON TABLE analytics_events IS 'Données analytics pour le suivi et les statistiques';

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

-- Pour sauvegarder ce schéma dans un fichier:
-- pg_dump -s -U username database_name > schema.sql

-- Pour restaurer ce schéma:
-- psql -U username database_name < schema.sql
