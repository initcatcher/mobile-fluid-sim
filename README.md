# 모바일 유체 시뮬레이션 (React 버전)

브라우저에서 실행되는 실시간 유체 시뮬레이션으로, 모바일 디바이스 센서에 반응합니다. 현실적인 유체 역학을 위해 FLIP (Fluid-Implicit-Particle) 기법을 사용했습니다.

## 데모

![Fluid Simulation Demo](mobile-fluid-sim.gif)

## 프로젝트 소개

이 프로젝트는 **SvelteKit에서 React로 마이그레이션**된 버전입니다. 원본 프로젝트에서 영감을 받아 React 생태계로 포팅했습니다.

### 주요 특징

- 📱 **모바일 센서 반응**: 디바이스의 기울임과 회전에 따라 중력 방향이 변경됩니다
- 🎨 **흔들어서 색상 변경**: 디바이스를 흔들면 8가지 유체 색상이 순환됩니다
- 🌊 **FLIP 유체 시뮬레이션**: 파티클과 그리드 기반의 하이브리드 접근법으로 현실적인 유체 역학 구현
- ⚡ **WebGL 렌더링**: 고성능 그래픽 처리로 부드러운 60FPS 애니메이션
- 📲 **PWA 지원**: 모바일에서 앱처럼 설치하여 사용 가능

### 기술적 구현

- **React 18** + **TypeScript**로 구현
- **Framer Motion**을 사용한 부드러운 색상 전환 애니메이션
- **Custom Hooks**로 디바이스 센서 로직 분리
- **WebGL 쉐이더**를 사용한 파티클 렌더링
- **Vite** 빌드 시스템

## 원본 프로젝트 정보

이 시뮬레이션은 [Ten Minute Physics YouTube 채널](https://www.youtube.com/channel/UCTG_vrRdKYfrpqCv_WV4eyA)에서 가르치는 유체 시뮬레이션 기법을 구현했습니다. 특히 [이 영상](https://youtu.be/XmzBREkK8kY)을 참고했습니다.

초기 영감은 [Nicholas L. Johnson의 flip-card 프로젝트](https://github.com/Nicholas-L-Johnson/flip-card/)에서 받았습니다.

## 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview
```

### 개발 명령어

- `pnpm dev` - Vite 개발 서버 실행
- `pnpm build` - 프로덕션 빌드 생성
- `pnpm preview` - 빌드된 버전 미리보기
- `pnpm check` - TypeScript 타입 검사
- `pnpm lint` - ESLint + Prettier 검사
- `pnpm format` - 코드 포맷팅

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── FluidSimulation.tsx
│   ├── GitHubLink.tsx
│   └── PopupInfo.tsx
├── hooks/              # 커스텀 React 훅
│   ├── useDeviceSensors.ts
│   └── useColorTween.ts
├── lib/               # 유체 엔진 (프레임워크 독립적)
│   └── fluid/
│       ├── FlipFluid.ts
│       ├── FluidRenderer.ts
│       └── FluidScene.ts
├── App.tsx            # 메인 앱 컴포넌트
└── main.tsx           # React 앱 진입점
```

## 주요 변경사항 (SvelteKit → React)

- **상태 관리**: Svelte의 `$state` → React의 `useState`
- **생명주기**: Svelte의 `onMount` → React의 `useEffect`
- **반응성**: Svelte의 `$effect` → React의 `useEffect`
- **애니메이션**: Svelte의 `Tween` 스토어 → Framer Motion
- **컴포넌트**: Svelte 컴포넌트 → React 함수형 컴포넌트

## 할 일

- [ ] 더 많은 상호작용 옵션 추가
  - [x] 흔들어서 색상 변경
  - [ ] 손가락으로 유체 조작
- [ ] 점성도 조절 기능 추가
- [ ] 다양한 유체 프리셋 추가

## 라이센스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.