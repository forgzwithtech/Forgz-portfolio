export interface PreloadResult {
  total: number;
  failed: string[];
}

/** Load one image fully (and decode it) so it paints instantly later. Retries once on failure. */
function loadImage(url: string, retries = 1): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      (img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).then(() => resolve(true));
    };
    img.onerror = () => {
      if (retries > 0) setTimeout(() => loadImage(url + (url.includes('?') ? '&' : '?') + 'r=1', retries - 1).then(resolve), 400);
      else resolve(false);
    };
    img.src = url;
  });
}

/**
 * Wait for every URL (and web fonts). Never rejects and never hangs: after `timeout` ms
 * the site opens anyway so a single slow file can't block the whole page.
 */
export async function preload(urls: string[], opts: { timeout?: number; onProgress?: (done: number, total: number) => void } = {}): Promise<PreloadResult> {
  const unique = Array.from(new Set(urls));
  const failed: string[] = [];
  let done = 0;
  const work = Promise.all(
    unique.map((u) =>
      loadImage(u).then((ok) => {
        if (!ok) failed.push(u);
        opts.onProgress?.(++done, unique.length);
      }),
    ),
  );
  const fonts = document.fonts?.ready.catch(() => undefined) ?? Promise.resolve();
  const limit = new Promise<void>((r) => setTimeout(r, opts.timeout ?? 15000));
  await Promise.race([Promise.all([work, fonts]), limit]);
  return { total: unique.length, failed };
}
