import { createElement, appendChildren, renderPage } from '@/lib/utils/dom';
import { signOut, getCurrentUser } from '@/lib/firebase/auth';
import { router } from '@/router';

export function renderDashboard() {
  const user = getCurrentUser();
  if (!user) {
    router.navigate('/login');
    return;
  }

  const container = createElement('div', {
    className: 'min-h-screen bg-gray-50',
  });

  // ヘッダー
  const header = createElement('header', {
    className: 'bg-white shadow-sm',
  });

  const headerContent = createElement('div', {
    className: 'max-w-7xl mx-auto px-4 py-4 flex justify-between items-center',
  });

  const logo = createElement('h1', {
    className: 'text-2xl font-bold',
    textContent: 'Singit',
  });

  const headerRight = createElement('div', {
    className: 'flex items-center gap-4',
  });

  const userEmail = createElement('span', {
    className: 'text-sm text-gray-600',
    textContent: user.email || '',
  });

  const logoutButton = createElement('button', {
    className: 'btn-secondary',
    textContent: 'ログアウト',
  });

  logoutButton.addEventListener('click', async () => {
    try {
      await signOut();
      router.navigate('/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('ログアウトに失敗しました');
    }
  });

  appendChildren(headerRight, [userEmail, logoutButton]);
  appendChildren(headerContent, [logo, headerRight]);
  header.appendChild(headerContent);

  // メインコンテンツ
  const main = createElement('main', {
    className: 'max-w-7xl mx-auto px-4 py-8',
  });

  // タイトルと追加ボタン
  const titleBar = createElement('div', {
    className: 'flex justify-between items-center mb-6',
  });

  const pageTitle = createElement('h2', {
    className: 'text-3xl font-bold',
    textContent: '曲一覧',
  });

  const addButton = createElement('button', {
    className: 'btn-primary',
    innerHTML: `
      <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      曲を追加
    `,
  });

  addButton.addEventListener('click', () => {
    router.navigate('/songs/new');
  });

  appendChildren(titleBar, [pageTitle, addButton]);

  // 曲リストプレースホルダー
  const emptyState = createElement('div', {
    className: 'card text-center py-12',
    innerHTML: `
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">まだ曲がありません</h3>
      <p class="text-gray-600 mb-4">Chrome拡張で動画サイトから曲を追加するか、手動で曲を追加してください</p>
      <button class="btn-primary">Chrome拡張をインストール</button>
    `,
  });

  appendChildren(main, [titleBar, emptyState]);
  appendChildren(container, [header, main]);
  renderPage(container);
}
