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

  // 動画リンク数バッジ
  const linkCountBadge = createElement('span', {
    className: 'text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded',
    textContent: `${song.videoLinks.length}件`,
  });

  appendChildren(titleArea, [title, linkCountBadge]);

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

  const timestamp = createElement('span', {
    textContent: formatRelativeTime({ toMillis: () => song.createdAt } as any),
  });

  footer.appendChild(timestamp);

  // カードクリックイベント
  card.addEventListener('click', () => {
    // TODO: 曲詳細ページに遷移
    console.log('曲をクリック:', song.id);
  });

  // 要素を組み立て
  const elements: HTMLElement[] = [titleArea];
  if (notesArea) elements.push(notesArea);
  elements.push(footer);

  appendChildren(card, elements);

  return card;
}
