import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import type { Song } from '@/types/song';

// 曲コレクションの参照
const songsCollection = collection(db, 'songs');

// 曲を追加
export async function addSong(songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(songsCollection, {
      ...songData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('曲追加エラー:', error);
    throw error;
  }
}

// 曲を取得
export async function getSong(songId: string): Promise<Song | null> {
  try {
    const songDoc = await getDoc(doc(db, 'songs', songId));
    if (!songDoc.exists()) {
      return null;
    }
    return { id: songDoc.id, ...songDoc.data() } as Song;
  } catch (error) {
    console.error('曲取得エラー:', error);
    throw error;
  }
}

// ユーザーの曲一覧を取得
export async function getUserSongs(userId: string): Promise<Song[]> {
  try {
    const q = query(
      songsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Song)
    );
  } catch (error) {
    console.error('曲一覧取得エラー:', error);
    throw error;
  }
}

// 曲をリアルタイムで監視
export function watchUserSongs(
  userId: string,
  callback: (songs: Song[]) => void
) {
  const q = query(
    songsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const songs = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Song)
    );
    callback(songs);
  });
}

// 曲を更新
export async function updateSong(songId: string, updates: Partial<Song>) {
  try {
    const songRef = doc(db, 'songs', songId);
    await updateDoc(songRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('曲更新エラー:', error);
    throw error;
  }
}

// 曲を削除
export async function deleteSong(songId: string) {
  try {
    await deleteDoc(doc(db, 'songs', songId));
  } catch (error) {
    console.error('曲削除エラー:', error);
    throw error;
  }
}

// タグで曲を検索
export async function getSongsByTag(userId: string, tag: string): Promise<Song[]> {
  try {
    const q = query(
      songsCollection,
      where('userId', '==', userId),
      where('tags', 'array-contains', tag)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Song)
    );
  } catch (error) {
    console.error('タグ検索エラー:', error);
    throw error;
  }
}
