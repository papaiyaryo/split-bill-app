export function getLS<T>(key: string, fallback: T): T {
  try {
    const raw: string | null = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 容量オーバーなどは無視
  }
}
