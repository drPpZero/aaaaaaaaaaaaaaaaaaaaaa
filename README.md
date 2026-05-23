# CG_Figure_Skating - Figure Skating Action Sequence Player

피겨 스케이팅 동작을 선택하여 하나의 Sequence로 구성하고, 구성된 Sequence를 BVH 기반 애니메이션으로 재생하는 웹 애플리케이션입니다.

사용자는 Action Library에서 원하는 동작을 선택하고 Sequence에 추가할 수 있으며, Play Mode에서 선택한 동작들이 순서대로 이어지는 애니메이션을 확인할 수 있습니다.

---

## 프로젝트 개요

이 프로젝트는 피겨 스케이팅 동작을 시각적으로 구성하고 재생하기 위한 인터랙티브 애플리케이션입니다.

크게 두 가지 화면으로 구성됩니다.

1. **Edit Mode**
   - Action Library에서 동작 선택
   - 선택한 동작 정보 확인
   - Sequence에 동작 추가
   - Sequence에서 동작 삭제
   - 총 소요 시간 확인

2. **Play Mode**
   - 사용자가 구성한 Sequence 재생
   - 현재 재생 중인 동작 확인
   - 전체 시간과 현재 시간 확인
   - Time Bar를 통한 재생 위치 조정
   - Pause, Reset, Edit Mode 전환 지원

---

## 주요 기능

### Action 선택

사용자는 Action Library에서 피겨 스케이팅 동작을 선택할 수 있습니다.

동작을 선택하면 다음 정보가 표시됩니다.

- 동작 이름
- 동작 설명
- 요구 시간
- 난이도
- 카테고리

선택된 동작은 시각적으로 강조되며, `Append in Sequence` 버튼이 활성화됩니다.

---

### Sequence 구성

선택한 동작은 Sequence에 순서대로 추가됩니다.

Sequence에 추가된 각 동작은 고유한 `instanceId`를 가지며, 이를 통해 같은 동작이 여러 번 추가되더라도 개별 항목으로 관리할 수 있습니다.

지원 기능은 다음과 같습니다.

- 동작을 Sequence 맨 뒤에 추가
- Sequence 내 동작 삭제
- 삭제 후 순서 번호 자동 재계산
- 전체 재생 시간 계산

---

### BVH 기반 애니메이션 재생

Play Mode에서는 Edit Mode에서 구성한 Sequence를 기반으로 BVH 애니메이션을 이어서 재생합니다.

재생 중에는 현재 시간이 어느 동작 구간에 해당하는지 계산하고, 해당 동작의 BVH pose를 모델에 적용합니다.

지원 기능은 다음과 같습니다.

- Play / Pause
- Reset
- Time Bar 이동
- 현재 동작 highlight
- Edit Mode 복귀

---

## 폴더 구조

```text
src/
├─ main.js
├─ actions.js
├─ state.js
│
├─ ui/
│  ├─ editScreen.js
│  ├─ playScreen.js
│  ├─ actionLibrary.js
│  ├─ actionInfo.js
│  ├─ sequenceBar.js
│  └─ timeBar.js
│
├─ graphics/
│  ├─ renderer.js
│  ├─ scene.js
│  ├─ camera.js
│  └─ model.js
│
└─ bvh/
   ├─ bvhLoader.js
   ├─ bvhParser.js
   └─ bvhSequencePlayer.js
```

---

## 핵심 설계

이 프로젝트는 역할별 책임을 분리하는 것을 핵심 설계 원칙으로 합니다.

| 영역 | 역할 |
|---|---|
| `main.js` | 앱 초기화 및 화면 전환 |
| `actions.js` | 피겨 동작 데이터 관리 |
| `state.js` | 전역 상태 관리 |
| `ui/` | 화면 구성 및 사용자 이벤트 처리 |
| `graphics/` | 3D 렌더링 및 모델 관리 |
| `bvh/` | BVH 파일 로드, 파싱, Sequence 재생 |

UI, 상태, 그래픽 렌더링, BVH 처리 로직을 분리함으로써 유지보수성과 협업 효율을 높였습니다.

---

## 주요 파일 설명

### `main.js`

애플리케이션의 진입점입니다.

주요 역할은 다음과 같습니다.

- 전체 앱 초기화
- 렌더러 초기화
- 현재 모드 확인
- Edit Mode / Play Mode 화면 렌더링
- 애니메이션 루프 실행

`main.js`는 세부 UI나 BVH 처리 로직을 직접 담당하지 않고, 전체 흐름만 제어합니다.

---

### `actions.js`

프로젝트에서 사용할 피겨 스케이팅 동작 정보를 정의합니다.

각 동작은 다음 정보를 가집니다.

```js
{
  id: "spiral",
  name: "Spiral",
  category: "Step / Spiral",
  requiredTime: 4,
  difficulty: "Medium",
  description: "The action of lifting one leg back, tilting the upper body forward, and sliding.",
  iconPath: "./assets/icons/spiral.png",
  bvhPath: "./assets/bvh/spiral.bvh"
}
```

이 데이터는 Action Library, Action Information, Sequence Bar, BVH Player에서 공통으로 사용됩니다.

---

### `state.js`

앱 전체에서 공유하는 상태를 관리합니다.

```js
export const state = {
  mode: "edit",
  selectedActionId: null,
  sequence: [],
  isPlaying: false,
  currentTime: 0,
  currentActionIndex: 0,
};
```

