import './styles/main.css';
import { router } from './router';
import { renderDashboard } from './pages/dashboard';

// ルーティング設定
router.addRoute('/', () => {
  renderDashboard();
});

router.setNotFoundHandler(() => {
  router.navigate('/');
});

// アプリ初期化（常にダッシュボードを表示）
router.init();

console.log('Singit アプリケーション起動（ローカルファースト）');
