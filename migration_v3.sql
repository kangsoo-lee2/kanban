-- ================================================================
-- Kanban Board v3.0 Migration
-- 실행 위치: Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. boards 테이블
CREATE TABLE IF NOT EXISTS public.boards (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT '내 보드',
  invite_code TEXT        NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boards_select_member" ON public.boards FOR SELECT USING (
  auth.uid() = owner_id
  OR EXISTS (SELECT 1 FROM public.board_members WHERE board_id = boards.id AND user_id = auth.uid())
);
CREATE POLICY "boards_insert_own"  ON public.boards FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "boards_update_own"  ON public.boards FOR UPDATE  USING (auth.uid() = owner_id);
CREATE POLICY "boards_delete_own"  ON public.boards FOR DELETE  USING (auth.uid() = owner_id);

-- 2. board_members 테이블
CREATE TABLE IF NOT EXISTS public.board_members (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id  UUID        NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  email     TEXT,
  role      TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (board_id, user_id)
);

ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bm_select_same_board" ON public.board_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.board_members bm2
          WHERE bm2.board_id = board_members.board_id AND bm2.user_id = auth.uid())
);
CREATE POLICY "bm_insert_self"  ON public.board_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bm_delete_owner" ON public.board_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.boards WHERE id = board_members.board_id AND owner_id = auth.uid())
);

-- 3. activity_log 테이블
CREATE TABLE IF NOT EXISTS public.activity_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id   UUID        NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action     TEXT        NOT NULL,
  payload    JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "log_select_member" ON public.activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.board_members WHERE board_id = activity_log.board_id AND user_id = auth.uid())
);
CREATE POLICY "log_insert_member" ON public.activity_log FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.board_members WHERE board_id = activity_log.board_id AND user_id = auth.uid())
);

-- 4. cards 테이블 컬럼 추가
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS board_id  UUID  REFERENCES public.boards(id) ON DELETE CASCADE;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS priority  TEXT  CHECK (priority IN ('high','medium','low'));
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS due_date  DATE;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS tags      TEXT[] DEFAULT '{}';

-- 5. cards RLS 교체 (공유 보드 멤버도 접근 가능)
DROP POLICY IF EXISTS "cards_select_own"    ON public.cards;
DROP POLICY IF EXISTS "cards_insert_own"    ON public.cards;
DROP POLICY IF EXISTS "cards_update_own"    ON public.cards;
DROP POLICY IF EXISTS "cards_delete_own"    ON public.cards;
DROP POLICY IF EXISTS "user_own_cards"      ON public.cards;
DROP POLICY IF EXISTS "cards_select_member" ON public.cards;
DROP POLICY IF EXISTS "cards_insert_member" ON public.cards;
DROP POLICY IF EXISTS "cards_update_member" ON public.cards;
DROP POLICY IF EXISTS "cards_delete_member" ON public.cards;

CREATE POLICY "cards_select_member" ON public.cards FOR SELECT USING (
  (board_id IS NULL AND auth.uid() = user_id)
  OR EXISTS (SELECT 1 FROM public.board_members WHERE board_id = cards.board_id AND user_id = auth.uid())
);
CREATE POLICY "cards_insert_member" ON public.cards FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM public.board_members WHERE board_id = cards.board_id AND user_id = auth.uid())
);
CREATE POLICY "cards_update_member" ON public.cards FOR UPDATE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.board_members WHERE board_id = cards.board_id AND user_id = auth.uid())
);
CREATE POLICY "cards_delete_member" ON public.cards FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.board_members WHERE board_id = cards.board_id AND user_id = auth.uid())
);

-- 6. RPC: 초대 코드로 보드 조회 (SECURITY DEFINER — RLS 우회)
CREATE OR REPLACE FUNCTION public.get_board_by_invite(code TEXT)
RETURNS TABLE(board_id UUID, board_name TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name FROM public.boards WHERE invite_code = upper(trim(code)) LIMIT 1;
$$;

-- 7. 인덱스
CREATE INDEX IF NOT EXISTS idx_boards_invite     ON public.boards(invite_code);
CREATE INDEX IF NOT EXISTS idx_bm_board_user     ON public.board_members(board_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bm_user           ON public.board_members(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_board_col   ON public.cards(board_id, col, position);
CREATE INDEX IF NOT EXISTS idx_log_board_created ON public.activity_log(board_id, created_at DESC);
