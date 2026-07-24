-- Mock seed data - run after 001_init.sql

INSERT INTO app_config (id, is_review_mode, forgot_password_contact, forgot_password_qr_url, author_wechat_qr_url)
VALUES (
  1,
  false,
  '忘记密码请联系作者微信：myanmar_vocab_author',
  'https://placehold.co/200x200/png?text=QR',
  'https://placehold.co/240x240/png?text=WeChat'
) ON CONFLICT (id) DO UPDATE SET
  forgot_password_contact = EXCLUDED.forgot_password_contact,
  author_wechat_qr_url = EXCLUDED.author_wechat_qr_url;

INSERT INTO categories (id, title, sort_order) VALUES
  ('cat_history', '历史', 1),
  ('cat_textbook', '教材', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO books (id, category_id, title, description, is_premium, is_free, sort_order, word_count, chapter_count) VALUES
  ('book_free_001', 'cat_textbook', '基础日常·体验册', '免费体验章节', false, true, 1, 10, 2),
  ('book_001', 'cat_history', '琉璃宫史·第一卷', '缅甸最著名的编年史，硬核词汇深度解析', true, false, 1, 10, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO chapters (id, book_id, title, sort_order, word_count) VALUES
  ('chap_free_001', 'book_free_001', '第一课：问候', 1, 5),
  ('chap_free_002', 'book_free_001', '第二课：数字', 2, 5),
  ('chap_001', 'book_001', '第一章：太古时期的传说', 1, 5),
  ('chap_002', 'book_001', '第二章：王朝更迭', 2, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO words (id, chapter_id, sort_order, word_mm, word_zh, phonetic, notes, example_sentence_mm, example_sentence_zh, audio_url, image_url) VALUES
  ('word_f001', 'chap_free_001', 1, 'မင်္ဂလာပါ', '你好', '[mingala ba]', '日常问候', NULL, NULL, NULL, NULL),
  ('word_f002', 'chap_free_001', 2, 'ကျေးဇူးတင်ပါတယ်', '谢谢', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f003', 'chap_free_001', 3, 'ဟုတ်ကဲ့', '是的', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f004', 'chap_free_001', 4, 'မဟုတ်ဘူး', '不是', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f005', 'chap_free_001', 5, 'နေကောင်းလား', '你好吗', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f006', 'chap_free_002', 1, 'တစ်', '一', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f007', 'chap_free_002', 2, 'နှစ်', '二', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f008', 'chap_free_002', 3, 'သုံး', '三', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f009', 'chap_free_002', 4, 'လေး', '四', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_f010', 'chap_free_002', 5, 'ငါး', '五', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_001', 'chap_001', 1, 'ကမ္ဘာဦး', '世界之初，创世纪', '[kəmbau:]', '专业四级核心学术词汇',
    'ကမ္ဘာဦးကျမ်းသည် မောရှေ၏ ပထမကျမ်းဖြစ်သည်။', '创世纪是摩西的第一部书。', NULL, NULL),
  ('word_002', 'chap_001', 2, 'မြန်မာ', '缅甸', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_003', 'chap_001', 3, 'ရာဇဝင်', '编年史', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_004', 'chap_001', 4, 'ဘုရင်', '国王', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_005', 'chap_001', 5, 'နိုင်ငံ', '国家', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_006', 'chap_002', 1, 'အာဏာ', '权力', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_007', 'chap_002', 2, 'စစ်မှန်', '战争', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_008', 'chap_002', 3, 'မြို့တော်', '首都', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_009', 'chap_002', 4, 'လူမျိုး', '民族', NULL, NULL, NULL, NULL, NULL, NULL),
  ('word_010', 'chap_002', 5, 'ယဉ်ကျေးမှု', '文化', NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO activation_codes (code, book_id, max_uses, used_count, is_active) VALUES
  ('DEMO2024', 'book_001', 100, 0, true),
  ('TESTCODE1', 'book_001', 1, 0, true),
  ('VIPBOOK01', 'book_001', 5, 0, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO banners (id, image_url, link_url, sort_order, is_active) VALUES
  ('banner_1', 'https://placehold.co/800x450/f9fafb/1f2937/png?text=Banner+1', 'https://www.bilibili.com', 1, true),
  ('banner_2', 'https://placehold.co/800x450/f9fafb/4b5563/png?text=Banner+2', 'https://www.xiaohongshu.com', 2, true)
ON CONFLICT (id) DO NOTHING;
