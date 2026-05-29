// DOM要素を作成
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    className?: string;
    id?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options?.className) {
    element.className = options.className;
  }

  if (options?.id) {
    element.id = options.id;
  }

  if (options?.textContent) {
    element.textContent = options.textContent;
  }

  if (options?.innerHTML) {
    element.innerHTML = options.innerHTML;
  }

  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  return element;
}

// 子要素を追加
export function appendChildren(
  parent: HTMLElement,
  children: (HTMLElement | string)[]
) {
  children.forEach((child) => {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else {
      parent.appendChild(child);
    }
  });
}

// 要素をクリア
export function clearElement(element: HTMLElement) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// アプリのルート要素を取得
export function getAppElement(): HTMLElement {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    throw new Error('App element not found');
  }
  return app;
}

// ページをレンダリング
export function renderPage(content: HTMLElement) {
  const app = getAppElement();
  clearElement(app);
  app.appendChild(content);
}
