# CONTRIBUTING — 콜라보레이션 가이드

> 프로젝트: Kanban Board  
> 작성일: 2026-05-20  
> 버전: 2.0.0

---

## 1. 시작하기

### 1.1 배포 URL

**https://kangsoo-lee2.github.io/kanban/**

별도 서버 없이 위 URL에서 바로 사용 가능합니다.

### 1.2 로컬 개발 실행

```bash
cd src/exercise/kangsoo.lee/day03/kanban
python3 -m http.server 8765
```

브라우저에서 `http://localhost:8765` 접속.  
WSL 환경: Windows 브라우저에서도 동일 URL 동작.

> **주의**: 로컬 실행 시 Supabase OAuth redirect가 `localhost:8765`로 돌아와야 합니다.  
> Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs에  
> `http://localhost:8765/` 를 추가하세요.

### 1.3 파일 구조

```
kanban/
├── index.html       ← HTML 골격 (인증 화면 + 보드)
├── style.css        ← 모든 스타일 (인증 + 보드)
├── app.js           ← Supabase 연동 로직 (Auth + DB + 드래그앤드롭)
├── test.html        ← Supabase 연결 진단 페이지
├── PLAN.md          ← 개발 계획
├── PRD.md           ← 제품 요구사항 정의서
├── TRD.md           ← 기술 요구사항 + 흐름도 + ERD
├── DATABASE.md      ← DB 설계 + DDL + RLS 정책
├── USERFLOW.md      ← 사용자 흐름도
├── DESIGN_SYSTEM.md ← 디자인 시스템
├── TASKS.md         ← 작업 목록 + 버그 이력
├── CONVENTION.md    ← 코딩 컨벤션
└── CONTRIBUTING.md  ← 이 파일
```

---

## 2. Supabase 설정

### 2.1 cards 테이블 생성

Supabase 대시보드 → **SQL Editor** → 실행:

```sql
CREATE TABLE public.cards (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  col        TEXT        NOT NULL CHECK (col IN ('todo', 'inprogress', 'done')),
  text       TEXT        NOT NULL,
  position   INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select_own" ON public.cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cards_insert_own" ON public.cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cards_update_own" ON public.cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cards_delete_own" ON public.cards FOR DELETE USING (auth.uid() = user_id);
```

### 2.2 OAuth Provider 활성화

| Provider | 설정 위치 | 필요 정보 |
|----------|-----------|-----------|
| Email | Authentication → Providers → Email | 기본 활성화, "Confirm email" 설정 확인 |
| Google | Authentication → Providers → Google | Client ID, Client Secret |
| GitHub | Authentication → Providers → GitHub | Client ID, Client Secret |

### 2.3 Redirect URL 등록

Authentication → URL Configuration → Redirect URLs:

```
https://kangsoo-lee2.github.io/kanban/
http://localhost:8765/
```

---

## 3. 브랜치 전략

이 저장소는 **공유 모노레포**입니다.

### 3.1 브랜치 네이밍

```
feat/kangsoo.lee/day03-<feature-name>
fix/kangsoo.lee/day03-<bug-name>
docs/kangsoo.lee/day03-<doc-name>
```

### 3.2 금지 사항

| 행동 | 이유 |
|------|------|
| `git rebase` | 다른 참가자의 커밋 해시 파괴 |
| `git push --force` | 원격 히스토리 훼손 |
| `git pull --rebase` | 저장소 정책 위반 |
| `git add -A` | 타 참가자 파일 실수 포함 가능 |

### 3.3 올바른 동기화

```bash
git pull --no-rebase origin main
git add src/exercise/kangsoo.lee/day03/kanban/
```

---

## 4. 배포 방법

### 4.1 kangsoo-lee2/kanban 저장소에 배포

```bash
# 파일을 배포 저장소에 복사
cp -r src/exercise/kangsoo.lee/day03/kanban/* /tmp/kanban-deploy/

cd /tmp/kanban-deploy
git add .
git commit -m "feat: ..."
git push origin main
```

GitHub Pages가 `main` 브랜치 루트를 자동으로 빌드·배포합니다.

### 4.2 배포 확인

```bash
curl -s -o /dev/null -w "%{http_code}" https://kangsoo-lee2.github.io/kanban/
# 200 이면 배포 성공
```

---

## 5. 테스트

### 5.1 진단 페이지

https://kangsoo-lee2.github.io/kanban/test.html 에서 Supabase 연결 상태를 확인할 수 있습니다.

- SDK 로드 확인
- 이메일 로그인 테스트
- 세션 확인
- cards 테이블 SELECT/INSERT 테스트

### 5.2 기능 테스트 체크리스트

```
□ Google OAuth 로그인 → 보드 화면 전환
□ GitHub OAuth 로그인 → 보드 화면 전환
□ 이메일 회원가입 → 로그인
□ 이메일 로그인 → 보드 화면 전환
□ 카드 추가 → Supabase DB 반영 확인
□ 카드 삭제 → DB에서 제거 확인
□ 카드 드래그앤드롭 → col 업데이트 확인
□ 다른 기기에서 접속 → 동일 카드 표시 (다기기 동기화)
□ 로그아웃 → 로그인 화면 복귀
□ 새로고침 → 세션 자동 복원
```

### 5.3 보안 테스트

```
□ 카드 텍스트: <script>alert(1)</script> → 실행 안 됨
□ 타인 user_id로 카드 조회 시도 → RLS 차단 확인
```

---

## 6. 알려진 버그 및 해결 이력

| 버그 | 원인 | 해결책 |
|------|------|--------|
| 이메일 회원가입 후 TypeError | `signUp` 후 `data.user` null | `data.session` 존재 여부로 분기 |
| 로그인 후 보드 화면 전환 안 됨 | CSS `display:flex`가 `hidden` 속성 덮어씀 | `style.display = 'none'` 인라인 스타일 사용 |
| 로그인 후 "로그인 중..." 멈춤 | `await loadCards()`로 화면 전환 지연 | `onAuthStateChange`로 처리 일원화 |

---

## 7. FAQ

**Q. 로그인은 되는데 보드 화면이 안 나와요.**  
A. CSS `display` 우선순위 버그가 수정됐습니다. Ctrl+Shift+R 하드 리프레시 후 재시도하세요.

**Q. 이메일 확인 메일이 안 와요.**  
A. Supabase 대시보드 → Authentication → Providers → Email → "Confirm email" 을 OFF로 설정하면 이메일 확인 없이 즉시 로그인됩니다.

**Q. 카드가 저장이 안 돼요.**  
A. https://kangsoo-lee2.github.io/kanban/test.html 진단 페이지에서 cards INSERT 테스트를 실행해 에러를 확인하세요. RLS 정책이 적용됐는지 확인하세요.

**Q. 다른 참가자 폴더의 충돌이 발생했습니다.**  
A. 정상입니다. `git pull --no-rebase` 중 발생하는 타 참가자 파일 머지는 그대로 수락하세요.
