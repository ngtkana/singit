import './styles/main.css';

// アプリエントリーポイント
const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold mb-4">Singit</h1>
      <p class="text-gray-600 mb-8">歌ってみた曲候補管理アプリ</p>
      <div class="space-x-4">
        <button class="btn-primary">ログイン</button>
        <button class="btn-secondary">詳細を見る</button>
      </div>
    </div>
  </div>
`;

console.log('Singit アプリケーション起動');
