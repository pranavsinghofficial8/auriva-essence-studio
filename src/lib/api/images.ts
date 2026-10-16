/**
 * Image URLs from the backend, with a temporary stand-in for the seed photos.
 *
 * The backend's seed gives every sample photo the Cloudinary id `auriva/seed/<name>`, where
 * <name> is one of our own files in src/assets (e.g. `prod-jasmine`). Until those photos are
 * uploaded to Cloudinary they answer 404, so with VITE_BUNDLED_SEED_IMAGES=true a seed URL is
 * swapped for our bundled copy. Photos the owner uploads in the admin panel have other ids and are
 * always used as they come. Remove the setting once the seed photos are on Cloudinary.
 */

const bundled = import.meta.glob<string>("/src/assets/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const byName = new Map(
  Object.entries(bundled).map(([path, url]) => [
    path.slice(path.lastIndexOf("/") + 1).replace(/\.\w+$/, ""),
    url,
  ]),
);

const useBundledSeedImages = import.meta.env.VITE_BUNDLED_SEED_IMAGES === "true";

/** `…/auriva/seed/prod-jasmine` (Cloudinary) or `placehold.co/…?text=prod-jasmine` (no cloud name). */
const seedName = (url: string) =>
  /\/auriva\/seed\/([\w-]+)(?:\.\w+)?$/.exec(url)?.[1] ??
  /^https:\/\/placehold\.co\/.*[?&]text=([\w-]+)/.exec(url)?.[1];

/** The URL to render for an image the backend sent. */
export function apiImage(url: string): string {
  if (!useBundledSeedImages) return url;
  const name = seedName(url);
  return (name && byName.get(name)) || url;
}
