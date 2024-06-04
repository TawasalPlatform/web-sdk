export function isObjectLike(value: any) {
  return !!value && typeof value == "object";
}

export const isIOS = () => {
  let platform = navigator?.userAgent || navigator?.platform || "unknown";

  return /iPhone|iPod|iPad/.test(platform);
};
