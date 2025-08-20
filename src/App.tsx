import "./App.css";
import { useEffect, useRef, useState } from "react";

type VWorldMapInstance = {
  setOption: (opts: unknown) => void;
  start: () => void;
};

type VWorld = {
  CameraPosition: new (...args: unknown[]) => unknown;
  CoordZ: new (...args: unknown[]) => unknown;
  Direction: new (...args: unknown[]) => unknown;
  Map: new () => VWorldMapInstance;
};

type WindowPosition = { x: number; y: number };
type FeatureInfo = { groupId?: string } | null | undefined;

type ModelZInstance = {
  create: () => void;
  addEventListener: (
    handler: (
      windowPosition: WindowPosition,
      ecefPosition: unknown,
      cartographic: unknown,
      featureInfo: FeatureInfo
    ) => void
  ) => void;
  setUrl?: (url: string) => void;
  setCoordz?: (coord: unknown) => void;
  setOptions?: (opts: unknown) => void;
};

type VWorldGeom = {
  ModelZ: new (
    id: string,
    url?: string,
    coord?: unknown,
    options?: unknown
  ) => ModelZInstance;
};

type VWorldPopupInstance = { create: () => void };
type VWorldPopupCtor = new (
  id: string,
  containerId: string,
  title: string,
  html: string,
  width: number,
  height: number,
  x: number,
  y: number
) => VWorldPopupInstance;

type VWorldExtended = VWorld & { geom: VWorldGeom; Popup: VWorldPopupCtor };

