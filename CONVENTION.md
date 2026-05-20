# CONVENTION — 코딩 컨벤션

> 프로젝트: Kanban Board  
> 작성일: 2026-05-20  
> 적용 범위: `index.html`, `style.css`, `app.js`

---

## 1. 공통

### 1.1 인코딩·줄바꿈
- 파일 인코딩: **UTF-8** (BOM 없음)
- 줄 끝: **LF** (`\n`)
- 마지막 줄: 빈 줄 1개로 끝냄

### 1.2 들여쓰기
- **스페이스 2칸** (탭 미사용)
- 중첩 깊이는 4단계를 넘지 않도록 리팩터

### 1.3 줄 길이
- 최대 **100자** (주석 포함)

---

## 2. HTML 컨벤션

### 2.1 기본 규칙
```html
<!-- 좋음: 소문자 태그·속성, 큰따옴표 -->
<div class="card" data-col="todo" draggable="true">

<!-- 나쁨 -->
<DIV CLASS='card' DATA-COL="todo" DRAGGABLE=true>
```

### 2.2 속성 순서
```
1. id
2. class
3. data-*
4. aria-*
5. 기타 (draggable, href, src, type, ...)
```

### 2.3 시맨틱 태그
- 제목: `<h1>` ~ `<h3>` 계층 유지
- 버튼: `<button>` 사용, `<div onclick>` 금지
- 입력: `<textarea>`, `<input>` + 연결된 `<label>` 권장

### 2.4 스크립트·스타일 위치
```html
<head>
  <link rel="stylesheet" href="style.css" />   <!-- CSS: <head> -->
</head>
<body>
  ...
  <script src="app.js"></script>               <!-- JS: </body> 직전 -->
</body>
```

---

## 3. CSS 컨벤션

### 3.1 선택자 네이밍 — BEM Light

```css
/* Block */
.column { }
.card { }
.badge { }

/* Element (__ 구분자) */
.column-header { }   /* column의 header */
.card-text { }       /* card의 text */
.card-delete { }     /* card의 delete 버튼 */
.card-list { }       /* column의 카드 목록 */
.add-area { }        /* column의 추가 영역 */
.add-btn { }         /* add-area의 버튼 */

/* Modifier (상태 클래스) */
.card.dragging { }   /* 드래그 중인 카드 */
.card-list.drag-over { }  /* 드롭 대상 영역 */
```

### 3.2 속성 선언 순서

```css
.element {
  /* 1. 레이아웃·포지셔닝 */
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 8px;

  /* 2. 박스 모델 */
  width: 300px;
  min-height: 400px;
  padding: 12px 14px;
  margin: 0;
  border: 1px solid #e8ecef;
  border-radius: 8px;

  /* 3. 시각 */
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  opacity: 1;

  /* 4. 타이포그래피 */
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.45;
  color: #333;
  text-align: left;

  /* 5. 인터랙션 */
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.15s, transform 0.15s;
}
```

### 3.3 색상 표기
- 6자리 소문자 HEX 사용: `#3498db` (3자리 축약형 지양)
- 반투명은 `rgba()`: `rgba(0, 0, 0, 0.08)`
- 매직 넘버 반복 시 CSS Custom Properties 추출:
  ```css
  :root {
    --color-todo: #3498db;
  }
  ```

### 3.4 미디어쿼리
```css
/* 모바일 우선 (필요 시) */
@media (max-width: 768px) {
  .board { flex-direction: column; align-items: center; }
}
```

### 3.5 금지사항
- `!important` — 구체성 문제는 선택자로 해결
- `*` 전체 선택자 — reset 이외 용도 금지
- 인라인 스타일 `style=""` — JS로 임시 토글이 필요하면 클래스 추가로 대체

---

## 4. JavaScript 컨벤션

### 4.1 변수 선언
```js
// 상수: const 우선
const COLS = ['todo', 'inprogress', 'done'];

// 재할당 필요 시만 let
let dragSrcCol = null;

// var 금지
```

### 4.2 네이밍

| 종류 | 형식 | 예시 |
|------|------|------|
| 변수·함수 | camelCase | `loadState`, `srcIdx` |
| 상수 (모듈 레벨) | UPPER_SNAKE | `COLS` |
| DOM ID 참조 | camelCase | `const list = document.getElementById(...)` |
| 이벤트 핸들러 | on + 동사 | `card.addEventListener('dragstart', ...)` (익명 arrow) |

### 4.3 함수
```js
// 선호: function 선언 (호이스팅 활용, 주요 공개 함수)
function addCard(col) { ... }

// 허용: arrow function (이벤트 콜백, 단순 변환)
list.addEventListener('drop', (e) => { ... });

// 금지: 불필요한 익명 함수 중첩 3단계 이상
```

### 4.4 오류 처리
```js
// localStorage 파싱: try/catch 필수
function loadState() {
  try {
    return JSON.parse(localStorage.getItem('kanban'))
      || { todo: [], inprogress: [], done: [] };
  } catch {
    return { todo: [], inprogress: [], done: [] };
  }
}

// dataTransfer 파싱: try/catch 필수
try { src = JSON.parse(e.dataTransfer.getData('text/plain')); }
catch { return; }
```

### 4.5 DOM 조작
```js
// 텍스트 삽입: textContent만 사용 (XSS 방지)
span.textContent = text;          // 좋음
span.innerHTML = text;            // 금지

// 클래스 토글: classList API 사용
card.classList.add('dragging');
card.classList.remove('dragging');
```

### 4.6 이벤트 위임
- 카드 삭제 버튼은 `onclick` 인라인이 아닌 `addEventListener` 사용 (현재 코드 준수)
- 전역 `onclick=` 인라인 속성은 단순 호출 진입점으로만 허용:
  ```html
  <button onclick="addCard('todo')">+ 추가</button>
  ```

### 4.7 세미콜론
- **항상 세미콜론 작성** (ASI 의존 금지)

### 4.8 문자열
- **작은따옴표** 선호: `'todo'`, `'kanban'`
- 템플릿 리터럴은 변수 삽입 시만: `` `list-${col}` ``

---

## 5. 파일 구조 컨벤션

```
kanban/
├── index.html        ← 마크업만. 스크립트·스타일 직접 포함 금지
├── style.css         ← 모든 스타일. JS에서 style="" 직접 조작 금지
├── app.js            ← 모든 로직. DOM 구조 가정을 최소화
└── *.md              ← 문서 (코드 미포함)
```

- HTML에 `<style>` 인라인 블록 추가 금지
- HTML에 `<script>` 로직 블록 추가 금지 (단순 `addCard('col')` 호출 제외)
- `app.js`에서 `document.write()` 금지

---

## 6. 커밋 메시지

```
<type>(<scope>): <subject>

type:
  feat     새 기능
  fix      버그 수정
  style    포맷·공백 (기능 무관)
  refactor 리팩터링
  docs     문서만 변경
  chore    빌드·설정

scope: html | css | js | docs

예시:
  feat(js): 카드 인라인 편집 기능 추가
  fix(js): 같은 칼럼 드롭 시 카드 중복 삽입 수정
  docs: CONVENTION.md 작성
```

- 제목 50자 이내
- 본문 필요 시 빈 줄 한 줄 후 작성 (why 중심)
- 한국어 사용 가능
