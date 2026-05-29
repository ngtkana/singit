export interface VideoLink {
  id: string;
  platform: 'youtube' | 'niconico' | 'other';
  url: string;
  videoId: string;
  title: string;

  // 自動取得情報（オプショナル）
  thumbnailUrl?: string;
  duration?: number; // 秒
  publishedAt?: number;
  viewCount?: number;
  description?: string;

  // ユーザー定義ラベル
  label?: string; // "本家", "カラオケ", "歌ってみた" など

  createdAt: number;
}

export interface Song {
  id: string;
  userId?: string;

  // 推論された情報
  title: string; // 曲名（正規化）
  composer: string[];
  arranger: string[];
  vocalist: string[];
  lyricist: string[];

  // 生データ
  videoLinks: VideoLink[];

  notes: string;

  createdAt: number;
  updatedAt: number;
}

// 曲追加用の型
export type CreateSongData = Omit<Song, 'id' | 'createdAt' | 'updatedAt'>;

// 曲更新用の型
export type UpdateSongData = Partial<Omit<Song, 'id' | 'userId' | 'createdAt'>>;
