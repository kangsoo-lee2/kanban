# 칸반 보드

> **배포 URL: https://kangsoo-lee2.github.io/kanban/**

드래그앤드롭으로 작업을 관리하는 칸반 보드 웹 앱.  
Supabase 인증(Google / GitHub / 이메일)과 PostgreSQL 데이터베이스를 사용합니다.

## 주요 기능

- **Google OAuth 로그인**
- **GitHub OAuth 로그인**  
- **이메일/비밀번호 회원가입 · 로그인**
- 드래그앤드롭 카드 이동 (To-Do → In-Progress → Done)
- 카드 추가 / 삭제
- Supabase DB에 사용자별 데이터 저장 (RLS 적용)

## 기술 스택

- HTML5 / CSS3 / Vanilla JS
- [Supabase](https://supabase.com) — Auth + PostgreSQL
- GitHub Pages — 정적 배포

## Supabase 설정

1. Supabase 대시보드에서 `cards` 테이블 생성 (DATABASE.md 참조)
2. RLS 정책 적용 (DATABASE.md의 DDL 실행)
3. Authentication → Providers에서 Google, GitHub 활성화
4. Redirect URL에 `https://kangsoo-lee2.github.io/kanban/` 등록

## 설계 문서

- [PRD.md](PRD.md) — 제품 요구사항
- [TRD.md](TRD.md) — 기술 요구사항
- [DATABASE.md](DATABASE.md) — DB 설계 + DDL + RLS
- [USERFLOW.md](USERFLOW.md) — 사용자 흐름도
- [PLAN.md](PLAN.md) — 개발 계획
