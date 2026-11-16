/** Keep runtime-loaded assets under the same deployment base as the app. */
export function assetUrl(path:string):string {
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path;
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '');
}
