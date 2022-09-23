export function toMap<TValue>(obj: {
  [id: string]: TValue
} | undefined): Map<string, TValue> {
  const map = new Map<string, TValue>();
  if (!obj) {
    return map;
  }
  Object.keys(obj).forEach((key) => map.set(key, obj[key]));
  return map;
}
