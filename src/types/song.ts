export type Platform = 'youtube' | 'niconico';
export type SongStatus = 'candidate' | 'practicing' | 'recorded' | 'published';
export type SongSource = 'extension' | 'manual' | 'cover';

export interface Song {
  id: string;
  userId?: string; // オプショナル（ローカルのみの場合は不要）

  // 基本情報
  title: string;
  originalVideoUrl: string;
  platform: Platform;
  videoId: string;

  // メタデータ
  composer: string[];
  arranger: string[];
  vocalist: string[];
  lyricist: string[];

  // 分類・検索
  tags: string[];
  genre: string[];

  // 練習管理
  status: SongStatus;
  difficulty: number; // 1-5
  notes: string;

  // メタ情報
  createdAt: number; // UNIX timestamp (ミリ秒)
  updatedAt: number; // UNIX timestamp (ミリ秒)
  source: SongSource;

  // 自動取得情報
  thumbnailUrl: string;
  duration: number; // 秒
  publishedAt: number; // UNIX timestamp (ミリ秒)
  viewCount: number;
  description: string;
}

// 曲追加用の型（IDとタイムスタンプを除く）
export type CreateSongData = Omit<Song, 'id' | 'createdAt' | 'updatedAt'>;

// 曲更新用の型
export type UpdateSongData = Partial<Omit<Song, 'id' | 'userId' | 'createdAt'>>;
