import { createElement, appendChildren, renderPage } from '@/lib/utils/dom';
import { signOut, getCurrentUser, signInWithGoogle } from '@/lib/firebase/auth';
import { router } from '@/router';

export function renderDashboard() {
  const user = getCurrentUser();

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

  // ログイン状態に応じてボタンを切り替え
  if (user) {
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
        // ログアウト後もダッシュボードに留まる
        renderDashboard();
      } catch (error) {
        console.error('ログアウトエラー:', error);
        alert('ログアウトに失敗しました');
      }
    });

    appendChildren(headerRight, [userEmail, logoutButton]);
  } else {
    const loginButton = createElement('button', {
      className: 'btn-primary',
      innerHTML: `
        <svg class="w-4 h-4 inline-block mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        ログインして同期
      `,
    });

    loginButton.addEventListener('click', async () => {
      try {
        loginButton.disabled = true;
        loginButton.textContent = 'ログイン中...';
        await signInWithGoogle();
        // ログイン成功後、ダッシュボードを再描画
        renderDashboard();
      } catch (error) {
        console.error('ログインエラー:', error);
        alert('ログインに失敗しました');
        loginButton.disabled = false;
        loginButton.innerHTML = 'ログインして同期';
      }
    });

    appendChildren(headerRight, [loginButton]);
  }
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