function App() {
  const initializedRef = useRef(false);
  const vwRef = useRef<VWorldExtended | undefined>(undefined);
  const mapRef = useRef<VWorldMapInstance | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scale = 1;
  const minimumPixelSize = 1;
  const [isClickPlaceMode, setIsClickPlaceMode] = useState<boolean>(false);
  const pickerEntityRef = useRef<unknown | null>(null);

  const getCenterCoordZ = () => {
    const vwGlobal = vwRef.current;
    const map = mapRef.current as unknown as
      | Record<string, unknown>
      | undefined;
    if (!vwGlobal || !map) return null;

    const coerceLonLat = (
      val: unknown
    ): { lon: number; lat: number } | null => {
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
      const fn = map[name] as unknown;
      if (typeof fn !== "function") return null;
      try {
        const result = (fn as (...args: unknown[]) => unknown).call(map);
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
      if (pos) return new vwGlobal.CoordZ(pos.lon, pos.lat, 1);
    }

    return new vwGlobal.CoordZ(127.425, 38.196, 1);
  };

  const getPickerCoordZ = () => {
    const vwGlobal = vwRef.current;
    const map = mapRef.current as unknown as
      | Record<string, unknown>
      | undefined;
    const container = document.getElementById("vmap");
    if (!vwGlobal || !map || !container) return null;

    const rect = container.getBoundingClientRect();
    const windowX = Math.round(rect.left + rect.width / 2);
    const windowY = Math.round(rect.top + rect.height / 2);

    const coerceLonLatHeight = (
      val: unknown
    ): { lon: number; lat: number; height?: number } | null => {
      if (!val) return null;
      if (Array.isArray(val) && val.length >= 2) {
        const [lon, lat, height] = val as unknown[];
        if (typeof lon === "number" && typeof lat === "number")
          return {
            lon,
            lat,
            height: typeof height === "number" ? height : undefined,
          };
      }
      if (typeof val === "object") {
        const obj = val as Record<string, unknown>;
        const lon = (obj.lon ?? obj.longitude ?? obj.x) as unknown;
        const lat = (obj.lat ?? obj.latitude ?? obj.y) as unknown;
        const h = (obj.height ?? obj.z ?? obj.alt) as unknown;
        if (typeof lon === "number" && typeof lat === "number")
          return { lon, lat, height: typeof h === "number" ? h : undefined };
        const carto = obj.cartographic as unknown;
        if (carto && typeof carto === "object") {
          const c = carto as Record<string, unknown>;
          const clon = (c.lon ?? c.longitude ?? c.x) as unknown;
          const clat = (c.lat ?? c.latitude ?? c.y) as unknown;
          const ch = (c.height ?? c.z ?? c.alt) as unknown;
          if (typeof clon === "number" && typeof clat === "number")
            return {
              lon: clon,
              lat: clat,
              height: typeof ch === "number" ? ch : undefined,
            };
        }
      }
      return null;
    };

    const tryCall = (
      name: string
    ): { lon: number; lat: number; height?: number } | null => {
      const fn = map[name] as unknown;
      if (typeof fn !== "function") return null;
      // Try (x, y)
      try {
        const result = (fn as (...args: unknown[]) => unknown).call(
          map,
          windowX,
          windowY
        );
        const pos = coerceLonLatHeight(result);
        if (pos) return pos;
      } catch {
        void 0;
      }
      // Try ({x,y})
      try {
        const result = (fn as (...args: unknown[]) => unknown).call(map, {
          x: windowX,
          y: windowY,
        });
        const pos = coerceLonLatHeight(result);
        if (pos) return pos;
      } catch {
        void 0;
      }
      return null;
    };

    const candidates = [
      "pick",
      "pickPosition",
      "pickCartographic",
      "pickFromWindowPoint",
      "getPickPosition",
      "getPositionFromWindowPoint",
      "windowToCartographic",
      "screenToCartographic",
      "getCartographicFromWindowPoint",
      "getLonLatFromPixel",
      "getLonLatFromWindowPoint",
    ];

    for (const name of candidates) {
      const pos = tryCall(name);
      if (pos) return new vwGlobal.CoordZ(pos.lon, pos.lat, pos.height ?? 1);
    }

    return null;
  };

  useEffect(() => {
    if (initializedRef.current) return;
    const vwGlobal = (window as unknown as { vw?: VWorldExtended }).vw;
    if (!vwGlobal) {
      console.error(
        "VWorld SDK가 로드되지 않았습니다. index.html의 스크립트 태그를 확인하세요."
      );
      return;
    }

    const options = {
      mapId: "vmap",
      initPosition: new vwGlobal.CameraPosition(
        new vwGlobal.CoordZ(127.425, 38.196, 1548700),
        new vwGlobal.Direction(0, -90, 0)
      ),
      logo: true,
      navigation: true,
    };

    const map = new vwGlobal.Map();
    map.setOption(options);
    map.start();
    vwRef.current = vwGlobal;
    mapRef.current = map;
    initializedRef.current = true;
  }, []);

  const handleFileLoad = () => {
    const vwGlobal = vwRef.current;
    const map = mapRef.current;
    if (!vwGlobal || !map) return;

    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const objectUrl = window.URL.createObjectURL(file);
    const point =
      getPickerCoordZ() ??
      getCenterCoordZ() ??
      new vwGlobal.CoordZ(126.921883, 37.52437, 1);
    const modelOptions = { scale, minimumPixelSize } as const;
    const id = "model_file_1";

    const modelz = new vwGlobal.geom.ModelZ(id, objectUrl, point, modelOptions);
    modelz.create();

    const eventHandler = (
      windowPosition: WindowPosition,
      _ecefPosition: unknown,
      _cartographic: unknown,
      featureInfo: FeatureInfo
    ) => {
      if (!featureInfo) return;
      const html = "모델 등록 이벤트";
      const title = "테스트";
      const popup = new vwGlobal.Popup(
        "pop01",
        "vmap",
        title,
        html,
        450,
        300,
        windowPosition.x,
        windowPosition.y
      );
      popup.create();
    };

    modelz.addEventListener(eventHandler);
  };

  const handleCreateGlb = () => {
    const vwGlobal = vwRef.current;
    const map = mapRef.current;
    if (!vwGlobal || !map) return;

    const id = "model_glb_1";
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      console.error("GLB 파일을 먼저 선택하세요.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".glb")) {
      console.error("선택한 파일이 .glb 형식이 아닙니다.");
      return;
    }
    const url = window.URL.createObjectURL(file);
    const point =
      getPickerCoordZ() ??
      getCenterCoordZ() ??
      new vwGlobal.CoordZ(126.921883, 37.52437, 1);
    const modelOptions = { scale, minimumPixelSize } as const;
    const modelz = new vwGlobal.geom.ModelZ(id, url, point, modelOptions);
    modelz.create();

    const eventHandler = (
      windowPosition: WindowPosition,
      _ecefPosition: unknown,
      _cartographic: unknown,
      featureInfo: FeatureInfo
    ) => {
      if (!featureInfo) return;
      const html = "모델 등록 이벤트";
      const title = "테스트";
      const popup = new vwGlobal.Popup(
        "pop01",
        "vmap",
        title,
        html,
        450,
        300,
        windowPosition.x,
        windowPosition.y
      );
      popup.create();
    };
    modelz.addEventListener(eventHandler);
  };

  const handleCreateGltf = () => {
    const vwGlobal = vwRef.current;
    const map = mapRef.current;
    if (!vwGlobal || !map) return;

    const id = "model_gltf_1";
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      console.error("GLTF 파일을 먼저 선택하세요.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".gltf")) {
      console.error("선택한 파일이 .gltf 형식이 아닙니다.");
      return;
    }
    const url = window.URL.createObjectURL(file);
    const point =
      getPickerCoordZ() ??
      getCenterCoordZ() ??
      new vwGlobal.CoordZ(126.921883, 37.52137, 1);
    const modelOptions = { scale, minimumPixelSize } as const;
    const modelz2 = new vwGlobal.geom.ModelZ(id);
    if (modelz2.setUrl) modelz2.setUrl(url);
    if (modelz2.setCoordz) modelz2.setCoordz(point);
    if (modelz2.setOptions) modelz2.setOptions(modelOptions);
    modelz2.create();
  };

  const handleToggleClickPlace = () => {
    setIsClickPlaceMode((prev) => !prev);
  };

  useEffect(() => {
    const vwGlobal = vwRef.current;
    const map = mapRef.current as unknown as
      | Record<string, unknown>
      | undefined;
    const container = document.getElementById("vmap");
    if (!vwGlobal || !map || !container) return;

    const onClick = (ev: MouseEvent) => {
      if (!isClickPlaceMode) return;

      let picked: { lon: number; lat: number; height?: number } | null = null;
      try {
        const viewer = (
          map as unknown as { getViewer?: () => unknown }
        ).getViewer?.() as
          | {
              canvas: HTMLCanvasElement;
              scene: {
                globe: {
                  ellipsoid: unknown;
                  pick?: (ray: unknown, scene: unknown) => unknown;
                };
                pickPosition?: (c2: unknown) => unknown;
              };
              camera: {
                pickEllipsoid?: (c2: unknown, ellipsoid: unknown) => unknown;
                getPickRay?: (c2: unknown) => unknown;
              };
              entities?: {
                add: (e: unknown) => unknown;
                remove: (e: unknown) => void;
              };
            }
          | undefined;

        const Cesium = (
          window as unknown as {
            Cesium?: {
              Cartesian2: new (x: number, y: number) => unknown;
              Cartesian3: {
                fromDegrees: (
                  lon: number,
                  lat: number,
                  height: number
                ) => unknown;
              };
              Ellipsoid: {
                WGS84: {
                  cartesianToCartographic: (v: unknown) => {
                    longitude: number;
                    latitude: number;
                    height: number;
                  };
                };
              };
              Math: { toDegrees: (radians: number) => number };
              VerticalOrigin: { BOTTOM: unknown };
              HeightReference: { CLAMP_TO_GROUND: unknown };
            };
          }
        ).Cesium;

        if (viewer && Cesium) {
          const rect = viewer.canvas.getBoundingClientRect();
          const px =
            ((ev.clientX - rect.left) * viewer.canvas.width) / rect.width;
          const py =
            ((ev.clientY - rect.top) * viewer.canvas.height) / rect.height;
          const c2 = new Cesium.Cartesian2(px, py);

          let cartesian: unknown = undefined;

          if (typeof viewer.scene.pickPosition === "function") {
            cartesian = viewer.scene.pickPosition(c2);
          }

          if (
            !cartesian &&
            typeof viewer.camera.getPickRay === "function" &&
            viewer.scene.globe &&
            typeof viewer.scene.globe.pick === "function"
          ) {
            const ray = viewer.camera.getPickRay(c2);
            if (ray) cartesian = viewer.scene.globe.pick(ray, viewer.scene);
          }

          if (!cartesian && typeof viewer.camera.pickEllipsoid === "function") {
            cartesian = viewer.camera.pickEllipsoid(
              c2,
              viewer.scene.globe.ellipsoid
            );
          }

          if (cartesian) {
            const cartographic =
              Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
            const lon = Cesium.Math.toDegrees(cartographic.longitude);
            const lat = Cesium.Math.toDegrees(cartographic.latitude);
            const height = cartographic.height;
            picked = { lon, lat, height };

            const position = Cesium.Cartesian3.fromDegrees(
              lon,
              lat,
              height ?? 0
            );
            if (pickerEntityRef.current && viewer.entities) {
              viewer.entities.remove(pickerEntityRef.current);
              pickerEntityRef.current = null;
            }
            if (viewer.entities) {
              const entity = viewer.entities.add({
                position,
                billboard: {
                  image:
                    "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='red'><path d='M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z'/></svg>",
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                  disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
              });
              pickerEntityRef.current = entity;
            }
          }
        }
      } catch {
        void 0;
      }

      if (!picked) return;

      const vwGlobal2 = vwRef.current;
      if (!vwGlobal2) return;
      const file = fileInputRef.current?.files?.[0];
      if (!file) return; // 파일 없으면 아이콘만 표시
      const lower = file.name.toLowerCase();
      const url = window.URL.createObjectURL(file);
      const point = new vwGlobal2.CoordZ(
        picked.lon,
        picked.lat,
        picked.height ?? 1
      );
      const modelOptions = { scale, minimumPixelSize } as const;

      if (lower.endsWith(".glb")) {
        const modelz = new vwGlobal2.geom.ModelZ(
          "model_click_glb",
          url,
          point,
          modelOptions
        );
        modelz.create();
      } else if (lower.endsWith(".gltf")) {
        const modelz2 = new vwGlobal2.geom.ModelZ("model_click_gltf");
        if (modelz2.setUrl) modelz2.setUrl(url);
        if (modelz2.setCoordz) modelz2.setCoordz(point);
        if (modelz2.setOptions) modelz2.setOptions(modelOptions);
        modelz2.create();
      } else {
        console.error(
          "지원하지 않는 파일 형식입니다. .glb 또는 .gltf를 선택하세요."
        );
        return;
      }

      setIsClickPlaceMode(false);
    };

    container.addEventListener("click", onClick);
    return () => {
      container.removeEventListener("click", onClick);
    };
  }, [isClickPlaceMode, scale, minimumPixelSize]);

  const checkText = `1. 파일에서 gltf/glb 객체를 로드할 수 있습니다.`;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div id="vmap" style={{ width: "100%", height: "60vh" }} />
      <div
        style={{
          padding: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input ref={fileInputRef} type="file" />
        <button onClick={handleFileLoad}>데이터로드</button>
        <button onClick={handleCreateGlb}>경로직접설정 glb</button>
        <button onClick={handleCreateGltf}>경로직접설정 gltf</button>
        <button
          onClick={handleToggleClickPlace}
          style={{ background: isClickPlaceMode ? "#e0f7ff" : undefined }}
          title="맵을 클릭한 위치에 배치"
        >
          {isClickPlaceMode ? "클릭배치: ON" : "클릭배치: OFF"}
        </button>
      </div>
      <div style={{ padding: 12, whiteSpace: "pre-line" }}>{checkText}</div>
    </div>
  );
}

export default App;
