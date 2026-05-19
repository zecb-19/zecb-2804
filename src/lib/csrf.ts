export function validateOrigin(request: Request): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return true;
  const origin = request.headers.get("origin");
  if (origin) return origin.startsWith(appUrl);
  const referer = request.headers.get("referer");
  if (referer) return referer.startsWith(appUrl);
  return false;
}
