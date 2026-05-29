export interface NiconicoVideoData {
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number; // 秒
  publishedAt: number; // UNIX timestamp (ms)
  viewCount: number;
}

export async function fetchNiconicoVideoData(
  videoId: string
): Promise<NiconicoVideoData | null> {
  try {
    const response = await fetch(
      `https://snapshot.search.nicovideo.jp/api/v2/snapshot/video/${videoId}`
    );

    if (!response.ok) {
      console.error('ニコニコ API エラー:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.data) {
      console.error('動画が見つかりません');
      return null;
    }

    const video = data.data;

    return {
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.lengthSeconds,
      publishedAt: new Date(video.startTime).getTime(),
      viewCount: video.viewCounter || 0,
    };
  } catch (error) {
    console.error('ニコニコ API 取得エラー:', error);
    return null;
  }
}

// 曲名でニコニコ動画を検索
export async function searchNiconicoByTitle(
  title: string
): Promise<{ videoId: string; title: string } | null> {
  try {
    const response = await fetch(
      `https://snapshot.search.nicovideo.jp/api/v2/search/video?q=${encodeURIComponent(
        title
      )}&targets=title&fields=contentId,title&_sort=-viewCounter&_limit=1`
    );

    if (!response.ok) {
      console.error('ニコニコ 検索 API エラー:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const video = data.data[0];
    return {
      videoId: video.contentId,
      title: video.title,
    };
  } catch (error) {
    console.error('ニコニコ 検索エラー:', error);
    return null;
  }
}
