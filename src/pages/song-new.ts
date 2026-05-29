import { createElement, appendChildren, renderPage } from '@/lib/utils/dom';
import { addSong } from '@/lib/storage/local';
import { router } from '@/router';
import type { Song } from '@/types/song';

export function renderSongNewPage() {
  const container = createElement('div', {
    className: 'min-h-screen bg-gray-50',
  });

  // ヘッダー
  const header = createElement('header', {
    className: 'bg-white shadow-sm mb-8',
  });

  const headerContent = createElement('div', {
    className: 'max-w-3xl mx-auto px-4 py-4 flex items-center gap-4',
  });

  const backButton = createElement('button', {
    className: 'text-gray-600 hover:text-gray-900',
    innerHTML: `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
      </svg>
    `,
  });

  backButton.addEventListener('click', () => {
    router.navigate('/');
  });

  const title = createElement('h1', {
    className: 'text-2xl font-bold',
    textContent: '曲を追加',
  });

  appendChildren(headerContent, [backButton, title]);
  header.appendChild(headerContent);

  // メインコンテンツ
  const main = createElement('main', {
    className: 'max-w-3xl mx-auto px-4',
  });

  const form = createElement('form', {
    className: 'card space-y-6',
  });

  // 曲名
  const titleGroup = createElement('div');
  const titleLabel = createElement('label', {
    className: 'block text-sm font-medium text-gray-700 mb-2',
    textContent: '曲名',
  });
  const titleInput = createElement('input', {
    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
    attributes: {
      type: 'text',
      required: 'true',
      placeholder: '例: 千本桜',
    },
  });
  appendChildren(titleGroup, [titleLabel, titleInput]);

  // 原曲URL
  const urlGroup = createElement('div');
  const urlLabel = createElement('label', {
    className: 'block text-sm font-medium text-gray-700 mb-2',
    textContent: '原曲URL',
  });
  const urlInput = createElement('input', {
    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
    attributes: {
      type: 'url',
      required: 'true',
      placeholder: 'https://www.youtube.com/watch?v=...',
    },
  });
  const urlHelp = createElement('p', {
    className: 'text-sm text-gray-500 mt-1',
    textContent: 'YouTubeまたはニコニコ動画のURL',
  });
  appendChildren(urlGroup, [urlLabel, urlInput, urlHelp]);

  // タグ
  const tagsGroup = createElement('div');
  const tagsLabel = createElement('label', {
    className: 'block text-sm font-medium text-gray-700 mb-2',
    textContent: 'タグ（カンマ区切り）',
  });
  const tagsInput = createElement('input', {
    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
    attributes: {
      type: 'text',
      placeholder: '例: ボカロ, JPOP, お気に入り',
    },
  });
  appendChildren(tagsGroup, [tagsLabel, tagsInput]);

  // メモ
  const notesGroup = createElement('div');
  const notesLabel = createElement('label', {
    className: 'block text-sm font-medium text-gray-700 mb-2',
    textContent: 'メモ',
  });
  const notesTextarea = createElement('textarea', {
    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
    attributes: {
      rows: '4',
      placeholder: 'この曲について...',
    },
  }) as HTMLTextAreaElement;
  appendChildren(notesGroup, [notesLabel, notesTextarea]);

  // ボタン
  const buttonGroup = createElement('div', {
    className: 'flex gap-4',
  });

  const cancelButton = createElement('button', {
    className: 'btn-secondary flex-1',
    textContent: 'キャンセル',
    attributes: {
      type: 'button',
    },
  });

  cancelButton.addEventListener('click', () => {
    router.navigate('/');
  });

  const submitButton = createElement('button', {
    className: 'btn-primary flex-1',
    textContent: '追加',
    attributes: {
      type: 'submit',
    },
  });

  appendChildren(buttonGroup, [cancelButton, submitButton]);

  // フォーム送信
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    const tags = tagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // URLからプラットフォームとvideoIdを抽出
    const { platform, videoId } = parseVideoUrl(url);

    const now = Date.now();
    const newSong: Omit<Song, 'id'> = {
      title: titleInput.value.trim(),
      originalVideoUrl: url,
      platform,
      videoId,
      composer: [],
      arranger: [],
      vocalist: [],
      lyricist: [],
      tags,
      genre: [],
      status: 'candidate',
      difficulty: 0,
      notes: notesTextarea.value.trim(),
      createdAt: now,
      updatedAt: now,
      source: 'manual',
      thumbnailUrl: '',
      duration: 0,
      publishedAt: 0,
      viewCount: 0,
      description: '',
    };

    try {
      addSong(newSong);
      router.navigate('/');
    } catch (error) {
      console.error('曲追加エラー:', error);
      alert('曲の追加に失敗しました');
    }
  });

  appendChildren(form, [
    titleGroup,
    urlGroup,
    tagsGroup,
    notesGroup,
    buttonGroup,
  ]);

  main.appendChild(form);
  appendChildren(container, [header, main]);
  renderPage(container);
}

// 動画URLからプラットフォームとvideoIdを抽出
function parseVideoUrl(url: string): {
  platform: 'youtube' | 'niconico';
  videoId: string;
} {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) {
    return { platform: 'youtube', videoId: youtubeMatch[1] };
  }

  // ニコニコ動画
  const niconicoMatch = url.match(/nicovideo\.jp\/watch\/(sm\d+)/);
  if (niconicoMatch) {
    return { platform: 'niconico', videoId: niconicoMatch[1] };
  }

  // デフォルト（YouTube想定）
  return { platform: 'youtube', videoId: '' };
}
