-- ================================================================
-- Kanban Board v3.0 Migration FIX
-- 기존 migration_v3.sql 실행 후 이것을 추가 실행하세요
-- ================================================================

-- board_members 재귀 RLS 교체 (자기 자신 참조 → 무한루프 발생)
DROP POLICY IF EXISTS "bm_select_same_board" ON public.board_members;

-- 단순 정책: 본인 멤버십만 조회
CREATE POLICY "bm_select_own" ON public.board_members
  FOR SELECT USING (auth.uid() = user_id);
