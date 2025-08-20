import "./App.css";
import { useEffect, useRef } from "react";
import type {
  VWorldExtended,
  VWorldMapInstance,
} from "./features/map/types/index.ts";
import { getCenterCoordZ } from "./features/map/utils";

function App() {
  const initializedRef = useRef(false);
  const vwRef = useRef<VWorldExtended | undefined>(undefined);
  const mapRef = useRef<VWorldMapInstance | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scale = 1;
  const minimumPixelSize = 1;

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
      getCenterCoordZ(vwGlobal, map) ??
      new vwGlobal.CoordZ(126.921883, 37.52437, 1);
    const modelOptions = { scale, minimumPixelSize } as const;
    const id = "model_file_1";

    const modelz = new vwGlobal.geom.ModelZ(id, objectUrl, point, modelOptions);
    modelz.create();

    const eventHandler = (
      windowPosition: { x: number; y: number },
      _ecefPosition: unknown,
      _cartographic: unknown,
      featureInfo: { groupId?: string } | null | undefined
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

  const checkText = `1. 파일에서 gltf/glb 객체를 로드할 수 있습니다.`;

  return (
    <div className="flex flex-col w-full h-screen">
      <div id="vmap" className="w-full h-[60vh]" />
      <div className="flex flex-wrap items-center gap-2 p-3">
        <input ref={fileInputRef} type="file" />
        <button onClick={handleFileLoad}>데이터로드</button>
      </div>
      <div className="p-3 whitespace-pre-line">{checkText}</div>
    </div>
  );
}

export default App;
