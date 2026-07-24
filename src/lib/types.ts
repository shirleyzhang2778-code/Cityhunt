export type Category = {
  id: string;
  title: string;
  sort_order: number;
};

export type Book = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  is_premium: boolean;
  is_free: boolean;
  sort_order: number;
  word_count: number;
  chapter_count: number;
};

export type Chapter = {
  id: string;
  book_id: string;
  title: string;
  sort_order: number;
  word_count: number;
};

export type Word = {
  id: string;
  chapter_id: string;
  sort_order: number;
  word_mm: string;
  word_en: string | null;
  word_zh: string;
  phonetic: string | null;
  notes: string | null;
  example_sentence_mm: string | null;
  example_sentence_zh: string | null;
  audio_url: string | null;
  image_url: string | null;
};

export type ChapterBundle = {
  chapter: Chapter & { book?: Book };
  words: Word[];
};

export type AppConfig = {
  is_review_mode: boolean;
  forgot_password_contact: string | null;
  forgot_password_qr_url: string | null;
  author_wechat_qr_url: string | null;
};

export type Banner = {
  id: string;
  image_url: string;
  link_url: string | null;
  sort_order: number;
};

export type ChapterProgress = {
  chapter_id: string;
  mastered_count: number;
  last_word_index: number;
};
