import { Timestamp } from 'firebase/firestore';

// Timestampを日本語形式の日付文字列に変換
export function formatDate(timestamp: Timestamp): string {
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Timestampを相対時間に変換（例: 3分前、2日前）
export function formatRelativeTime(timestamp: Timestamp): string {
  const now = Date.now();
  const date = timestamp.toMillis();
  const diff = now - date;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) {
    return 'たった今';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}時間前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}日前`;
  } else {
    return formatDate(timestamp);
  }
}

// 秒数を時間形式に変換（例: 3:45）
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 数値をカンマ区切りに変換
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ja-JP').format(num);
}
