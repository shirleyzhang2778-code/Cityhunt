-- ============================================================
-- 004_full_seed: 建表 + 测试缅语数据一步到位
-- 在 Supabase SQL Editor 粘贴全部，点 Run 即可
-- ============================================================

-- ──── 1. 建表（IF NOT EXISTS，已有也不会报错）────

CREATE TABLE IF NOT EXISTS app_config (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_review_mode BOOLEAN NOT NULL DEFAULT false,
  forgot_password_contact TEXT,
  forgot_password_qr_url TEXT,
  author_wechat_qr_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS books (
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

CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  word_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS words (
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

CREATE TABLE IF NOT EXISTS activation_codes (
  code TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id),
  max_uses INT NOT NULL DEFAULT 1,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_book_unlocks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id),
  unlocked_via TEXT NOT NULL DEFAULT 'activation_code',
  code_used TEXT REFERENCES activation_codes(code),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_chapter_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  mastered_count INT NOT NULL DEFAULT 0,
  last_word_index INT NOT NULL DEFAULT 0,
  last_studied_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS user_word_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new',
  familiar BOOLEAN,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);

CREATE TABLE IF NOT EXISTS user_vocabulary (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  starred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ──── 2. RLS 策略（safe with IF NOT EXISTS style）────

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chapter_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categories_read ON categories;
CREATE POLICY categories_read ON categories FOR SELECT TO authenticated USING (is_visible = true);

DROP POLICY IF EXISTS books_read ON books;
CREATE POLICY books_read ON books FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS chapters_read ON chapters;
CREATE POLICY chapters_read ON chapters FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS words_read ON words;
CREATE POLICY words_read ON words FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS banners_read ON banners;
CREATE POLICY banners_read ON banners FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS app_config_read ON app_config;
CREATE POLICY app_config_read ON app_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS app_config_anon_read ON app_config;
CREATE POLICY app_config_anon_read ON app_config FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS activation_codes_deny ON activation_codes;
CREATE POLICY activation_codes_deny ON activation_codes FOR SELECT TO authenticated USING (false);

DROP POLICY IF EXISTS user_book_unlocks_self ON user_book_unlocks;
CREATE POLICY user_book_unlocks_self ON user_book_unlocks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_chapter_progress_self ON user_chapter_progress;
CREATE POLICY user_chapter_progress_self ON user_chapter_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_word_progress_self ON user_word_progress;
CREATE POLICY user_word_progress_self ON user_word_progress FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_vocabulary_self ON user_vocabulary;
CREATE POLICY user_vocabulary_self ON user_vocabulary FOR ALL USING (auth.uid() = user_id);

-- ──── 3. 插入测试数据 ────

INSERT INTO app_config (id, is_review_mode, forgot_password_contact)
VALUES (1, false, '忘记密码请联系客服')
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, title, sort_order) VALUES
  ('cat_daily', '日常会话', 1),
  ('cat_textbook', '教材词汇', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO books (id, category_id, title, description, is_premium, is_free, sort_order, word_count, chapter_count) VALUES
  ('book_free_001', 'cat_daily', '缅甸语日常会话·入门', '最常用的日常问候与基础表达', false, true, 1, 5, 1),
  ('book_001', 'cat_textbook', '缅甸语基础词汇·第一册', '涵盖问候、数字、家庭成员等基础主题', false, true, 2, 5, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO chapters (id, book_id, title, sort_order, word_count) VALUES
  ('chap_free_001', 'book_free_001', '第一课：问候与礼貌用语', 1, 5),
  ('chap_001', 'book_001', '第一课：基础词汇', 1, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO words (id, chapter_id, sort_order, word_mm, word_zh, phonetic, notes, example_sentence_mm, example_sentence_zh) VALUES
  -- 日常会话·问候 (chap_free_001)
  ('w001', 'chap_free_001', 1, 'မင်္ဂလာပါ', '你好 / 您好', '[ming-gə-la-ba]', '最常用的打招呼方式，任何场合都适用',
   'မင်္ဂလာပါ၊ နေကောင်းလား။', '您好，您身体好吗？'),
  ('w002', 'chap_free_001', 2, 'ကျေးဇူးတင်ပါတယ်', '谢谢', '[kyei-zu-tin-ba-de]', '表达感谢的礼貌用语',
   'ကျေးဇူးတင်ပါတယ်၊ ဒီလက်ဆောင်ကို ကြိုက်တယ်။', '谢谢，我很喜欢这个礼物。'),
  ('w003', 'chap_free_001', 3, 'နေကောင်းလား', '你好吗 / 身体好吗', '[nei-gaung-la]', '缅甸人见面常用问候语',
   'မင်္ဂလာပါ၊ နေကောင်းလား။', '你好，身体好吗？'),
  ('w004', 'chap_free_001', 4, 'တောင်းပန်ပါတယ်', '对不起 / 抱歉', '[taung-pan-ba-de]', '道歉时使用',
   'တောင်းပန်ပါတယ်၊ နောက်ကျလို့။', '对不起，我迟到了。'),
  ('w005', 'chap_free_001', 5, 'သွားတော့မယ်', '再见了', '[thwa-daw-me]', '告别用语，意思是"我要走了"',
   'သွားတော့မယ်၊ မနက်ဖြန်တွေ့မယ်။', '再见了，明天见。'),

  -- 基础词汇 (chap_001)
  ('w006', 'chap_001', 1, 'ထမင်း', '米饭 / 食物', '[hta-min]', '缅甸主食，也泛指一顿饭',
   'ထမင်းစားပြီးပြီလား။', '你吃饭了吗？'),
  ('w007', 'chap_001', 2, 'ရေ', '水', '[yei]', '生活中最常用的词汇之一',
   'ရေတစ်ခွက်ပေးပါ။', '请给我一杯水。'),
  ('w008', 'chap_001', 3, 'အိမ်', '家 / 房子', '[ein]', NULL,
   'အိမ်မှာနေပါတယ်။', '我在家。'),
  ('w009', 'chap_001', 4, 'ကျောင်း', '学校', '[kyaung]', NULL,
   'ကျောင်းကိုသွားတယ်။', '我去学校。'),
  ('w010', 'chap_001', 5, 'မေမေ', '妈妈', '[mei-mei]', '缅甸语中对母亲的昵称',
   'မေမေက ထမင်းချက်တယ်။', '妈妈在做饭。')
ON CONFLICT (id) DO NOTHING;

INSERT INTO activation_codes (code, book_id, max_uses, is_active) VALUES
  ('FREE2024', 'book_001', 100, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO banners (id, image_url, link_url, sort_order, is_active) VALUES
  ('banner_1', 'https://placehold.co/800x450/f9fafb/1f2937/png?text=缅甸语学习', NULL, 1, true)
ON CONFLICT (id) DO NOTHING;
