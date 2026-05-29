import { createElement, appendChildren, renderPage } from '@/lib/utils/dom';
import { signOut, getCurrentUser, signInWithGoogle } from '@/lib/firebase/auth';
import { router } from '@/router';
import { getAllSongs } from '@/lib/storage/local';
import type { Song } from '@/types/song';

let selectedSong: Song | null = null;

export function renderDashboard() {
  const user = getCurrentUser();

  const container = createElement('div', {
    className: 'flex flex-col h-screen bg-white',
  });

  // トップバー
  const topBar = createElement('div', {
    className: 'flex items-center justify-between px-4 py-2 border-b border-gray-200',
  });

  const logo = createElement('h1', {
    className: 'text-lg font-bold',
    textContent: 'Singit',
  });

  const topBarRight = createElement('div', {
    className: 'flex items-center gap-3',
  });

  const addButton = createElement('button', {
    className: 'px-3 py-1.5 bg-primary text-white rounded hover:opacity-90 text-sm',
    textContent: '+ 新規',
  });

  addButton.addEventListener('click', () => {
    router.navigate('/songs/new');
  });

  topBarRight.appendChild(addButton);

  // ログイン状態に応じてボタンを追加
  if (user) {
    const userEmail = createElement('span', {
      className: 'text-xs text-gray-600',
      textContent: user.email || '',
    });

    const logoutButton = createElement('button', {
      className: 'text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300',
      textContent: 'ログアウト',
    });

    logoutButton.addEventListener('click', async () => {
      await signOut();
      renderDashboard();
    });

    appendChildren(topBarRight, [userEmail, logoutButton]);
  } else {
    const loginButton = createElement('button', {
      className: 'text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300',
      textContent: 'ログインして同期',
    });

    loginButton.addEventListener('click', async () => {
      await signInWithGoogle();
      renderDashboard();
    });

    topBarRight.appendChild(loginButton);
  }

  appendChildren(topBar, [logo, topBarRight]);

  // メインエリア（3カラムレイアウト）
  const mainArea = createElement('div', {
    className: 'flex flex-1 overflow-hidden',
  });

  // 左サイドバー
  const sidebar = createSidebar();

  // 中央パネル（曲リスト）
  const centerPanel = createCenterPanel();

  // 右パネル（詳細）
  const rightPanel = createRightPanel();

  appendChildren(mainArea, [sidebar, centerPanel, rightPanel]);
  appendChildren(container, [topBar, mainArea]);
  renderPage(container);
}

function createSidebar(): HTMLElement {
  const sidebar = createElement('div', {
    className: 'w-56 border-r border-gray-200 overflow-y-auto bg-gray-50',
  });

  const sidebarContent = createElement('div', {
    className: 'p-3 space-y-4',
  });

  // マイライブラリ
  const librarySection = createElement('div');
  const libraryTitle = createElement('div', {
    className: 'text-xs font-semibold text-gray-500 mb-2',
    textContent: 'マイライブラリ',
  });

  const allSongsButton = createElement('button', {
    className: 'w-full text-left px-2 py-1 text-sm hover:bg-gray-200 rounded',
    textContent: '全ての曲',
  });

  appendChildren(librarySection, [libraryTitle, allSongsButton]);

  // ステータス
  const statusSection = createElement('div');
  const statusTitle = createElement('div', {
    className: 'text-xs font-semibold text-gray-500 mb-2',
    textContent: 'ステータス',
  });

  const statuses: Array<{ label: string; value: Song['status'] }> = [
    { label: '候補', value: 'candidate' },
    { label: '練習中', value: 'practicing' },
    { label: '録音済', value: 'recorded' },
    { label: '公開済', value: 'published' },
  ];

  const statusList = createElement('div', { className: 'space-y-1' });
  statuses.forEach(({ label }) => {
    const statusButton = createElement('button', {
      className: 'w-full text-left px-2 py-1 text-sm hover:bg-gray-200 rounded',
      textContent: label,
    });
    statusList.appendChild(statusButton);
  });

  appendChildren(statusSection, [statusTitle, statusList]);

  // タグ
  const tagsSection = createElement('div');
  const tagsTitle = createElement('div', {
    className: 'text-xs font-semibold text-gray-500 mb-2',
    textContent: 'タグ',
  });

  // 全曲からユニークなタグを抽出
  const songs = getAllSongs();
  const allTags = new Set<string>();
  songs.forEach((song) => song.tags.forEach((tag) => allTags.add(tag)));

  const tagList = createElement('div', { className: 'space-y-1' });
  Array.from(allTags).forEach((tag) => {
    const tagButton = createElement('button', {
      className: 'w-full text-left px-2 py-1 text-sm hover:bg-gray-200 rounded truncate',
      textContent: tag,
    });
    tagList.appendChild(tagButton);
  });

  appendChildren(tagsSection, [tagsTitle, tagList]);

  appendChildren(sidebarContent, [librarySection, statusSection, tagsSection]);
  sidebar.appendChild(sidebarContent);

  return sidebar;
}

