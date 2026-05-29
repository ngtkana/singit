import type { Song, VideoLink } from '@/types/song';

const STORAGE_KEY = 'singit_songs';
const MIGRATION_KEY = 'singit_migration_v2';

// 旧データ構造（マイグレーション用）
interface LegacySong {
  id: string;
  userId?: string;
  title: string;
  originalVideoUrl: string;
  platform: 'youtube' | 'niconico';
  videoId: string;
  composer: string[];
  arranger: string[];
  vocalist: string[];
  lyricist: string[];
  genre?: string[];
  status: string;
  difficulty?: number;
  notes: string;
  createdAt: number;
  updatedAt: number;
  source?: string;
  thumbnailUrl?: string;
  duration?: number;
  publishedAt?: number;
  viewCount?: number;
  description?: string;
}

// 旧形式から新形式への変換
function migrateLegacySong(legacy: LegacySong): Song {
  const videoLink: VideoLink = {
    id: crypto.randomUUID(),
    platform: legacy.platform,
    url: legacy.originalVideoUrl,
    videoId: legacy.videoId,
    title: legacy.title, // 動画タイトル（生データ）
    thumbnailUrl: legacy.thumbnailUrl,
    duration: legacy.duration,
    publishedAt: legacy.publishedAt,
    viewCount: legacy.viewCount,
    description: legacy.description,
    label: '本家',
    createdAt: legacy.createdAt,
  };

  return {
    id: legacy.id,
    userId: legacy.userId,
    title: legacy.title, // 曲名（とりあえず動画タイトルと同じ）
    videoLinks: [videoLink],
    composer: legacy.composer,
    arranger: legacy.arranger,
    vocalist: legacy.vocalist,
    lyricist: legacy.lyricist,
    notes: legacy.notes,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  };
}

// localStorageから全曲を取得
export function getAllSongs(): Song[] {
  // マイグレーション済みチェック
  const migrated = localStorage.getItem(MIGRATION_KEY);

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);

    // マイグレーション未実施の場合
    if (!migrated && parsed.length > 0) {
      const firstItem = parsed[0];
      // 旧形式を検出（originalVideoUrlフィールドがある）
      if ('originalVideoUrl' in firstItem) {
        console.log('旧データ形式を検出。マイグレーションを実行します...');
        const migrated = parsed.map((song: LegacySong) => migrateLegacySong(song));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        localStorage.setItem(MIGRATION_KEY, 'true');
        return migrated;
      }
    }

    return parsed;
  } catch (error) {
    console.error('曲データの読み込みエラー:', error);
    return [];
  }
}

// 曲を追加
export function addSong(song: Omit<Song, 'id'>): Song {
  const songs = getAllSongs();
  const newSong: Song = {
    ...song,
    id: crypto.randomUUID(),
  };

  songs.push(newSong);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  return newSong;
}

// 曲を取得
export function getSong(id: string): Song | null {
  const songs = getAllSongs();
  return songs.find(song => song.id === id) || null;
}

// 曲を更新
export function updateSong(id: string, updates: Partial<Song>): Song | null {
  const songs = getAllSongs();
  const index = songs.findIndex(song => song.id === id);

  if (index === -1) return null;

  const updatedSong = { ...songs[index], ...updates };
  songs[index] = updatedSong;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  return updatedSong;
}

// 曲を削除
export function deleteSong(id: string): boolean {
  const songs = getAllSongs();
  const filtered = songs.filter(song => song.id !== id);

  if (filtered.length === songs.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// 全曲を上書き（同期時に使用）
export function setAllSongs(songs: Song[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

// データをクリア
export function clearAllSongs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
