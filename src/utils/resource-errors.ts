// utils/resource-errors.ts
type ResourceEl = HTMLImageElement | HTMLScriptElement | HTMLLinkElement;

export function installResourceErrorHandlers(logger: { error: (m: string, meta?: any) => void }) {
  if (typeof window === 'undefined') return;
  
  window.addEventListener('error', (ev: Event) => {
    const t = ev?.target as ResourceEl | undefined;
    if (!t || !(t as any).tagName) return;
    
    const tag = (t as any).tagName.toLowerCase();
    const url = 
      (t as HTMLImageElement).currentSrc || 
      (t as HTMLImageElement).src || 
      (t as HTMLLinkElement).href || '(unknown)';

    // Apply fallback for images
    if (tag === 'img') {
      const img = t as HTMLImageElement;
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = '1';
        img.src = '/images/fallback.svg';
        img.srcset = '';
      }
    }

    // Log useful information without crashing
    logger.error('Resource loading failed', {
      tag,
      url,
      dataset: { ...((t as any).dataset || {}) }
    });
  }, true);
}