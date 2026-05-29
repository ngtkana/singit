import { createElement, appendChildren, renderPage } from '@/lib/utils/dom';
import { signOut, getCurrentUser, signInWithGoogle } from '@/lib/firebase/auth';
import { getAllSongs, deleteSong, addSong } from '@/lib/storage/local';
import type { Song, VideoLink } from '@/types/song';
import { ListMusic, SquarePlay, Trash2 } from 'lucide-static';
import { fetchYouTubeVideoData } from '@/lib/api/youtube';
import { parseVideoUrl } from '@/lib/utils/video-parser';

let selectedSong: Song | null = null;

async function handleUrlInput(url: string, inputElement: HTMLInputElement) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return;

  const { platform, videoId, normalizedUrl } = parseVideoUrl(trimmedUrl);

  if (platform !== 'youtube' || !videoId) {
    alert('有効なYouTube URLを入力してください');
    return;
  }

  inputElement.value = '取得中...';
  inputElement.disabled = true;

  try {
    const data = await fetchYouTubeVideoData(videoId);

    if (!data) {
      alert('動画情報の取得に失敗しました');
      return;
    }

    const videoLink: VideoLink = {
      id: crypto.randomUUID(),
      platform: 'youtube',
      url: normalizedUrl,
      videoId,
      title: data.title,
      thumbnailUrl: data.thumbnailUrl,
      duration: data.duration,
      publishedAt: data.publishedAt,
      viewCount: data.viewCount,
      description: data.description,
      createdAt: Date.now(),
    };

    // 曲を追加（推論は後で実装）
    const now = Date.now();
    const newSong: Omit<Song, 'id'> = {
      title: data.title, // とりあえず動画タイトルをそのまま使用
      videoLinks: [videoLink],
      composer: [],
      arranger: [],
      vocalist: [],
      lyricist: [],
      notes: '',
      createdAt: now,
      updatedAt: now,
    };

    addSong(newSong);
    renderDashboard();
  } catch (error) {
    console.error('曲追加エラー:', error);
    alert('曲の追加に失敗しました');
  } finally {
    inputElement.value = '';
    inputElement.disabled = false;
  }
}

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

  // URL入力欄
  const urlInput = createElement('input', {
    className: 'px-3 py-1.5 border border-gray-300 rounded text-sm w-96',
    attributes: {
      type: 'text',
      placeholder: 'YouTube URLを貼り付け...',
    },
  }) as HTMLInputElement;

  urlInput.addEventListener('paste', async (e) => {
    e.preventDefault();
    const url = e.clipboardData?.getData('text');
    if (!url) return;

    urlInput.value = url;
    await handleUrlInput(url, urlInput);
  });

  urlInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleUrlInput(urlInput.value, urlInput);
    }
  });

  topBarRight.appendChild(urlInput);

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

  appendChildren(sidebarContent, [librarySection]);
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
    });

    const emptyContent = createElement('div', {
      className: 'text-center',
    });

    const iconWrapper = createElement('div', {
      className: 'mx-auto h-12 w-12 text-gray-400 mb-4',
      innerHTML: ListMusic,
    });

    const message = createElement('p', {
      textContent: '曲がありません',
    });

    appendChildren(emptyContent, [iconWrapper, message]);
    emptyState.appendChild(emptyContent);
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
    ['曲名', 'YouTube', '追加日'].forEach((header) => {
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

      // リンク
      const linkCell = createElement('td', {
        className: 'px-4 py-2',
      });

      const linkContainer = createElement('div', {
        className: 'flex gap-1 items-center',
      });

      song.videoLinks.forEach((link) => {
        const linkButton = createElement('button', {
          className: 'p-0.5 rounded text-red-600 hover:bg-red-50 w-5 h-5 flex items-center justify-center',
          innerHTML: SquarePlay,
          attributes: {
            type: 'button',
            'aria-label': `再生: ${link.title}`,
          },
        });
        linkButton.title = link.title;

        linkButton.addEventListener('click', (e) => {
          e.stopPropagation();
          const newWindow = window.open(link.url, '_blank');
          if (newWindow) {
            newWindow.opener = null;
          }
        });

        linkContainer.appendChild(linkButton);
      });

      linkCell.appendChild(linkContainer);

      // 追加日
      const dateCell = createElement('td', {
        className: 'px-4 py-2 text-xs text-gray-600',
        textContent: new Date(song.createdAt).toLocaleDateString('ja-JP'),
      });

      appendChildren(row, [titleCell, linkCell, dateCell]);
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
    const song = selectedSong; // ローカル変数に代入して型を固定
    const detailContent = createElement('div', {
      className: 'p-4 space-y-4',
    });

    // ヘッダー（タイトル + 削除ボタン）
    const header = createElement('div', {
      className: 'flex justify-between items-start',
    });

    const title = createElement('h3', {
      className: 'text-lg font-bold flex-1',
      textContent: song.title,
    });

    const deleteButton = createElement('button', {
      className: 'p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded',
      innerHTML: Trash2,
      attributes: {
        type: 'button',
        'aria-label': `削除: ${song.title}`,
      },
    });
    deleteButton.title = '削除';

    deleteButton.addEventListener('click', () => {
      if (confirm(`「${song.title}」を削除しますか？`)) {
        deleteSong(song.id);
        selectedSong = null;
        renderDashboard();
      }
    });

    appendChildren(header, [title, deleteButton]);

    // YouTube動画
    const linksSection = createElement('div');
    const linksLabel = createElement('div', {
      className: 'text-xs font-semibold text-gray-600 mb-2',
      textContent: 'YouTube',
    });

    const linksList = createElement('div', {
      className: 'space-y-2',
    });

    song.videoLinks.forEach((link) => {
      const linkItem = createElement('div', {
        className: 'border border-gray-200 rounded p-2',
      });

      const urlLink = createElement('a', {
        className: 'text-xs text-blue-600 hover:underline break-all',
        textContent: link.url,
        attributes: {
          rel: 'noopener noreferrer',
        },
      }) as HTMLAnchorElement;
      urlLink.href = link.url;
      urlLink.target = '_blank';

      linkItem.appendChild(urlLink);
      linksList.appendChild(linkItem);
    });

    appendChildren(linksSection, [linksLabel, linksList]);

    // メタデータ（推論結果）
    const metadataSection = createElement('div', {
      className: 'space-y-2',
    });

    const metadataItems: Array<{ label: string; values: string[] }> = [
      { label: '作曲', values: song.composer },
      { label: 'ボーカル', values: song.vocalist },
      { label: '作詞', values: song.lyricist },
      { label: '編曲', values: song.arranger },
    ];

    metadataItems.forEach(({ label, values }) => {
      if (values.length > 0) {
        const item = createElement('div');
        const itemLabel = createElement('div', {
          className: 'text-xs font-semibold text-gray-600',
          textContent: label,
        });
        const itemValue = createElement('div', {
          className: 'text-sm text-gray-900',
          textContent: values.join(', '),
        });
        appendChildren(item, [itemLabel, itemValue]);
        metadataSection.appendChild(item);
      }
    });

    // メモ
    if (song.notes) {
      const notesSection = createElement('div');
      const notesLabel = createElement('div', {
        className: 'text-xs font-semibold text-gray-600 mb-1',
        textContent: 'メモ',
      });
      const notesText = createElement('div', {
        className: 'text-sm whitespace-pre-wrap',
        textContent: song.notes,
      });
      appendChildren(notesSection, [notesLabel, notesText]);
      detailContent.appendChild(notesSection);
    }

    appendChildren(detailContent, [header, linksSection, metadataSection]);
    rightPanel.appendChild(detailContent);
  }

  return rightPanel;
}
