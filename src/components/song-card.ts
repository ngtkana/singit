import { createElement, appendChildren } from '@/lib/utils/dom';
import { formatRelativeTime } from '@/lib/utils/formatter';
import type { Song } from '@/types/song';

export function createSongCard(song: Song): HTMLElement {
  const card = createElement('div', {
    className: 'card hover:shadow-md transition-shadow cursor-pointer',
  });

  // タイトルエリア
  const titleArea = createElement('div', {
    className: 'flex justify-between items-start mb-3',
  });

  const title = createElement('h3', {
    className: 'text-lg font-bold text-gray-900 flex-1',
    textContent: song.title,
  });

  // プラットフォームアイコン
  const platformBadge = createElement('span', {
    className:
      song.platform === 'youtube'
        ? 'text-xs px-2 py-1 bg-red-100 text-red-700 rounded'
        : 'text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded',
    textContent: song.platform === 'youtube' ? 'YouTube' : 'ニコニコ',
  });

  appendChildren(titleArea, [title, platformBadge]);

  // タグ
  const tagsArea = createElement('div', {
    className: 'flex flex-wrap gap-2 mb-3',
  });

  song.tags.forEach((tag) => {
    const tagBadge = createElement('span', {
      className: 'text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded',
      textContent: tag,
    });
    tagsArea.appendChild(tagBadge);
  });

  // メモ（最初の100文字）
  let notesArea: HTMLElement | null = null;
  if (song.notes) {
    const noteText =
      song.notes.length > 100
        ? song.notes.substring(0, 100) + '...'
        : song.notes;
    notesArea = createElement('p', {
      className: 'text-sm text-gray-600 mb-3',
      textContent: noteText,
    });
  }

  // フッター
  const footer = createElement('div', {
    className: 'flex justify-between items-center text-xs text-gray-500',
  });

  const statusBadge = createElement('span', {
    className: getStatusClassName(song.status),
    textContent: getStatusLabel(song.status),
  });

  const timestamp = createElement('span', {
    textContent: formatRelativeTime({ toMillis: () => song.createdAt } as any),
  });

  appendChildren(footer, [statusBadge, timestamp]);

  // カードクリックイベント
  card.addEventListener('click', () => {
    // TODO: 曲詳細ページに遷移
    console.log('曲をクリック:', song.id);
  });

  // 要素を組み立て
  const elements: HTMLElement[] = [titleArea];
  if (song.tags.length > 0) elements.push(tagsArea);
  if (notesArea) elements.push(notesArea);
  elements.push(footer);

  appendChildren(card, elements);

  return card;
}

function getStatusClassName(status: Song['status']): string {
  const base = 'px-2 py-1 rounded text-xs';
  switch (status) {
    case 'candidate':
      return `${base} bg-gray-100 text-gray-700`;
    case 'practicing':
      return `${base} bg-blue-100 text-blue-700`;
    case 'recorded':
      return `${base} bg-green-100 text-green-700`;
    case 'published':
      return `${base} bg-purple-100 text-purple-700`;
  }
}

function getStatusLabel(status: Song['status']): string {
  switch (status) {
    case 'candidate':
      return '候補';
    case 'practicing':
      return '練習中';
    case 'recorded':
      return '録音済';
    case 'published':
      return '公開済';
  }
}
