import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './config';

// メールアドレスとパスワードでログイン
export async function signInWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('ログインエラー:', error);
    throw error;
  }
}

// メールアドレスとパスワードでサインアップ
export async function signUpWithEmail(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('サインアップエラー:', error);
    throw error;
  }
}

// Googleでログイン
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error('Googleログインエラー:', error);
    throw error;
  }
}

// ログアウト
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('ログアウトエラー:', error);
    throw error;
  }
}

// 認証状態の監視
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 現在のユーザーを取得
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
