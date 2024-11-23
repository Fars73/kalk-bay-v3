class ImageCacheService {
  private static instance: ImageCacheService;
  private cache: Map<string, HTMLImageElement>;
  private preloadQueue: string[];
  private isPreloading: boolean;

  private constructor() {
    this.cache = new Map();
    this.preloadQueue = [];
    this.isPreloading = false;
  }

  static getInstance(): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService();
    }
    return ImageCacheService.instance;
  }

  async preloadImage(url: string): Promise<void> {
    if (this.cache.has(url)) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async preloadImages(urls: string[]): Promise<void> {
    if (this.isPreloading) {
      this.preloadQueue.push(...urls);
      return;
    }

    this.isPreloading = true;
    const uniqueUrls = [...new Set(urls)];

    try {
      await Promise.all(
        uniqueUrls.map(url => this.preloadImage(url))
      );
    } finally {
      this.isPreloading = false;
      if (this.preloadQueue.length > 0) {
        const nextUrls = [...this.preloadQueue];
        this.preloadQueue = [];
        await this.preloadImages(nextUrls);
      }
    }
  }

  getImage(url: string): HTMLImageElement | undefined {
    return this.cache.get(url);
  }

  hasImage(url: string): boolean {
    return this.cache.has(url);
  }

  clear(): void {
    this.cache.clear();
    this.preloadQueue = [];
  }
}

export const imageCache = ImageCacheService.getInstance();