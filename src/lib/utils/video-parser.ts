// 動画URLからプラットフォームとvideoIdを抽出し、正規化されたURLを返す
export function parseVideoUrl(url: string): {
  platform: 'youtube' | 'niconico' | 'other';
  videoId: string;
  normalizedUrl: string;
} {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      platform: 'youtube',
      videoId,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // ニコニコ動画
  const niconicoMatch = url.match(/nicovideo\.jp\/watch\/(sm\d+)/);
  if (niconicoMatch) {
    const videoId = niconicoMatch[1];
    return {
      platform: 'niconico',
      videoId,
      normalizedUrl: `https://www.nicovideo.jp/watch/${videoId}`,
    };
  }

  // デフォルト（その他）
  return { platform: 'other', videoId: '', normalizedUrl: url };
}
