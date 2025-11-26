# Excalidraw Desktop App

Excalidraw를 이용하여 이미지를 생성하고 저장할 수 있는 Electron 기반의 데스크톱 애플리케이션입니다.

## 프로젝트 구조

### Main Process (Clean Architecture)
```
src/main/
├── index.ts                    # Electron 애플리케이션 진입점
├── ipc/
│   ├── index.ts               # IPC 핸들러 설정
│   └── handlers/
│       └── fileHandler.ts      # 파일 저장/로드 IPC 핸들러
├── services/
│   └── window.ts              # BrowserWindow 생성 로직
└── utils/
    └── dev.ts                 # 개발 환경 유틸
```

### Renderer Process (Feature Sliced Design + Clean Architecture)
```
src/renderer/
├── index.tsx                  # React 진입점
├── index.html                 # HTML 템플릿
├── index.css                  # 전역 스타일
├── App.tsx                    # 루트 컴포넌트
├── features/
│   ├── canvas/                # Excalidraw 캔버스 기능
│   │   ├── ui/
│   │   │   └── ExcalidrawCanvas.tsx
│   │   └── index.ts
│   └── fileBrowser/           # 파일 브라우징 기능
│       ├── ui/
│       │   └── FileBrowser.tsx
│       └── index.ts
└── shared/
    ├── api/
    │   └── ipc.ts             # IPC API 정의
    ├── hooks/
    │   └── useFileOperations.ts  # 파일 작업 커스텀 훅
    ├── store/
    │   └── drawingStore.ts     # Zustand 상태 관리
    └── types/
        └── window.d.ts         # 전역 타입 정의
```

## 기술 스택

### Frontend
- **React 19.2** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Tailwind CSS 4** - 유틸리티 기반 CSS
- **shadcn/ui** - 컴포넌트 라이브러리
- **React Router 7** - 라우팅 (확장성을 위해 설치)
- **Zustand** - 상태 관리
- **TanStack Query** - 서버 상태 관리 및 IPC 통신
- **@excalidraw/excalidraw** - 드로잉 라이브러리

### Backend/Desktop
- **Electron 39** - 데스크톱 애플리케이션 프레임워크
- **electron-vite** - Electron + Vite 통합 빌드 도구
- **Vite 7** - 고속 모듈 번들러

## 주요 기능

### 1. 파일 관리
- **파일 브라우징**: 파일 시스템에서 `.excalidraw` 파일 탐색
- **파일 열기**: 기존 그림 파일 로드
- **파일 저장**: 그림을 `filename.excalidraw` 형식으로 저장
- **썸네일 생성**: 그림의 썸네일을 `filename.png` 형식으로 자동 저장

### 2. 그림 편집
- **Excalidraw 통합**: 완전한 Excalidraw 캔버스 통합
- **실시간 편집**: 그림 요소 추가, 수정, 삭제
- **자동 저장**: 수정 시 자동 저장 기능 (구현 가능)

### 3. IPC 통신
- **비동기 통신**: TanStack Query를 통한 IPC 호출
- **파일 I/O**: Main 프로세스에서 파일 시스템 접근
- **다이얼로그**: 파일 열기/저장 다이얼로그

## 설치 및 실행

