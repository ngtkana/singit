import type { Song } from '@/types/song';

const STORAGE_KEY = 'singit_songs';

// localStorageから全曲を取得
export function getAllSongs(): Song[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  try {
    return JSON.parse(data);
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

// タグで検索
export function getSongsByTag(tag: string): Song[] {
  const songs = getAllSongs();
  return songs.filter(song => song.tags.includes(tag));
}

// ステータスで検索
export function getSongsByStatus(status: Song['status']): Song[] {
  const songs = getAllSongs();
  return songs.filter(song => song.status === status);
}

// 全曲を上書き（同期時に使用）
export function setAllSongs(songs: Song[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

// データをクリア
export function clearAllSongs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
