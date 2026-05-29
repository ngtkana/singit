export interface YouTubeVideoData {
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number; // 秒
  publishedAt: number; // UNIX timestamp (ms)
  viewCount: number;
}

export async function fetchYouTubeVideoData(
  videoId: string
): Promise<YouTubeVideoData | null> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API キーが設定されていません');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${encodeURIComponent(videoId)}&part=snippet,contentDetails,statistics&key=${encodeURIComponent(apiKey)}`
    );

    if (!response.ok) {
      console.error('YouTube API エラー:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.error('動画が見つかりません');
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    const statistics = video.statistics;

    // ISO 8601 duration を秒に変換
    const duration = parseDuration(contentDetails.duration);

    return {
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl:
        snippet.thumbnails.high?.url ||
        snippet.thumbnails.medium?.url ||
        snippet.thumbnails.default?.url ||
        '',
      duration,
      publishedAt: new Date(snippet.publishedAt).getTime(),
      viewCount: parseInt(statistics.viewCount, 10) || 0,
    };
  } catch (error) {
    console.error('YouTube API 取得エラー:', error);
    return null;
  }
}

// 曲名でYouTube動画を検索
export async function searchYouTubeByTitle(
  title: string
): Promise<{ videoId: string; title: string } | null> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API キーが設定されていません');
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(
        title
      )}&part=snippet&type=video&maxResults=1&key=${apiKey}`
    );

    if (!response.ok) {
      console.error('YouTube 検索 API エラー:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];
    return {
      videoId: video.id.videoId,
      title: video.snippet.title,
    };
  } catch (error) {
    console.error('YouTube 検索エラー:', error);
    return null;
  }
}

// ISO 8601 duration (PT1H2M3S) を秒に変換
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}
