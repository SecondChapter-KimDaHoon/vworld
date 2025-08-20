import type { VWorldExtended, VWorldMapInstance } from "../types/index.ts";

export function getCenterCoordZ(
  vw: VWorldExtended | undefined,
  map: VWorldMapInstance | undefined
) {
  if (!vw || !map) return null;
  const anyMap = map as unknown as Record<string, unknown>;

  const coerceLonLat = (val: unknown): { lon: number; lat: number } | null => {
    if (!val) return null;
    if (Array.isArray(val) && val.length >= 2) {
      const [lon, lat] = val as unknown[];
      if (typeof lon === "number" && typeof lat === "number")
        return { lon, lat };
    }
    if (typeof val === "object") {
      const obj = val as Record<string, unknown>;
      const x = obj.x,
        y = obj.y;
      if (typeof x === "number" && typeof y === "number")
        return { lon: x, lat: y };
      const lon = (obj.lon ?? obj.longitude) as unknown;
      const lat = (obj.lat ?? obj.latitude) as unknown;
      if (typeof lon === "number" && typeof lat === "number")
        return { lon, lat };
      const position = obj.position as unknown;
      const pos = coerceLonLat(position);
      if (pos) return pos;
    }
    return null;
  };

  const callMethod = (name: string): { lon: number; lat: number } | null => {
    const fn = anyMap[name] as unknown;
    if (typeof fn !== "function") return null;
    try {
      const result = (fn as (...args: unknown[]) => unknown).call(anyMap);
      return coerceLonLat(result);
    } catch {
      return null;
    }
  };

  const candidates = [
    "getCenter",
    "getViewCenter",
    "getCameraPosition",
    "getPosition",
    "getView",
    "getCamera",
  ];

  for (const name of candidates) {
    const pos = callMethod(name);
    if (pos) return new vw.CoordZ(pos.lon, pos.lat, 1);
  }

  return new vw.CoordZ(127.425, 38.196, 1);
}