특히 Edit Mode에서 만든 Sequence가 Play Mode에서도 유지되어야 하므로, Sequence는 공통 상태로 관리됩니다.

---

## UI 구조

### `ui/editScreen.js`

Edit Mode 화면 전체를 구성합니다.

담당 기능은 다음과 같습니다.

- Current Action 영역 표시
- Action Library 표시
- Action Information 표시
- Sequence Bar 표시
- Total Time 표시
- Append in Sequence 버튼 처리
- Play 버튼 처리

---

### `ui/playScreen.js`

Play Mode 화면 전체를 구성합니다.

담당 기능은 다음과 같습니다.

- 메인 3D 모델 화면 표시
- 하단 Sequence Bar 표시
- 현재 재생 중인 동작 highlight
- 현재 시간 / 총 시간 표시
- Time Bar 표시
- Pause / Reset / Edit Mode 버튼 처리

Play Mode에서는 Sequence 수정이 불가능하며, 재생과 시간 조작만 담당합니다.

---

### `ui/actionLibrary.js`

Action Library 영역을 담당합니다.

`ACTIONS` 배열을 기반으로 동작 카드를 생성하고, 사용자가 카드를 클릭하면 선택 상태를 변경합니다.

---

### `ui/actionInfo.js`

선택된 동작의 상세 정보를 표시합니다.

선택된 동작이 없을 경우 빈 상태를 유지하며, Append 버튼은 비활성화됩니다.

---

### `ui/sequenceBar.js`

Sequence에 추가된 동작들을 보여주는 공통 UI 컴포넌트입니다.

Edit Mode와 Play Mode에서 모두 사용됩니다.

```js
renderSequenceBar(container, {
  editable: true,
  activeIndex: null,
});
```

Edit Mode에서는 삭제 버튼을 표시하고, Play Mode에서는 현재 재생 중인 동작만 highlight합니다.

---

### `ui/timeBar.js`

Play Mode의 재생 시간 조작 바를 담당합니다.

사용자가 Time Bar를 움직이면 현재 시간이 변경되고, 해당 시간에 맞는 BVH pose가 모델에 적용됩니다.

---

## Graphics 구조

### `graphics/renderer.js`

WebGL 또는 Three.js 렌더러를 초기화하고 관리합니다.

담당 기능은 다음과 같습니다.

- Canvas 설정
- Renderer 생성
- 화면 크기 설정
- Resize 대응
- Scene 렌더링

---

### `graphics/scene.js`

3D 장면을 구성합니다.

담당 기능은 다음과 같습니다.

- Scene 생성
- 조명 추가
- 모델 추가
- 배경 또는 바닥 구성

---

### `graphics/camera.js`

카메라를 생성하고 화면 모드에 맞게 위치를 조정합니다.

예를 들어 Edit Mode에서는 Current Action Preview에 적합한 카메라를 사용하고, Play Mode에서는 전체 동작을 보기 좋은 카메라를 사용할 수 있습니다.

---

### `graphics/model.js`

BVH motion을 적용할 3D 모델 또는 skeleton을 관리합니다.

BVH Player가 모델에 pose를 적용할 수 있도록 다음과 같은 인터페이스를 제공합니다.

```js
export function createModel() {
  return {
    root,
    joints,
    resetPose,
    applyPose,
  };
}
```

---

## BVH 구조

### `bvh/bvhLoader.js`

BVH 파일을 불러오고 캐싱합니다.

같은 동작이 Sequence에 여러 번 추가될 수 있으므로, 이미 로드한 BVH 파일은 다시 불러오지 않고 재사용합니다.

---

### `bvh/bvhParser.js`

BVH 텍스트 파일을 JavaScript 객체로 변환합니다.

파싱 대상은 다음과 같습니다.

- HIERARCHY
- ROOT
- JOINT
- OFFSET
- CHANNELS
- MOTION
- Frames
- Frame Time
- Frame별 motion data

BVH의 rotation 값은 일반적으로 degree 단위이므로, Three.js에 적용할 때는 radian 변환이 필요합니다.

---

### `bvh/bvhSequencePlayer.js`

Sequence를 하나의 timeline처럼 이어서 재생하는 핵심 파일입니다.

주요 역할은 다음과 같습니다.

- Sequence 기반 timeline 생성
- 전체 재생 시간 계산
- 현재 시간이 어느 action 구간인지 계산
- global time을 BVH local time으로 변환
- 해당 BVH pose를 모델에 적용
- Play / Pause / Reset / Time Bar 이동 처리

예시 timeline은 다음과 같습니다.

```js
[
  {
    index: 0,
    actionId: "loop_jump",
    startTime: 0,
    endTime: 3,
    duration: 3,
  },
  {
    index: 1,
    actionId: "spiral",
    startTime: 3,
    endTime: 7,
    duration: 4,
  }
]
```

---

## 실행 흐름

### Edit Mode

```text
Action Library에서 동작 선택
        ↓
selectedActionId 변경
        ↓
Action Information 갱신
        ↓
Append in Sequence 버튼 활성화
        ↓
Sequence에 동작 추가
        ↓
Total Time 재계산
```

---

### Play Mode

```text
Play 버튼 클릭
        ↓
state.mode = "play"
        ↓
Sequence 기반 timeline 생성
        ↓
BVH 파일 preload
        ↓
currentTime에 따라 현재 action segment 계산
        ↓
localTime 계산
        ↓
model.applyPose() 호출
        ↓
화면 렌더링
```