### 개발 서버 실행
```bash
npm install
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 빌드된 앱 실행
```bash
npm start
```

## 아키텍처 설명

### Main Process Architecture
Main 프로세스는 Clean Architecture 원칙을 따릅니다:
- **index.ts**: 애플리케이션 라이프사이클 관리
- **services/**: 비즈니스 로직 (윈도우 생성 등)
- **ipc/handlers/**: IPC 채널 정의 및 요청 처리
- **utils/**: 유틸리티 함수

### Renderer Process Architecture
Renderer는 Feature Sliced Design (FSD) + Clean Architecture를 결합합니다:

#### Feature Sliced Design
각 기능(`canvas`, `fileBrowser`)은 독립적인 슬라이스로 구성되어 있으며, 다음을 포함합니다:
- **UI Layer**: React 컴포넌트
- **Model Layer**: 상태 관리, 비즈니스 로직

#### Clean Architecture
레이어 분리:
- **UI Components**: 프레젠테이션 로직
- **Hooks**: 비즈니스 로직 (useFileOperations)
- **API Layer**: 외부 시스템과의 통신 (ipc.ts)
- **Store**: 상태 관리 (Zustand)

이 구조는 다음과 같은 이점을 제공합니다:
- **확장성**: 새로운 기능 추가가 용이
- **테스트 가능성**: 각 계층을 독립적으로 테스트 가능
- **유지보수성**: 관심사의 분리로 코드 이해도 증대

## IPC 채널

### file:save
파일 저장 요청
```typescript
ipcMain.handle('file:save', async (event, { filename, data }) => {
  // filename.excalidraw로 저장
  // 반환: { success: boolean, filePath: string }
})
```

### file:load
파일 로드 요청
```typescript
ipcMain.handle('file:load', async (event, filePath?) => {
  // filePath에서 파일 로드
  // 반환: { success: boolean, data: ExcalidrawData, filePath: string }
})
```

### file:saveThumbnail
썸네일 저장 요청
```typescript
ipcMain.handle('file:saveThumbnail', async (event, { filePath, imageData }) => {
  // filename.png로 썸네일 저장
  // 반환: { success: boolean, thumbnailPath: string }
})
```

### file:browse
파일 브라우징 요청
```typescript
ipcMain.handle('file:browse', async (event, directory?) => {
  // 디렉토리의 파일 목록 반환
  // 반환: { success: boolean, files: FileItem[], currentPath: string }
})
```

## 상태 관리

### Zustand Store (drawingStore)
```typescript
const { currentFile, drawingData, setCurrentFile, setDrawingData, clearDrawing } = useDrawingStore()
```

### TanStack Query Hooks
```typescript
const saveFileMutation = useSaveFile()
const loadFileMutation = useLoadFile()
const { data: files, isLoading } = useBrowseFiles(directory)
```

## 스타일링

### Tailwind CSS
유틸리티 기반 CSS를 사용하여 빠르고 효율적인 스타일링을 제공합니다.

### shadcn/ui
필요에 따라 shadcn/ui 컴포넌트를 추가할 수 있습니다:
```bash
npx shadcn-ui@latest add button
```

## 확장 가능성

### 새로운 기능 추가
1. `src/renderer/features/` 디렉토리에 새로운 슬라이스 생성
2. UI 컴포넌트와 커스텀 훅 작성
3. 필요한 경우 Main 프로세스에 IPC 핸들러 추가

### IPC 핸들러 추가
1. `src/main/ipc/handlers/` 디렉토리에 새로운 핸들러 생성
2. `src/renderer/shared/api/ipc.ts`에 API 정의 추가
3. `src/renderer/shared/hooks/useFileOperations.ts`에 커스텀 훅 추가

## 개발 팁

### Hot Module Replacement (HMR)
- Renderer 프로세스는 자동으로 HMR을 지원합니다
- 개발 중 파일을 저장하면 자동으로 업데이트됩니다

### DevTools
- 개발 모드에서는 자동으로 DevTools가 열립니다

### 타입 체크
```bash
npm run type-check
```

## 개발 상태 및 진행 사항

### ✅ 완료된 작업

#### Phase 1: 프로젝트 초기 설정
- [x] Electron + Vite + React 프로젝트 구조 설정
- [x] TypeScript 설정
- [x] Tailwind CSS 4 + PostCSS 설정
- [x] Path alias 설정 (@/, @main/)

#### Phase 2: Main Process 구현
- [x] Electron 애플리케이션 라이프사이클 관리
- [x] BrowserWindow 생성 (노드 통합, nodeIntegration)
- [x] IPC 채널 설정 및 핸들러 구현
  - [x] `file:save` - `.excalidraw` 파일 저장
  - [x] `file:load` - `.excalidraw` 파일 로드
  - [x] `file:saveThumbnail` - `.png` 썸네일 저장
  - [x] `file:browse` - 파일 시스템 탐색

#### Phase 3: Renderer Process 구현
- [x] React + TypeScript 기본 구조
- [x] Zustand 상태 관리 (drawingStore)
- [x] TanStack Query 커스텀 훅 (useFileOperations)
- [x] Feature Sliced Design 적용
  - [x] `features/canvas/` - Excalidraw 캔버스
  - [x] `features/fileBrowser/` - 파일 브라우저

#### Phase 4: Excalidraw 통합
- [x] Excalidraw 컴포넌트 렌더링
- [x] CSS 스타일시트 임포트
- [x] 레이아웃 및 플렉스 설정

#### Phase 5: 버그 수정 및 개선 (완료)
- [x] **Excalidraw API 초기화 문제 해결**
  - 문제: ref 패턴으로 API를 받으려 했으나 항상 null
  - 해결: `excalidrawAPI` prop callback 사용 (공식 방법)
  - 결과: Save 버튼이 "Drawing not ready" 에러 없이 작동

- [x] **AppState 직렬화 문제 해결**
  - 문제: `appState.collaborators`는 Map 객체인데 JSON으로 직렬화 불가
  - 해결: 저장 시 제거, 로드 시 빈 Map으로 재구성
  - 결과: 파일 저장/로드 시 "collaborators.forEach is not a function" 에러 해결

### 🔄 진행 중인 작업
- 앱 종합 테스트 및 안정성 검증

### 📋 향후 작업 (TODO)

#### Phase 6: 기능 개선
- [ ] **자동 저장 기능**
  - `onChange` 콜백 활용하여 실시간 자동 저장
  - 저장 인터벌 설정 (예: 30초마다)

- [ ] **파일 브라우저 완성**
  - 파일 목록에서 그림 미리보기 (썸네일)
  - 파일 선택 시 자동 로드
  - 파일 삭제 기능

- [ ] **UI/UX 개선**
  - shadcn/ui 컴포넌트 추가 (Dialog, Button 등)
  - 파일 저장 상태 표시 (저장됨/저장 중 등)
  - 에러 처리 및 사용자 피드백

#### Phase 7: 보안 및 최적화
- [ ] **Content Security Policy (CSP) 설정**
  - 현재 "unsafe-eval" 경고 해결
  - 보안 정책 강화

- [ ] **렌더러 프로세스 보안 강화**
  - nodeIntegration 비활성화 (프로덕션)
  - preload 스크립트 사용
  - Context Isolation 활성화

- [ ] **성능 최적화**
  - 번들 크기 분석 및 최적화
  - 이미지 최적화
  - 메모리 누수 확인

#### Phase 8: 빌드 및 배포
- [ ] **프로덕션 빌드 설정**
  - 애플리케이션 아이콘 설정
  - DMG/EXE 빌더 설정
  - 자동 업데이트 구성

- [ ] **배포 준비**
  - 테스트 완료
  - 배포 가이드 작성

### 버그 수정 로그

#### Fix #1: Excalidraw API Reference (2025-11-27)
**Commit**: `5998a9c`
- 원인: ref 콜백 패턴이 Excalidraw v0.18.0에서 지원되지 않음
- 해결: `excalidrawAPI` prop 사용
- 영향: "Drawing not ready" 에러 완전 해결

#### Fix #2: AppState Serialization (2025-11-27)
**Commit**: `5998a9c`
- 원인: `appState.collaborators` Map 객체를 JSON으로 직렬화할 수 없음
- 해결: 로드 시 Map 재구성, 저장 시 적절한 처리
- 영향: 파일 저장/로드 시 크래시 해결

## 문제 해결

### 빌드 에러
- `node_modules` 삭제 후 재설치: `npm install`
- 캐시 제거: `npm cache clean --force`

### IPC 통신 오류
- Main 프로세스에서 IPC 핸들러가 올바르게 등록되었는지 확인
- Renderer에서 `window.electron?.ipcRenderer.invoke()` 호출 확인

### Excalidraw 렌더링 문제
- CSS 임포트 확인: `import '@excalidraw/excalidraw/index.css'`
- 레이아웃 확인: 플렉스 컨테이너에 적절한 높이/너비 설정

### API 초기화 문제 (해결됨)
- ref 패턴 대신 `excalidrawAPI` prop callback 사용
- `ExcalidrawImperativeAPI` 타입 사용

## 라이선스

ISC

## 작성자

Pyunghyuk Yoo
