export interface SongMetadata {
  title: string; // 曲名
  composer: string[]; // 作曲者
  arranger: string[]; // 編曲者
  vocalist: string[]; // ボーカリスト
  lyricist: string[]; // 作詞者
}

export async function inferSongMetadata(
  videoTitle: string,
  videoDescription?: string
): Promise<SongMetadata | null> {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (!apiKey) {
    console.warn('Claude API キーが設定されていません');
    return null;
  }

  const prompt = `以下のYouTube動画タイトル（と説明文）から、楽曲情報を抽出してください。

動画タイトル: ${videoTitle}
${videoDescription ? `動画説明文: ${videoDescription.substring(0, 500)}` : ''}

以下のJSON形式で返してください：
{
  "title": "曲名（記号や装飾を除いた正規化された曲名）",
  "composer": ["作曲者名"],
  "arranger": ["編曲者名"],
  "vocalist": ["ボーカリスト名（初音ミク等のボカロ、または人間の歌い手）"],
  "lyricist": ["作詞者名"]
}

ルール:
- 情報がない項目は空配列 [] を返す
- 複数いる場合は配列に全て含める
- ボカロ（初音ミク、鏡音リン等）もvocalistに含める
- 作曲者のP名（例: 黒うさP）がわかる場合はそれを使う
- 【】や「」などの装飾記号は曲名から除く

JSON以外の説明は不要です。JSONのみを返してください。`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude API エラー:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data.content || data.content.length === 0) {
      console.error('Claude API レスポンスが空です');
      return null;
    }

    // レスポンスからJSONを抽出
    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('JSON形式のレスポンスが見つかりません:', text);
      return null;
    }

    const metadata: SongMetadata = JSON.parse(jsonMatch[0]);

    return metadata;
  } catch (error) {
    console.error('Claude API 推論エラー:', error);
    return null;
  }
}
