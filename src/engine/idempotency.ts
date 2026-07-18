function fnv1a32(value: string, seed: number): number {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function createIdempotencyKey(
  tripId: string,
  disruptionId: string,
  itineraryId: string,
): string {
  const canonical = [tripId, disruptionId, itineraryId]
    .map((value) => `${value.length}:${value}`)
    .join("|");
  const high = fnv1a32(canonical, 0x811c9dc5)
    .toString(16)
    .padStart(8, "0");
  const low = fnv1a32(canonical, 0x9e3779b9)
    .toString(16)
    .padStart(8, "0");

  return `${high}${low}`;
}
