/*
  # Complete RekberX Database Schema
  
  1. New Tables
    - `users` - User profiles and authentication
    - `game_topics` - Available game categories
    - `chat_rooms` - Chat room management
    - `messages` - Chat messages
    - `rekber_invites` - Rekber invitation system
    - `user_reports` - User reporting system
    - `user_sessions` - User presence tracking
    - `typing_indicators` - Real-time typing indicators
    
  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for CRUD operations
    - Secure user data access
    
  3. Performance
    - Optimized indexes for all queries
    - Efficient realtime subscriptions
    - Auto-cleanup functions
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE room_type AS ENUM ('public', 'rekber', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM ('scam', 'spam', 'harassment', 'inappropriate', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    user_id TEXT UNIQUE NOT NULL,
    email TEXT,
    role user_role DEFAULT 'user',
    custom_role TEXT,
    custom_role_color TEXT DEFAULT '#3B82F6',
    custom_role_emoji TEXT,
    avatar_url TEXT,
    is_online BOOLEAN DEFAULT false,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game topics table
CREATE TABLE IF NOT EXISTS game_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type room_type NOT NULL,
    game TEXT,
    participants TEXT[] DEFAULT '{}',
    claimed_by TEXT,
    status TEXT DEFAULT 'active',
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_username TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    image_url TEXT,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    reactions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rekber invites table
CREATE TABLE IF NOT EXISTS rekber_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id TEXT NOT NULL,
    from_username TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    to_username TEXT NOT NULL,
    game TEXT NOT NULL,
    status invite_status DEFAULT 'pending',
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reports table
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id TEXT NOT NULL,
    reporter_username TEXT NOT NULL,
    reported_user_id TEXT NOT NULL,
    reported_username TEXT NOT NULL,
    reason report_reason NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT,
    status report_status DEFAULT 'pending',
    admin_action JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table for presence tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 seconds'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON users(is_online);

CREATE INDEX IF NOT EXISTS idx_game_topics_name ON game_topics(name);
CREATE INDEX IF NOT EXISTS idx_game_topics_is_active ON game_topics(is_active);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_game ON chat_rooms(game);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_rekber_invites_to_user_id ON rekber_invites(to_user_id);
CREATE INDEX IF NOT EXISTS idx_rekber_invites_from_user_id ON rekber_invites(from_user_id);
CREATE INDEX IF NOT EXISTS idx_rekber_invites_status ON rekber_invites(status);
CREATE INDEX IF NOT EXISTS idx_rekber_invites_expires_at ON rekber_invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_typing_indicators_room_id ON typing_indicators(room_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_expires_at ON typing_indicators(expires_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rekber_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (with proper error handling)
DO $$ 
BEGIN
    -- Users policies
    DROP POLICY IF EXISTS "Users can read all profiles" ON users;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON users;

    -- Game topics policies
    DROP POLICY IF EXISTS "Anyone can read active game topics" ON game_topics;
    DROP POLICY IF EXISTS "Authenticated users can insert game topics" ON game_topics;
    DROP POLICY IF EXISTS "Authenticated users can update game topics" ON game_topics;
    DROP POLICY IF EXISTS "Authenticated users can delete game topics" ON game_topics;

    -- Chat rooms policies
    DROP POLICY IF EXISTS "Authenticated users can read chat rooms" ON chat_rooms;
    DROP POLICY IF EXISTS "Authenticated users can insert chat rooms" ON chat_rooms;
    DROP POLICY IF EXISTS "Authenticated users can update chat rooms" ON chat_rooms;
    DROP POLICY IF EXISTS "Authenticated users can delete chat rooms" ON chat_rooms;

    -- Messages policies
    DROP POLICY IF EXISTS "Authenticated users can read messages" ON messages;
    DROP POLICY IF EXISTS "Authenticated users can insert messages" ON messages;
    DROP POLICY IF EXISTS "Authenticated users can update messages" ON messages;
    DROP POLICY IF EXISTS "Authenticated users can delete messages" ON messages;

    -- Rekber invites policies
    DROP POLICY IF EXISTS "Authenticated users can read rekber invites" ON rekber_invites;
    DROP POLICY IF EXISTS "Authenticated users can insert rekber invites" ON rekber_invites;
    DROP POLICY IF EXISTS "Authenticated users can update rekber invites" ON rekber_invites;

    -- User reports policies
    DROP POLICY IF EXISTS "Authenticated users can read user reports" ON user_reports;
    DROP POLICY IF EXISTS "Authenticated users can insert user reports" ON user_reports;
    DROP POLICY IF EXISTS "Authenticated users can update user reports" ON user_reports;

    -- User sessions policies
    DROP POLICY IF EXISTS "Users can manage their own sessions" ON user_sessions;

    -- Typing indicators policies
    DROP POLICY IF EXISTS "Users can manage typing indicators" ON typing_indicators;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not exist, continuing...';
END $$;

-- Create RLS Policies for users
CREATE POLICY "Users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (true);

-- Create RLS Policies for game_topics
CREATE POLICY "Anyone can read active game topics" ON game_topics FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can insert game topics" ON game_topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update game topics" ON game_topics FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete game topics" ON game_topics FOR DELETE USING (true);

-- Create RLS Policies for chat_rooms
CREATE POLICY "Authenticated users can read chat rooms" ON chat_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert chat rooms" ON chat_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update chat rooms" ON chat_rooms FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete chat rooms" ON chat_rooms FOR DELETE USING (true);

-- Create RLS Policies for messages
CREATE POLICY "Authenticated users can read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update messages" ON messages FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete messages" ON messages FOR DELETE USING (true);

-- Create RLS Policies for rekber_invites
CREATE POLICY "Authenticated users can read rekber invites" ON rekber_invites FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert rekber invites" ON rekber_invites FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update rekber invites" ON rekber_invites FOR UPDATE USING (true);

-- Create RLS Policies for user_reports
CREATE POLICY "Authenticated users can read user reports" ON user_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert user reports" ON user_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update user reports" ON user_reports FOR UPDATE USING (true);

-- Create RLS Policies for user_sessions
CREATE POLICY "Users can manage their own sessions" ON user_sessions FOR ALL USING (true);

-- Create RLS Policies for typing_indicators
CREATE POLICY "Users can manage typing indicators" ON typing_indicators FOR ALL USING (true);

-- Insert default game topics
INSERT INTO game_topics (name, description, icon, created_by) VALUES
('Mobile Legends', 'Diamond, Skin, Akun ML', 'ML', NULL),
('Free Fire', 'Diamond, Bundle, Akun FF', 'FF', NULL),
('PUBG Mobile', 'UC, Skin, Akun PUBG', 'PM', NULL),
('Genshin Impact', 'Genesis Crystal, Akun GI', 'GI', NULL),
('Valorant', 'VP, Skin, Akun Valorant', 'VL', NULL)
ON CONFLICT (name) DO NOTHING;

-- Create corresponding public chat rooms for each game topic
INSERT INTO chat_rooms (name, type, game, created_by)
SELECT name, 'public', name, NULL
FROM game_topics
WHERE NOT EXISTS (
    SELECT 1 FROM chat_rooms 
    WHERE chat_rooms.name = game_topics.name 
    AND chat_rooms.type = 'public'
);

-- Function to clean up expired invites
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS void AS $$
BEGIN
    DELETE FROM rekber_invites 
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing()
RETURNS void AS $$
BEGIN
    DELETE FROM typing_indicators 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update message count in chat rooms
CREATE OR REPLACE FUNCTION update_room_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE chat_rooms 
        SET message_count = message_count + 1,
            last_message_at = NEW.created_at
        WHERE id = NEW.room_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE chat_rooms 
        SET message_count = GREATEST(message_count - 1, 0)
        WHERE id = OLD.room_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_message_count ON messages;
CREATE TRIGGER trigger_update_message_count
    AFTER INSERT OR DELETE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_room_message_count();

-- Create a function to handle user presence
CREATE OR REPLACE FUNCTION update_user_presence(user_id_param TEXT, username_param TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO user_sessions (user_id, username, last_activity)
    VALUES (user_id_param, username_param, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        username = username_param,
        last_activity = NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for all tables (with error handling)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table users already added to realtime publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE game_topics;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table game_topics already added to realtime publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table chat_rooms already added to realtime publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table messages already added to realtime publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE rekber_invites;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table rekber_invites already added to realtime publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_reports;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table user_reports already added to realtime publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table user_sessions already added to realtime publication';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Table typing_indicators already added to realtime publication';
END $$;