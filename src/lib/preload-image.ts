/**
 * Resolves once the image is downloaded and decoded, or after timeoutMs so a
 * slow connection never stalls navigation. Route loaders await this for the
 * first image a page shows, so it's already there when the page crossfades in.
 */
export function preloadImage(src: string, timeoutMs = 1500): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const img = new Image();
  img.src = src;
  return Promise.race([
    img.decode().catch(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
}
