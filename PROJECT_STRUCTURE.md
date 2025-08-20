# VWorld 프로젝트 구조

## 📁 프로젝트 개요
React + TypeScript + Vite 기반의 VWorld 3D 지도 애플리케이션입니다.

## 📂 폴더 구조

```
vworld/
├── 📄 Configuration Files
│   ├── eslint.config.js          # ESLint 설정
│   ├── package.json              # 의존성 및 스크립트 관리
│   ├── postcss.config.js         # PostCSS 설정 (Tailwind CSS)
│   ├── tailwind.config.js        # Tailwind CSS 설정
│   ├── tsconfig.json             # TypeScript 설정 (루트)
│   ├── tsconfig.app.json         # TypeScript 설정 (앱)
│   ├── tsconfig.node.json        # TypeScript 설정 (Node.js)
│   ├── vite.config.ts            # Vite 번들러 설정
│   └── yarn.lock                 # 의존성 잠금 파일
│
├── 📄 HTML & Assets
│   ├── index.html                # 메인 HTML (VWorld SDK 로드)
│   └── public/                   # 정적 파일
│       ├── scene.gltf           # 3D 모델 파일 (GLTF)
│       └── 아파트1(54m).glb      # 3D 모델 파일 (GLB)
│
└── 📁 src/                       # 소스 코드
    ├── 🎯 Core Application
    │   ├── main.tsx              # React 앱 진입점
    │   ├── App.tsx               # 메인 애플리케이션 컴포넌트
    │   ├── App.css               # 애플리케이션 스타일
    │   ├── index.css             # 글로벌 스타일 (Tailwind)
    │   ├── vite-env.d.ts         # Vite 환경 타입 정의
    │   └── ErrorBoundary.tsx     # React 에러 바운더리
    │
    ├── 📁 assets/                # 정적 자산
    │
    └── 📁 features/              # 기능별 모듈
        └── map/                  # 지도 관련 기능
            ├── types/            # 타입 정의
            │   └── index.ts      # VWorld SDK 타입 정의
            └── utils/            # 유틸리티 함수
                └── index.ts      # 지도 관련 헬퍼 함수
```

## 🏗️ 아키텍처 설계 원칙

### Feature-based Architecture
- **원칙**: 기능별로 코드를 그룹화하여 모듈성과 유지보수성을 향상
- **구조**: `src/features/[feature-name]/`

### Atomic Design Pattern
- **Atoms**: `src/shared/components` (재사용 가능한 최소 단위)
- **Molecules**: `src/features/[feature-name]/components/molecules`
- **Organisms**: `src/features/[feature-name]/components/organisms`
- **Templates**: `src/features/[feature-name]/components/templates`
- **Pages**: `src/pages`

### 의존성 규칙
- ✅ `features` → `shared` (허용)
- ❌ `shared` → `features` (금지)

## 📋 주요 기능

### 🗺️ Map Feature (`src/features/map/`)
- **types/index.ts**: VWorld SDK TypeScript 타입 정의
  - `VWorldExtended`: VWorld SDK 메인 인터페이스
  - `VWorldMapInstance`: 지도 인스턴스 타입
  - `VWorldGeom`: 3D 모델 관련 타입
  - `VWorldPopup`: 팝업 관련 타입

- **utils/index.ts**: 지도 관련 유틸리티 함수
  - `getCenterCoordZ`: 지도 중심 좌표 획득 함수

### 🎮 Main Application (`src/App.tsx`)
- VWorld 3D 지도 초기화
- 3D 모델 파일 업로드 및 배치
- Tailwind CSS 스타일링

## 🛠️ 기술 스택

### Frontend
- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안전성
- **Vite**: 빌드 도구
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크

### 3D Mapping
- **VWorld WebGL API**: 3D 지도 및 모델 렌더링
- **CesiumJS**: 내부적으로 사용되는 3D 지구 라이브러리

### Development Tools
- **ESLint**: 코드 품질 관리
- **PostCSS**: CSS 후처리
- **Yarn**: 패키지 관리

## 🚀 주요 특징

1. **Feature-based 구조**: 기능별 모듈 분리로 확장성 확보
2. **TypeScript 완전 지원**: VWorld SDK 타입 정의 제공
3. **현대적 스타일링**: Tailwind CSS 활용
4. **3D 모델 지원**: GLB/GLTF 파일 업로드 및 배치
5. **에러 처리**: React Error Boundary 적용

## 📝 개발 가이드

### 새로운 기능 추가 시
1. `src/features/[feature-name]/` 폴더 생성
2. 기능별 타입은 `types/index.ts`에 정의
3. 유틸리티는 `utils/index.ts`에 구현
4. 컴포넌트는 Atomic Design 원칙에 따라 분류

### 코딩 스타일
- Early return 패턴 사용 (if-else 최소화)
- 명확하고 읽기 쉬운 코드 우선
- 한국어 주석 및 변수명 활용