function createCenterPanel(): HTMLElement {
  const centerPanel = createElement('div', {
    className: 'flex-1 flex flex-col overflow-hidden',
  });

  const songs = getAllSongs();

  if (songs.length === 0) {
    const emptyState = createElement('div', {
      className: 'flex-1 flex items-center justify-center text-gray-500',
      innerHTML: `
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
          </svg>
          <p>曲がありません</p>
        </div>
      `,
    });
    centerPanel.appendChild(emptyState);
  } else {
    // テーブル
    const tableContainer = createElement('div', {
      className: 'flex-1 overflow-auto',
    });

    const table = createElement('table', {
      className: 'w-full text-sm',
    });

    // ヘッダー
    const thead = createElement('thead', {
      className: 'bg-gray-100 sticky top-0',
    });
    const headerRow = createElement('tr');
    ['曲名', 'タグ', 'ステータス', '追加日'].forEach((header) => {
      const th = createElement('th', {
        className: 'px-4 py-2 text-left text-xs font-semibold text-gray-600 border-b',
        textContent: header,
      });
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // ボディ
    const tbody = createElement('tbody');
    songs.forEach((song) => {
      const row = createElement('tr', {
        className: 'border-b hover:bg-gray-50 cursor-pointer',
      });

      row.addEventListener('click', () => {
        selectedSong = song;
        // 右パネルを更新
        renderDashboard();
      });

      // 曲名
      const titleCell = createElement('td', {
        className: 'px-4 py-2',
        textContent: song.title,
      });

      // タグ
      const tagsCell = createElement('td', {
        className: 'px-4 py-2',
      });
      const tagsSpan = createElement('span', {
        className: 'text-xs text-gray-600',
        textContent: song.tags.join(', ') || '-',
      });
      tagsCell.appendChild(tagsSpan);

      // ステータス
      const statusCell = createElement('td', {
        className: 'px-4 py-2',
      });
      const statusBadge = createElement('span', {
        className: 'px-2 py-0.5 rounded text-xs bg-gray-100',
        textContent: getStatusLabel(song.status),
      });
      statusCell.appendChild(statusBadge);

      // 追加日
      const dateCell = createElement('td', {
        className: 'px-4 py-2 text-xs text-gray-600',
        textContent: new Date(song.createdAt).toLocaleDateString('ja-JP'),
      });

      appendChildren(row, [titleCell, tagsCell, statusCell, dateCell]);
      tbody.appendChild(row);
    });

    appendChildren(table, [thead, tbody]);
    tableContainer.appendChild(table);
    centerPanel.appendChild(tableContainer);
  }

  return centerPanel;
}

function createRightPanel(): HTMLElement {
  const rightPanel = createElement('div', {
    className: 'w-80 border-l border-gray-200 overflow-y-auto bg-gray-50',
  });

  if (!selectedSong) {
    const placeholder = createElement('div', {
      className: 'flex items-center justify-center h-full text-gray-500 text-sm',
      textContent: '曲を選択してください',
    });
    rightPanel.appendChild(placeholder);
  } else {
    const detailContent = createElement('div', {
      className: 'p-4 space-y-4',
    });

    // タイトル
    const title = createElement('h3', {
      className: 'text-lg font-bold',
      textContent: selectedSong.title,
    });

    // プラットフォーム
    const platform = createElement('div', {
      className: 'text-xs px-2 py-1 bg-gray-200 rounded inline-block',
      textContent: selectedSong.platform === 'youtube' ? 'YouTube' : 'ニコニコ',
    });

    // URL
    const urlSection = createElement('div');
    const urlLabel = createElement('div', {
      className: 'text-xs font-semibold text-gray-600 mb-1',
      textContent: '原曲URL',
    });
    const urlLink = createElement('a', {
      className: 'text-xs text-blue-600 hover:underline break-all',
      textContent: selectedSong.originalVideoUrl,
    }) as HTMLAnchorElement;
    urlLink.href = selectedSong.originalVideoUrl;
    urlLink.target = '_blank';
    appendChildren(urlSection, [urlLabel, urlLink]);

    // タグ
    const tagsSection = createElement('div');
    const tagsLabel = createElement('div', {
      className: 'text-xs font-semibold text-gray-600 mb-1',
      textContent: 'タグ',
    });
    const tagsText = createElement('div', {
      className: 'text-sm',
      textContent: selectedSong.tags.join(', ') || '-',
    });
    appendChildren(tagsSection, [tagsLabel, tagsText]);

    // メモ
    if (selectedSong.notes) {
      const notesSection = createElement('div');
      const notesLabel = createElement('div', {
        className: 'text-xs font-semibold text-gray-600 mb-1',
        textContent: 'メモ',
      });
      const notesText = createElement('div', {
        className: 'text-sm whitespace-pre-wrap',
        textContent: selectedSong.notes,
      });
      appendChildren(notesSection, [notesLabel, notesText]);
      detailContent.appendChild(notesSection);
    }

    appendChildren(detailContent, [title, platform, urlSection, tagsSection]);
    rightPanel.appendChild(detailContent);
  }

  return rightPanel;
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
