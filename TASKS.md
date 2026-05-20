# TASKS — 칸반 보드 개발 작업 목록

> 최종 업데이트: 2026-05-20  
> 프로젝트: Kanban Board v2.0

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
| T-002 | PLAN.md 작성 | Kangsoo.Lee | ✅ | v2.0 업데이트 완료 |
| T-003 | PRD 작성 | Kangsoo.Lee | ✅ | v2.0 업데이트 완료 |
| T-004 | TRD + 흐름도 + ERD 작성 | Kangsoo.Lee | ✅ | v2.0 업데이트 완료 |
| T-005 | DESIGN_SYSTEM.md 작성 | Kangsoo.Lee | ✅ | |
| T-006 | TASKS.md 작성 | Kangsoo.Lee | ✅ | v2.0 업데이트 완료 |
| T-007 | CONVENTION.md 작성 | Kangsoo.Lee | ✅ | |
| T-008 | CONTRIBUTING.md 작성 | Kangsoo.Lee | ✅ | v2.0 업데이트 완료 |

---

## Phase 1 — 핵심 구현 (v1.0)

| ID | 작업 | 담당 | 상태 | 비고 |
|----|------|------|------|------|
| T-101 | `index.html` — HTML 구조 (3칼럼) | Kangsoo.Lee | ✅ | |
| T-102 | `style.css` — 칼럼·카드 레이아웃 | Kangsoo.Lee | ✅ | |
| T-103 | `style.css` — 배지·버튼 스타일 | Kangsoo.Lee | ✅ | |
| T-104 | `style.css` — 드래그 시각 피드백 | Kangsoo.Lee | ✅ | |
| T-105 | `app.js` — loadState / saveState | Kangsoo.Lee | ✅ | localStorage (v2.0에서 Supabase로 교체) |
| T-106 | `app.js` — render 함수 | Kangsoo.Lee | ✅ | |
| T-107 | `app.js` — addCard 함수 | Kangsoo.Lee | ✅ | Enter 단축키 포함 |
| T-108 | `app.js` — deleteCard 함수 | Kangsoo.Lee | ✅ | |
| T-109 | `app.js` — HTML5 DnD 구현 | Kangsoo.Lee | ✅ | dragstart/over/leave/drop |
| T-110 | CSS·JS 파일 분리 (인라인 → 외부 파일) | Kangsoo.Lee | ✅ | |
| T-111 | XSS 방어 검증 (`textContent` 확인) | Kangsoo.Lee | ✅ | |

---

## Phase 2 — Supabase 인증 + GitHub Pages 배포 (v2.0)

