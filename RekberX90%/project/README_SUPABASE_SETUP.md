# 🚀 SETUP SUPABASE DATABASE BARU - STEP BY STEP

## STEP 1: Buat Project Supabase Baru
1. Buka https://supabase.com/dashboard
2. Klik "New Project"
3. Pilih Organization
4. Isi:
   - **Name**: RekberX
   - **Database Password**: Buat password yang kuat (simpan!)
   - **Region**: Southeast Asia (Singapore) - untuk performa terbaik
5. Klik "Create new project"
6. **TUNGGU 2-3 MENIT** sampai project selesai dibuat

## STEP 2: Dapatkan Credentials
Setelah project selesai:
1. Klik **Settings** → **API**
2. Copy:
   - **Project URL**: `https://[project-ref].supabase.co`
   - **anon/public key**: `eyJ...` (JWT token panjang)

## STEP 3: Update Environment Variables
Ganti isi file `.env` dengan:
```
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[your-anon-key]
```

## STEP 4: Setup Database Schema
1. Buka **SQL Editor** di Supabase Dashboard
2. Copy dan paste SQL di bawah ini:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'owner');
CREATE TYPE room_type AS ENUM ('public', 'rekber', 'private');
CREATE TYPE message_type AS ENUM ('text', 'image');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_reason AS ENUM ('scam', 'spam', 'harassment', 'inappropriate', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    user_id TEXT UNIQUE NOT NULL,
    email TEXT,
    role user_role DEFAULT 'user',
    custom_role TEXT,
    custom_role_color TEXT,
    custom_role_emoji TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game topics table
CREATE TABLE game_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat rooms table
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type room_type NOT NULL,
    game TEXT,
    participants TEXT[],
    claimed_by TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_username TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    image_url TEXT,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rekber invites table
CREATE TABLE rekber_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id TEXT NOT NULL,
    from_username TEXT NOT NULL,
    to_user_id TEXT NOT NULL,
    to_username TEXT NOT NULL,
    game TEXT NOT NULL,
    status invite_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reports table
CREATE TABLE user_reports (
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

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_game_topics_name ON game_topics(name);
CREATE INDEX idx_game_topics_is_active ON game_topics(is_active);
CREATE INDEX idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX idx_chat_rooms_game ON chat_rooms(game);
CREATE INDEX idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_rekber_invites_to_user_id ON rekber_invites(to_user_id);
CREATE INDEX idx_rekber_invites_status ON rekber_invites(status);
CREATE INDEX idx_user_reports_reported_user_id ON user_reports(reported_user_id);
CREATE INDEX idx_user_reports_status ON user_reports(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rekber_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read all profiles" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for game_topics
CREATE POLICY "Anyone can read active game topics" ON game_topics FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Authenticated users can insert game topics" ON game_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update game topics" ON game_topics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete game topics" ON game_topics FOR DELETE TO authenticated USING (true);

-- RLS Policies for chat_rooms
CREATE POLICY "Authenticated users can read chat rooms" ON chat_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert chat rooms" ON chat_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update chat rooms" ON chat_rooms FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete chat rooms" ON chat_rooms FOR DELETE TO authenticated USING (true);

-- RLS Policies for messages
CREATE POLICY "Authenticated users can read messages" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update messages" ON messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete messages" ON messages FOR DELETE TO authenticated USING (true);

-- RLS Policies for rekber_invites
CREATE POLICY "Authenticated users can read rekber invites" ON rekber_invites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert rekber invites" ON rekber_invites FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rekber invites" ON rekber_invites FOR UPDATE TO authenticated USING (true);

-- RLS Policies for user_reports
CREATE POLICY "Authenticated users can read user reports" ON user_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert user reports" ON user_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update user reports" ON user_reports FOR UPDATE TO authenticated USING (true);

-- Insert default game topics
INSERT INTO game_topics (name, description, icon, created_by) VALUES
('Mobile Legends', 'Diamond, Skin, Akun', 'ML', (SELECT id FROM users WHERE role = 'owner' LIMIT 1)),
('Free Fire', 'Diamond, Bundle, Akun', 'FF', (SELECT id FROM users WHERE role = 'owner' LIMIT 1)),
('PUBG Mobile', 'UC, Skin, Akun', 'PM', (SELECT id FROM users WHERE role = 'owner' LIMIT 1)),
('Genshin Impact', 'Genesis Crystal, Akun', 'GI', (SELECT id FROM users WHERE role = 'owner' LIMIT 1)),
('Valorant', 'VP, Skin, Akun', 'VL', (SELECT id FROM users WHERE role = 'owner' LIMIT 1));

-- Create corresponding public chat rooms for each game topic
INSERT INTO chat_rooms (name, type, game, created_by)
SELECT name, 'public', name, created_by
FROM game_topics;
```

3. Klik **RUN** dan tunggu sampai selesai

## STEP 5: Test Connection
1. Restart dev server: `npm run dev`
2. Buka website
3. Cek connection status di pojok kanan atas
4. Test register user baru

## STEP 6: Jika Ada Error
Buka Browser Console (F12) dan screenshot error message untuk debugging.

---

**IKUTI STEP INI DENGAN TELITI!** 🚀