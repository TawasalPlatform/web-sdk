export function isObjectLike(value: any) {
  return !!value && typeof value == "object";
}

export const isIOS = () => {
  let platform = navigator?.userAgent || navigator?.platform || "unknown";

  return /iPhone|iPod|iPad/.test(platform);
};

export function bigIntToHex(value?: bigint | string | null): string {
  const bigint = typeof value === "string" ? BigInt(value) : value;

  return bigint ? (bigint & BigInt("0xffffffffffffffff")).toString(16) : "";
}
