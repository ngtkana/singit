import './styles/main.css';
import { router } from './router';
import { renderDashboard } from './pages/dashboard';
import { renderSongNewPage } from './pages/song-new';

// ルーティング設定
router.addRoute('/', () => {
  renderDashboard();
});

router.addRoute('/songs/new', () => {
  renderSongNewPage();
});

router.setNotFoundHandler(() => {
  router.navigate('/');
});

// アプリ初期化（常にダッシュボードを表示）
router.init();

console.log('Singit アプリケーション起動（ローカルファースト）');