| ID | 작업 | 담당 | 상태 | 비고 |
|----|------|------|------|------|
| T-201 | Supabase 프로젝트 연결 (URL + anon key) | Kangsoo.Lee | ✅ | |
| T-202 | 로그인 화면 HTML/CSS 구현 | Kangsoo.Lee | ✅ | Google·GitHub·이메일 버튼 |
| T-203 | Google OAuth 로그인 | Kangsoo.Lee | ✅ | `signInWithOAuth({ provider: 'google' })` |
| T-204 | GitHub OAuth 로그인 | Kangsoo.Lee | ✅ | `signInWithOAuth({ provider: 'github' })` |
| T-205 | 이메일/비밀번호 회원가입·로그인 | Kangsoo.Lee | ✅ | `signUp` / `signInWithPassword` |
| T-206 | 세션 자동 복원 (`onAuthStateChange`) | Kangsoo.Lee | ✅ | |
| T-207 | 로그아웃 버튼 + 헤더 사용자 UI | Kangsoo.Lee | ✅ | 아바타 이니셜 + 이메일 표시 |
| T-208 | Supabase `cards` 테이블 DDL 작성 | Kangsoo.Lee | ✅ | DATABASE.md 참조 |
| T-209 | RLS 정책 적용 (사용자별 데이터 격리) | Kangsoo.Lee | ✅ | 4개 정책 (SELECT/INSERT/UPDATE/DELETE) |
| T-210 | `app.js` — loadCards (Supabase SELECT) | Kangsoo.Lee | ✅ | localStorage 완전 대체 |
| T-211 | `app.js` — addCard (Supabase INSERT) | Kangsoo.Lee | ✅ | |
| T-212 | `app.js` — deleteCard (Supabase DELETE) | Kangsoo.Lee | ✅ | |
| T-213 | `app.js` — moveCard (Supabase UPDATE) | Kangsoo.Lee | ✅ | |
| T-214 | GitHub 저장소 생성 (`kangsoo-lee2/kanban`) | Kangsoo.Lee | ✅ | https://github.com/kangsoo-lee2/kanban |
| T-215 | GitHub Pages 활성화 (main 브랜치 루트) | Kangsoo.Lee | ✅ | https://kangsoo-lee2.github.io/kanban/ |
| T-216 | Supabase Redirect URL 등록 | Kangsoo.Lee | ✅ | https://kangsoo-lee2.github.io/kanban/ |
| T-217 | SVG inline favicon 추가 | Kangsoo.Lee | ✅ | 404 경고 제거 |
| T-218 | 에러 메시지 한국어화 | Kangsoo.Lee | ✅ | |

---

## Phase 2 버그 수정 이력

| ID | 제목 | 원인 | 해결 | 상태 |
|----|------|------|------|------|
| B-001 | 이메일 회원가입 시 `user null` TypeError | `signUp` 응답의 `data.user`가 null인 경우 `updateUserUI` 직접 호출 | `data.session` 존재 여부로 분기, `updateUserUI`에 null 가드 추가 | ✅ |
| B-002 | 로그인 후 보드 화면으로 전환 안 됨 | CSS `#auth-section { display: flex }`가 HTML `hidden` 속성(`display: none`)을 덮어씀 | `hidden` 대신 `style.display = 'none'` 인라인 스타일로 전환 (인라인 > CSS 우선순위) | ✅ |
| B-003 | 로그인 후 "로그인 중..." 에서 멈춤 | `handleEmailLogin`에서 `await loadCards()` 로 보드 전환 전에 대기 | 로그인 성공 처리를 `onAuthStateChange`로 일원화, `loadCards()`에서 await 제거 | ✅ |

---

## Phase 3 — 품질 개선 (v2.1) — 예정

| ID | 작업 | 담당 | 상태 | 우선순위 |
|----|------|------|------|----------|
| T-301 | 카드 인라인 편집 (더블클릭) | — | ⬜ | High |
| T-302 | 같은 칼럼 내 카드 순서 변경 | — | ⬜ | High |
| T-303 | 카드 생성 일시 표시 | — | ⬜ | Medium |
| T-304 | Supabase Realtime 실시간 동기화 | — | ⬜ | Medium |
| T-305 | 모바일 터치 드래그 지원 (Touch Events) | — | ⬜ | Medium |
| T-306 | 프로필 이미지(avatar_url) 표시 | — | ⬜ | Low |
| T-307 | 다크 모드 지원 | — | ⬜ | Low |

---

## 완료 기준 체크리스트 (v2.0 릴리즈)

- [x] Phase 0 전체 완료
- [x] Phase 1 T-101 ~ T-111 전체 완료
- [x] Phase 2 T-201 ~ T-218 전체 완료
- [x] Google OAuth 로그인 동작 확인
- [x] GitHub OAuth 로그인 동작 확인
- [x] 이메일 회원가입/로그인 동작 확인
- [x] 카드 추가/삭제/이동 Supabase DB 반영 확인
- [x] RLS 정책 — 사용자별 데이터 격리 확인
- [x] GitHub Pages 배포 완료 (https://kangsoo-lee2.github.io/kanban/)
- [x] 버그 B-001 ~ B-003 수정 완료
