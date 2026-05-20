# TASKS — 칸반 보드 개발 작업 목록

> 작성일: 2026-05-20  
> 프로젝트: Kanban Board v1.0

---

## 진행 상태 범례

| 심볼 | 의미 |
|------|------|
| ✅ | 완료 |
| 🔄 | 진행 중 |
| ⬜ | 대기 |
| ❌ | 블로킹 |

---

## Phase 0 — 프로젝트 셋업

| ID | 작업 | 담당 | 상태 | 비고 |
|----|------|------|------|------|
| T-001 | 디렉터리 구조 생성 (`kanban/`) | Kangsoo.Lee | ✅ | |
| T-002 | PLAN.md 작성 | Kangsoo.Lee | ✅ | |
| T-003 | PRD 작성 | Kangsoo.Lee | ✅ | |
| T-004 | TRD + 흐름도 + ERD 작성 | Kangsoo.Lee | ✅ | |
| T-005 | DESIGN_SYSTEM.md 작성 | Kangsoo.Lee | ✅ | |
| T-006 | TASKS.md 작성 | Kangsoo.Lee | ✅ | |
| T-007 | CONVENTION.md 작성 | Kangsoo.Lee | ✅ | |
| T-008 | CONTRIBUTING.md 작성 | Kangsoo.Lee | ✅ | |

---

## Phase 1 — 핵심 구현 (v1.0)

| ID | 작업 | 담당 | 상태 | 비고 |
|----|------|------|------|------|
| T-101 | `index.html` — HTML 구조 (3칼럼) | Kangsoo.Lee | ✅ | |
| T-102 | `style.css` — 칼럼·카드 레이아웃 | Kangsoo.Lee | ✅ | |
| T-103 | `style.css` — 배지·버튼 스타일 | Kangsoo.Lee | ✅ | |
| T-104 | `style.css` — 드래그 시각 피드백 | Kangsoo.Lee | ✅ | |
| T-105 | `app.js` — loadState / saveState | Kangsoo.Lee | ✅ | localStorage |
| T-106 | `app.js` — render 함수 | Kangsoo.Lee | ✅ | |
| T-107 | `app.js` — addCard 함수 | Kangsoo.Lee | ✅ | Enter 단축키 포함 |
| T-108 | `app.js` — deleteCard 함수 | Kangsoo.Lee | ✅ | |
| T-109 | `app.js` — HTML5 DnD 구현 | Kangsoo.Lee | ✅ | dragstart/over/leave/drop |
| T-110 | CSS·JS 파일 분리 (인라인 → 외부 파일) | Kangsoo.Lee | ✅ | |
| T-111 | XSS 방어 검증 (`textContent` 확인) | Kangsoo.Lee | ✅ | |

---

## Phase 2 — 품질 개선 (v1.1) — 예정

| ID | 작업 | 담당 | 상태 | 우선순위 |
|----|------|------|------|----------|
| T-201 | 카드 인라인 편집 (더블클릭) | — | ⬜ | High |
| T-202 | 같은 칼럼 내 카드 순서 변경 | — | ⬜ | High |
| T-203 | 카드 생성 일시 표시 | — | ⬜ | Medium |
| T-204 | 칸반 전체 초기화 버튼 + 확인 모달 | — | ⬜ | Medium |
| T-205 | 모바일 터치 드래그 지원 (Touch Events) | — | ⬜ | Medium |
| T-206 | 카드 우선순위 태그 (High/Medium/Low) | — | ⬜ | Low |
| T-207 | 다크 모드 지원 | — | ⬜ | Low |

---

## Phase 3 — 확장 기능 (v2.0) — 백로그

| ID | 작업 | 담당 | 상태 | 의존 |
|----|------|------|------|------|
| T-301 | 백엔드 API 설계 (ERD → 실제 DB) | — | ⬜ | T-201~207 |
| T-302 | 사용자 인증 (JWT) | — | ⬜ | T-301 |
| T-303 | 다중 보드 지원 | — | ⬜ | T-302 |
| T-304 | 실시간 협업 (WebSocket) | — | ⬜ | T-303 |
| T-305 | 카드 마감일 · 알림 | — | ⬜ | T-303 |
| T-306 | CSV/JSON 내보내기 | — | ⬜ | T-303 |

---

## 버그 트래커

| ID | 제목 | 심각도 | 상태 | 발견일 |
|----|------|--------|------|--------|
| B-001 | (현재 알려진 버그 없음) | — | — | — |

---

## 완료 기준 체크리스트 (v1.0 릴리즈)

- [x] Phase 0 전체 완료
- [x] Phase 1 T-101 ~ T-111 전체 완료
- [ ] 크로스브라우저 3종 수동 테스트
- [ ] `<script>alert(1)</script>` XSS 입력 테스트
- [ ] 모바일 320px 뷰 레이아웃 확인
- [ ] localStorage 데이터 영속성 확인 (새로고침)
