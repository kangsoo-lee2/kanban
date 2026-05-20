# 칸반 보드 개발 계획

## 목표

드래그앤드롭이 가능한 칸반 보드 웹 앱을 GitHub Pages에 배포하고, Supabase 인증(Google/GitHub/이메일)과 PostgreSQL 기반 데이터 저장을 구현한다.

---

## 구현 범위

### 칼럼 구성
- **To-Do** — 예정된 작업
- **In-Progress** — 진행 중인 작업
- **Done** — 완료된 작업

### 핵심 기능
1. **인증** — Google OAuth, GitHub OAuth, 이메일/비밀번호 (Supabase Auth)
2. **세션 관리** — 페이지 로드 시 자동 세션 복원
3. **카드 추가** — DB 저장 (Supabase `cards` 테이블)
4. **카드 삭제** — DB 삭제
5. **드래그앤드롭** — DB col 업데이트
6. **카드 개수 배지** — 칼럼 헤더 표시
7. **배포** — GitHub Pages (https://sarangks2-commits.github.io/kanban/)

### UI / UX
- 로그인 화면 — Google/GitHub 버튼 + 이메일 폼
- 헤더 — 사용자 아바타 + 이메일 + 로그아웃 버튼
- 반응형 레이아웃 (모바일 지원)

---

## 파일 구조

```
kanban/
├── PLAN.md        ← 이 파일
├── PRD.md         ← 제품 요구사항
├── TRD.md         ← 기술 요구사항
├── DATABASE.md    ← DB 설계 + DDL + RLS
├── USERFLOW.md    ← 사용자 흐름도
├── DESIGN_SYSTEM.md
├── CONVENTION.md
├── CONTRIBUTING.md
├── TASKS.md
├── index.html     ← HTML (인증 화면 + 보드)
├── style.css      ← 스타일
└── app.js         ← Supabase 연동 로직
```

---

## 구현 단계

| 단계 | 작업 | 상태 |
|------|------|------|
| 1 | PLAN.md 초안 | ✅ |
| 2 | HTML 기본 구조 (3칼럼 레이아웃) | ✅ |
| 3 | CSS 스타일링 | ✅ |
| 4 | 카드 추가/삭제 JS (localStorage) | ✅ |
| 5 | HTML5 드래그앤드롭 | ✅ |
| 6 | 로컬스토리지 저장/불러오기 | ✅ |
| 7 | **Supabase 프로젝트 연결** | ✅ |
| 8 | **Supabase Auth — Google OAuth** | ✅ |
| 9 | **Supabase Auth — GitHub OAuth** | ✅ |
| 10 | **Supabase Auth — 이메일/비밀번호** | ✅ |
| 11 | **Supabase DB — cards 테이블 CRUD** | ✅ |
| 12 | **RLS 정책 적용** | ✅ |
| 13 | **GitHub Pages 배포** | ✅ |
| 14 | **설계 문서 v2.0 업데이트** | ✅ |

---

## 기술 스택

- **HTML5 / CSS3 / Vanilla JS** — 빌드 도구 없음
- **Supabase Auth** — Google, GitHub, Email OAuth
- **Supabase PostgreSQL** — cards 테이블 + RLS
- **@supabase/supabase-js v2** — CDN (jsDelivr)
- **GitHub Pages** — 정적 배포

---

## 배포 정보

| 항목 | 값 |
|------|-----|
| 배포 URL | https://sarangks2-commits.github.io/kanban/ |
| 저장소 | https://github.com/sarangks2-commits/kanban |
| 브랜치 | main |
| Supabase URL | https://tfakzxaygrvvzmtgqwhr.supabase.co |
