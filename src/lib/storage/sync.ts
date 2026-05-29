import type { Song } from '@/types/song';
import { getAllSongs, setAllSongs } from './local';
import { getUserSongs as getFirestoreSongs } from '@/lib/firebase/firestore';

// localStorageとFirestoreを同期
export async function syncWithFirestore(userId: string): Promise<void> {
  try {
    // ローカルの曲を取得
    const localSongs = getAllSongs();

    // Firestoreの曲を取得
    const firestoreSongs = await getFirestoreSongs(userId);

    // マージ処理（createdAtが新しい方を優先）
    const mergedSongs = mergeSongs(localSongs, firestoreSongs);

    // ローカルに保存
    setAllSongs(mergedSongs);

    // TODO: Firestoreにもアップロード（次のステップで実装）
    console.log('同期完了:', mergedSongs.length, '曲');
  } catch (error) {
    console.error('同期エラー:', error);
    throw error;
  }
}

// 2つの曲リストをマージ（IDが同じ場合は新しい方を採用）
function mergeSongs(local: Song[], remote: Song[]): Song[] {
  const songMap = new Map<string, Song>();

  // ローカルの曲をMapに追加
  local.forEach((song) => {
    songMap.set(song.id, song);
  });

  // リモートの曲を追加（既存の場合は新しい方を採用）
  remote.forEach((remoteSong) => {
    const localSong = songMap.get(remoteSong.id);

    if (!localSong) {
      // リモートにしかない曲
      songMap.set(remoteSong.id, remoteSong);
    } else if (remoteSong.updatedAt > localSong.updatedAt) {
      // リモートの方が新しい
      songMap.set(remoteSong.id, remoteSong);
    }
    // ローカルの方が新しい場合は何もしない
  });

  // Map → 配列に変換して、createdAtでソート
  return Array.from(songMap.values()).sort(
    (a, b) => b.createdAt - a.createdAt
  );
}
