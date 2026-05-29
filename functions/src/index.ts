import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';

initializeApp();

// テスト用のHello World関数
export const helloWorld = onRequest((request, response) => {
  response.json({ message: 'Singit Functions is running!' });
});
