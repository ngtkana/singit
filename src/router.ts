type Route = {
  path: string;
  handler: () => void;
};

class Router {
  private routes: Route[] = [];
  private notFoundHandler: (() => void) | null = null;

  constructor() {
    window.addEventListener('popstate', () => this.handleRoute());
  }

  // ルートを登録
  addRoute(path: string, handler: () => void) {
    this.routes.push({ path, handler });
  }

  // 404ハンドラーを登録
  setNotFoundHandler(handler: () => void) {
    this.notFoundHandler = handler;
  }

  // パスに移動（履歴に追加）
  navigate(path: string) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  // パスを置き換え（履歴に追加しない）
  replace(path: string) {
    window.history.replaceState({}, '', path);
    this.handleRoute();
  }

  // 現在のパスに対応するハンドラーを実行
  private handleRoute() {
    const path = window.location.pathname;

    // 完全一致のルートを探す
    const exactMatch = this.routes.find((route) => route.path === path);
    if (exactMatch) {
      exactMatch.handler();
      return;
    }

    // パラメータ付きルート（例: /songs/:id）を探す
    const paramRoute = this.routes.find((route) => {
      const pattern = route.path.replace(/:\w+/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });

    if (paramRoute) {
      paramRoute.handler();
      return;
    }

    // マッチするルートがない場合
    if (this.notFoundHandler) {
      this.notFoundHandler();
    }
  }

  // パスパラメータを取得
  getParams(routePath: string): Record<string, string> {
    const path = window.location.pathname;
    const pattern = routePath.replace(/:\w+/g, '([^/]+)');
    const regex = new RegExp(`^${pattern}$`);
    const match = path.match(regex);

    if (!match) return {};

    const paramNames = routePath.match(/:\w+/g) || [];
    const params: Record<string, string> = {};

    paramNames.forEach((paramName, index) => {
      const key = paramName.slice(1); // ':' を除去
      params[key] = match[index + 1];
    });

    return params;
  }

  // 初期化（ページロード時にルーティング実行）
  init() {
    this.handleRoute();
  }
}

export const router = new Router();
