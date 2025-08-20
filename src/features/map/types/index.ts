export type VWorldMapInstance = {
  setOption: (opts: unknown) => void;
  start: () => void;
  // Optional bridge to underlying viewer (Cesium)
  getViewer?: () => unknown;
};

export type VWorld = {
  CameraPosition: new (...args: unknown[]) => unknown;
  CoordZ: new (...args: unknown[]) => unknown;
  Direction: new (...args: unknown[]) => unknown;
  Map: new () => VWorldMapInstance;
};

export type VWorldGeom = {
  ModelZ: new (
    id: string,
    url?: string,
    coord?: unknown,
    options?: unknown
  ) => {
    create: () => void;
    addEventListener: (
      handler: (
        windowPosition: { x: number; y: number },
        ecefPosition: unknown,
        cartographic: unknown,
        featureInfo: { groupId?: string } | null | undefined
      ) => void
    ) => void;
    setUrl?: (url: string) => void;
    setCoordz?: (coord: unknown) => void;
    setOptions?: (opts: unknown) => void;
  };
};

export type VWorldPopupInstance = { create: () => void };
export type VWorldPopupCtor = new (
  id: string,
  containerId: string,
  title: string,
  html: string,
  width: number,
  height: number,
  x: number,
  y: number
) => VWorldPopupInstance;

export type VWorldExtended = VWorld & {
  geom: VWorldGeom;
  Popup: VWorldPopupCtor;
};
