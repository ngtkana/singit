import './styles/main.css';
import { router } from './router';
import { onAuthChange } from './lib/firebase/auth';
import { renderLoginPage } from './pages/login';
import { renderDashboard } from './pages/dashboard';

// ルーティング設定
router.addRoute('/', () => {
  renderDashboard();
});

router.addRoute('/login', () => {
  renderLoginPage();
});

router.setNotFoundHandler(() => {
  router.navigate('/');
});

// 認証状態の監視
let isInitialized = false;

onAuthChange((user) => {
  if (!isInitialized) {
    // 初回ロード時
    isInitialized = true;
    if (user) {
      // ログイン済み
      if (window.location.pathname === '/login') {
        router.replace('/');
      } else {
        router.init();
      }
    } else {
      // 未ログイン
      router.replace('/login');
    }
  } else {
    // 認証状態変更時
    if (user) {
      router.navigate('/');
    } else {
      router.navigate('/login');
    }
  }
});

console.log('Singit アプリケーション起動');
