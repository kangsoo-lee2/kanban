# Design System — 칸반 보드

> 버전: 1.0.0  
> 작성일: 2026-05-20  
> 작성자: Kangsoo.Lee

---

## 1. 디자인 원칙

| 원칙 | 설명 |
|------|------|
| **명확성** | 각 칼럼의 상태(To-Do/In-Progress/Done)를 색상만으로 즉시 인지 |
| **경량감** | 불필요한 장식 없이 콘텐츠에 집중 |
| **즉각성** | 모든 인터랙션에 150ms 이내 시각 피드백 |
| **일관성** | 동일한 컴포넌트는 어느 칼럼에서도 동일한 패턴 사용 |

---

## 2. 컬러 팔레트

### 2.1 기본 색상

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--color-bg` | `#f0f2f5` | 페이지 배경 |
| `--color-surface` | `#ffffff` | 칼럼·카드 배경 |
| `--color-text-primary` | `#333333` | 본문 텍스트 |
| `--color-text-muted` | `#aaaaaa` | placeholder |
| `--color-border` | `#e8ecef` | 카드 테두리 |

### 2.2 칼럼 테마 색상

| 칼럼 | 헤더 배경 | 강조선·배지·버튼 | Hover 버튼 |
|------|-----------|-----------------|------------|
| **To-Do** | `#e8f4fd` | `#3498db` | `#2980b9` |
| **In-Progress** | `#fef9e7` | `#f39c12` | `#d68910` |
| **Done** | `#eafaf1` | `#2ecc71` | `#27ae60` |

### 2.3 상태 색상

| 상태 | 값 | 용도 |
|------|----|------|
| 삭제 Hover | `#e74c3c` | `✕` 버튼 hover |
| 드롭 영역 | `#f0f7ff` | drag-over 배경 |
| 드롭 테두리 | `#3498db` (dashed) | drag-over 테두리 |
| 타이틀 | `#1a1a2e` | `<h1>` 색상 |

---

## 3. 타이포그래피

| 역할 | 폰트 패밀리 | 크기 | 굵기 | 기타 |
|------|-------------|------|------|------|
| 페이지 타이틀 | Segoe UI stack | `1.8rem` | 700 | `letter-spacing: -0.5px` |
| 칼럼 제목 | Segoe UI stack | `0.95rem` | 700 | uppercase, `letter-spacing: 0.5px` |
| 카드 본문 | Segoe UI stack | `0.9rem` | 400 | `line-height: 1.45` |
| 배지 숫자 | Segoe UI stack | `0.78rem` | 700 | — |
| 추가 버튼 | Segoe UI stack | `0.88rem` | 600 | — |
| 입력 영역 | Segoe UI stack | `0.85rem` | 400 | — |

**폰트 스택:** `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`

---

## 4. 간격 시스템

| 토큰 | 값 | 사용처 |
|------|----|--------|
| `space-xs` | `2px` | 배지 상하 패딩 |
| `space-sm` | `8px` | textarea 패딩, 카드 gap |
| `space-md` | `12px` | 카드 패딩, card-list 패딩 |
| `space-lg` | `16px` | 칼럼 헤더 패딩 |
| `space-xl` | `20px` | 보드 칼럼 간 gap |
| `space-2xl` | `24px` | 페이지 좌우 패딩 |
| `space-3xl` | `32px` | 페이지 상단 패딩, h1 하단 마진 |

---

## 5. 컴포넌트

### 5.1 Column (칼럼)

```
┌──────────────────────────────┐
│  COLUMN-TITLE         [N]    │  ← column-header (배경색 + 하단 강조선)
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │ card-text          [✕] │  │  ← .card (반복)
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ card-text          [✕] │  │
│  └────────────────────────┘  │
│                              │  ← .card-list (flex column, gap 10px)
├──────────────────────────────┤
│  [ textarea               ]  │
│  [        + 추가          ]  │  ← .add-area
└──────────────────────────────┘
```

| 속성 | 값 |
|------|----|
| 너비 | `300px` |
| 최소 높이 | `400px` |
| 모서리 | `border-radius: 12px` |
| 그림자 | `0 2px 8px rgba(0,0,0,0.08)` |

### 5.2 Card (카드)

| 상태 | 스타일 |
|------|--------|
| 기본 | border `#e8ecef`, shadow `0 1px 4px` |
| Hover | shadow `0 4px 12px`, `translateY(-1px)` |
| Dragging | `opacity: 0.4`, cursor `grabbing` |

### 5.3 Badge (배지)

- 모양: pill (`border-radius: 999px`)
- 기본색: `#ddd` / 칼럼별 테마색으로 오버라이드
- 최소 너비: `24px` (한 자리 숫자 정렬용)

### 5.4 Add Button (추가 버튼)

| 상태 | 스타일 |
|------|--------|
| 기본 | 칼럼 테마색 배경, 흰 텍스트 |
| Hover | 더 진한 테마색 (10% 어둡게) |

### 5.5 Drop Zone (드래그 오버)

```css
.card-list.drag-over {
  background: #f0f7ff;
  outline: 2px dashed #3498db;
  outline-offset: -4px;
}
```

---

## 6. 애니메이션 & 트랜지션

| 대상 | 속성 | 지속시간 | 이징 |
|------|------|----------|------|
| 카드 hover | `box-shadow`, `transform` | `0.15s` | ease |
| 카드 드래그 | `opacity`, `transform` | `0.15s` | ease |
| 버튼 hover | `background` | `0.15s` | ease |
| 드롭 영역 | `background` | `0.15s` | ease |
| 삭제 버튼 | `color` | `0.15s` | ease |

---

## 7. 레이아웃

```
viewport
└── body (padding: 32px 24px, background: #f0f2f5)
    ├── h1 (text-align: center)
    └── .board (display: flex, gap: 20px, flex-wrap: wrap, justify: center)
        ├── .column[data-col="todo"]
        ├── .column[data-col="inprogress"]
        └── .column[data-col="done"]
```

**반응형 동작:**
- `flex-wrap: wrap` 적용으로 좁은 화면에서 칼럼이 아래로 쌓임
- 320px 최소 뷰포트에서도 칼럼 1개가 온전히 표시됨

---

## 8. 아이콘

| 심볼 | 용도 | 구현 방식 |
|------|------|-----------|
| `✕` | 카드 삭제 | Unicode U+2715 (텍스트) |
| `+` | 카드 추가 버튼 prefix | 텍스트 리터럴 |

외부 아이콘 라이브러리 미사용.
