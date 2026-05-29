import { createElement, appendChildren, renderPage } from '@/lib/utils/dom';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/auth';
import { router } from '@/router';

export function renderLoginPage() {
  const container = createElement('div', {
    className: 'min-h-screen flex items-center justify-center bg-gray-50',
  });

  const card = createElement('div', {
    className: 'card max-w-md w-full space-y-6',
  });

  // タイトル
  const title = createElement('h1', {
    className: 'text-3xl font-bold text-center',
    textContent: 'Singit',
  });

  const subtitle = createElement('p', {
    className: 'text-gray-600 text-center',
    textContent: '歌ってみた曲候補管理',
  });

  // Googleログインボタン
  const googleButton = createElement('button', {
    className: 'btn-primary w-full flex items-center justify-center gap-2',
    innerHTML: `
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Googleでログイン
    `,
  });

  googleButton.addEventListener('click', async () => {
    try {
      googleButton.disabled = true;
      googleButton.textContent = 'ログイン中...';
      await signInWithGoogle();
      router.navigate('/');
    } catch (error) {
      console.error('Googleログインエラー:', error);
      alert('ログインに失敗しました');
      googleButton.disabled = false;
      googleButton.innerHTML = 'Googleでログイン';
    }
  });

  // 区切り線
  const divider = createElement('div', {
    className: 'relative',
    innerHTML: '<div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div><div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-500">または</span></div>',
  });

  // メールログインフォーム
  const form = createElement('form', {
    className: 'space-y-4',
  });

  const emailLabel = createElement('label', {
    className: 'block text-sm font-medium text-gray-700',
    textContent: 'メールアドレス',
  });

  const emailInput = createElement('input', {
    className: 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
    attributes: {
      type: 'email',
      required: 'true',
      placeholder: 'your@email.com',
    },
  });

  const emailGroup = createElement('div');
  appendChildren(emailGroup, [emailLabel, emailInput]);

  const passwordLabel = createElement('label', {
    className: 'block text-sm font-medium text-gray-700',
    textContent: 'パスワード',
  });

  const passwordInput = createElement('input', {
    className: 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary',
    attributes: {
      type: 'password',
      required: 'true',
      placeholder: '••••••••',
      minlength: '6',
    },
  });

  const passwordGroup = createElement('div');
  appendChildren(passwordGroup, [passwordLabel, passwordInput]);

  const submitButton = createElement('button', {
    className: 'btn-primary w-full',
    textContent: 'ログイン',
    attributes: {
      type: 'submit',
    },
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      submitButton.disabled = true;
      submitButton.textContent = 'ログイン中...';
      await signInWithEmail(email, password);
      router.navigate('/');
    } catch (error: any) {
      console.error('ログインエラー:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert('メールアドレスまたはパスワードが正しくありません');
      } else {
        alert('ログインに失敗しました');
      }
      submitButton.disabled = false;
      submitButton.textContent = 'ログイン';
    }
  });

  appendChildren(form, [emailGroup, passwordGroup, submitButton]);

  // 新規登録リンク（将来的に実装）
  const signupLink = createElement('p', {
    className: 'text-center text-sm text-gray-600',
    textContent: 'アカウントをお持ちでない場合は、Googleログインをご利用ください',
  });

  appendChildren(card, [
    title,
    subtitle,
    googleButton,
    divider,
    form,
    signupLink,
  ]);

  container.appendChild(card);
  renderPage(container);
}
