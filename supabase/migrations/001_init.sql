-- Myanmar Vocab App - initial schema
-- Run in Supabase SQL Editor or: supabase db push

CREATE TABLE app_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_review_mode BOOLEAN NOT NULL DEFAULT false,
  forgot_password_contact TEXT,
  forgot_password_qr_url TEXT,
  author_wechat_qr_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wechat_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  streak_days INT NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE books (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  word_count INT NOT NULL DEFAULT 0,
  chapter_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  word_count INT NOT NULL DEFAULT 0
);

CREATE TABLE words (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  word_mm TEXT NOT NULL,
  word_en TEXT,
  word_zh TEXT NOT NULL,
  phonetic TEXT,
  notes TEXT,
  example_sentence_mm TEXT,
  example_sentence_zh TEXT,
  audio_url TEXT,
  image_url TEXT
);

CREATE TABLE activation_codes (
  code TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id),
  max_uses INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_book_unlocks (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id),
  unlocked_via TEXT NOT NULL DEFAULT 'activation_code',
  code_used TEXT REFERENCES activation_codes(code),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE user_chapter_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  mastered_count INT NOT NULL DEFAULT 0,
  last_word_index INT NOT NULL DEFAULT 0,
  last_studied_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE user_word_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new',
  familiar BOOLEAN,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);

CREATE TABLE user_vocabulary (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  starred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);

CREATE TABLE banners (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_self ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY user_book_unlocks_self ON user_book_unlocks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_chapter_progress_self ON user_chapter_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_word_progress_self ON user_word_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_vocabulary_self ON user_vocabulary FOR ALL USING (auth.uid() = user_id);

CREATE POLICY categories_read ON categories FOR SELECT TO authenticated USING (is_visible = true);
CREATE POLICY books_read ON books FOR SELECT TO authenticated USING (true);
CREATE POLICY chapters_read ON chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY words_read ON words FOR SELECT TO authenticated USING (true);
CREATE POLICY banners_read ON banners FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY app_config_read ON app_config FOR SELECT TO authenticated USING (true);

-- activation_codes: no client access
CREATE POLICY activation_codes_deny ON activation_codes FOR SELECT TO authenticated USING (false);

-- Allow anon read for app_config on login page (forgot password)
CREATE POLICY app_config_anon_read ON app_config FOR SELECT TO anon USING (true);
