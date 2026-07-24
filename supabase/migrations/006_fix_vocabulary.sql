-- 006_fix_vocabulary: 确保生词收藏表存在 + RLS 正确
-- 在 Supabase SQL Editor Run 即可

CREATE TABLE IF NOT EXISTS user_vocabulary (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id     TEXT NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  starred_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, word_id)
);

ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_vocabulary_self ON user_vocabulary;
CREATE POLICY user_vocabulary_self ON user_vocabulary
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 验证
-- SELECT * FROM user_vocabulary;
