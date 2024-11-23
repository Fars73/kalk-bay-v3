type CacheItem<T> = {
  data: T;
  timestamp: number;
};

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>>;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly PRELOAD_BATCH_SIZE = 5;

  private constructor() {
    this.cache = new Map();
    this.setupStorageListener();
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === 'clearCache') {
        this.clear();
      }
    });
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Store in sessionStorage for tab persistence
    try {
      sessionStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to store in sessionStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    // Try memory cache first
    let item = this.cache.get(key);

    // If not in memory, try sessionStorage
    if (!item) {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        try {
          item = JSON.parse(stored) as CacheItem<T>;
          this.cache.set(key, item);
        } catch (error) {
          console.warn('Failed to parse stored cache:', error);
        }
      }
    }

    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      sessionStorage.removeItem(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
    sessionStorage.clear();
    localStorage.setItem('clearCache', Date.now().toString());
  }
}

export const cacheService = CacheService.getInstance();