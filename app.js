/* ── Supabase 초기화 ── */
const SUPABASE_URL = 'https://tfakzxaygrvvzmtgqwhr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dKRm1KtOMAV9Ow3VGI4QDQ_N87ile5h';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── 전역 상태 ── */
const COLS = ['todo', 'inprogress', 'done'];
let currentUser       = null;
let currentBoardId    = null;
let cardModalId       = null;
let activityPanelOpen = false;

/* ── 에러 메시지 한국어 변환 ── */
function toKoreanError(msg) {
  if (!msg) return '알 수 없는 오류';
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (msg.includes('Email not confirmed'))        return '이메일 확인이 필요합니다.';
  if (msg.includes('User already registered'))    return '이미 가입된 이메일입니다. 로그인을 시도해 주세요.';
  if (msg.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다.';
  if (msg.includes('provider is not enabled'))    return '해당 로그인 방법이 활성화되지 않았습니다.';
  return msg;
}

/* ── 화면 전환 ── */
function showBoard() {
  document.getElementById('auth-section').style.display  = 'none';
  document.getElementById('board-section').style.display = 'block';
}
function showAuth() {
  document.getElementById('auth-section').style.display  = 'flex';
  document.getElementById('board-section').style.display = 'none';
  /* 활동 패널도 닫기 */
  if (activityPanelOpen) {
    activityPanelOpen = false;
    document.getElementById('activity-panel').classList.remove('open');
    document.getElementById('panel-overlay').classList.remove('show');
  }
}
function showMessage(msg, isError = false) {
  const el = document.getElementById('auth-message');
  el.textContent = msg;
  el.className = 'auth-message ' + (isError ? 'error' : 'success');
  el.style.display = 'block';
}

/* ── 사용자 UI ── */
function updateUserUI(user) {
  if (!user) return;
  const email = user.email || user.user_metadata?.full_name || '사용자';
  document.getElementById('user-email').textContent = email;
  document.getElementById('user-avatar').textContent = email.charAt(0).toUpperCase();
}

/* ── 인증 ── */
async function signInWithGoogle() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: location.origin + location.pathname }
  });
  if (error) showMessage(toKoreanError(error.message), true);
}
async function signInWithGitHub() {
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: location.origin + location.pathname }
  });
  if (error) showMessage(toKoreanError(error.message), true);
}
async function handleEmailLogin() {
  const email    = document.getElementById('email-input').value.trim();
  const password = document.getElementById('password-input').value;
  if (!email || !password) { showMessage('이메일과 비밀번호를 입력하세요.', true); return; }
  showMessage('로그인 중...', false);
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) showMessage(toKoreanError(error.message), true);
}
async function handleEmailSignup() {
  const email    = document.getElementById('email-input').value.trim();
  const password = document.getElementById('password-input').value;
  if (!email || !password) { showMessage('이메일과 비밀번호를 입력하세요.', true); return; }
  if (password.length < 6) { showMessage('비밀번호는 6자 이상이어야 합니다.', true); return; }
  showMessage('회원가입 중...', false);
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { emailRedirectTo: location.origin + location.pathname }
  });
  if (error) { showMessage(toKoreanError(error.message), true); return; }
  if (!data.session) showMessage('확인 이메일을 발송했습니다. 받은편지함을 확인해 주세요.', false);
}
async function signOut() {
  await sb.auth.signOut();
  currentUser    = null;
  currentBoardId = null;
  cardModalId    = null;
  closeCardModal();
  closeShareModal();
  closeNewBoardModal();
  showAuth();
}

/* ── 세션 감지 ── */
sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    updateUserUI(currentUser);
    showBoard();
    await initUserBoard();
  } else {
    currentUser    = null;
    currentBoardId = null;
    showAuth();
  }
});

/* ══════════════════════════════════════
   보드 관리
══════════════════════════════════════ */

async function initUserBoard() {
  document.getElementById('current-board-name').textContent = '보드 로딩 중...';

  /* board_members 테이블이 존재하는지 먼저 확인 */
  const { error: tblErr } = await sb.from('board_members').select('id').limit(1);
  if (tblErr && tblErr.code === '42P01') {
    /* 테이블 없음 — migration 미실행 → 기존 cards만 사용 */
    console.warn('board_members 테이블 없음. migration_v3.sql 실행 필요.');
    document.getElementById('current-board-name').textContent = '내 보드';
    currentBoardId = '__legacy__';
    loadCardsLegacy();
    return;
  }

  const boards = await fetchMyBoards();
  if (boards.length === 0) {
    await createDefaultBoard();
  } else {
    await switchBoard(boards[0].id);
    renderBoardPicker();
  }
}

/* migration 전 레거시 모드 — board_id IS NULL 카드만 사용 */
async function loadCardsLegacy() {
  const { data, error } = await sb.from('cards')
    .select('id, col, text, position, priority, due_date, tags')
    .eq('user_id', currentUser.id)
    .is('board_id', null)
    .order('position', { ascending: true });
  if (error) { console.error('카드 로드 실패:', error.message); return; }
  const state = { todo: [], inprogress: [], done: [] };
  (data || []).forEach(row => { if (state[row.col]) state[row.col].push(row); });
  render(state);
}

async function fetchMyBoards() {
  /* board_members에서 본인 rows 가져오고, boards join */
  const { data, error } = await sb
    .from('board_members')
    .select('board_id, role, boards(id, name, invite_code)')
    .eq('user_id', currentUser.id)
    .order('joined_at', { ascending: true });
  if (error) {
    console.error('보드 목록 조회 실패:', error.message);
    return [];
  }
  return (data || []).map(r => r.boards).filter(Boolean);
}

async function createDefaultBoard() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data: board, error } = await sb.from('boards').insert({
    owner_id: currentUser.id,
    name: '내 보드',
    invite_code: code
  }).select().single();
  if (error) { console.error('기본 보드 생성 실패:', error.message); return; }

  await sb.from('board_members').insert({
    board_id: board.id,
    user_id:  currentUser.id,
    email:    currentUser.email,
    role:     'owner'
  });

  /* 기존 board_id 없는 카드를 새 보드로 마이그레이션 */
  await sb.from('cards')
    .update({ board_id: board.id })
    .eq('user_id', currentUser.id)
    .is('board_id', null);

  await switchBoard(board.id);
  renderBoardPicker();
}

async function switchBoard(boardId) {
  currentBoardId = boardId;
  const { data: board } = await sb.from('boards').select('name').eq('id', boardId).single();
  document.getElementById('current-board-name').textContent = board?.name ?? '보드';
  closeBoardDropdown();
  loadCards();
  if (activityPanelOpen) loadActivityLog();
}

/* ── 보드 피커 ── */
function toggleBoardDropdown() {
  const dd = document.getElementById('board-dropdown');
  if (dd.style.display === 'none') {
    renderBoardPicker();
    dd.style.display = 'block';
    setTimeout(() => document.addEventListener('click', closeBoardDropdownOutside, { once: true }), 0);
  } else {
    closeBoardDropdown();
  }
}
function closeBoardDropdown() {
  document.getElementById('board-dropdown').style.display = 'none';
}
function closeBoardDropdownOutside(e) {
  if (!document.getElementById('board-picker').contains(e.target)) closeBoardDropdown();
}
async function renderBoardPicker() {
  const boards = await fetchMyBoards();
  const list = document.getElementById('board-list');
  list.innerHTML = '';
  boards.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'board-dropdown-item' + (b.id === currentBoardId ? ' active' : '');
    btn.textContent = b.name;
    btn.onclick = () => switchBoard(b.id);
    list.appendChild(btn);
  });
}
function openNewBoardModal() {
  closeBoardDropdown();
  document.getElementById('new-board-name').value = '';
  document.getElementById('new-board-modal-backdrop').style.display = 'flex';
}
function closeNewBoardModal() {
  document.getElementById('new-board-modal-backdrop').style.display = 'none';
}
async function createBoard() {
  const name = document.getElementById('new-board-name').value.trim();
  if (!name) return;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const { data: board, error } = await sb.from('boards').insert({
    owner_id: currentUser.id, name, invite_code: code
  }).select().single();
  if (error) { alert('보드 생성 실패: ' + error.message); return; }
  await sb.from('board_members').insert({
    board_id: board.id, user_id: currentUser.id,
    email: currentUser.email, role: 'owner'
  });
  closeNewBoardModal();
  await switchBoard(board.id);
  renderBoardPicker();
}

/* ══════════════════════════════════════
   공유 모달
══════════════════════════════════════ */
async function openShareModal() {
  if (!currentBoardId) return;
  document.getElementById('share-modal-backdrop').style.display = 'flex';
  document.getElementById('join-message').textContent = '';
  document.getElementById('join-code-input').value = '';

  const { data: board } = await sb.from('boards').select('invite_code').eq('id', currentBoardId).single();
  if (board) document.getElementById('invite-code-display').textContent = board.invite_code;
  await renderMemberList();
}
function closeShareModal() {
  document.getElementById('share-modal-backdrop').style.display = 'none';
}
function copyInviteCode() {
  const code = document.getElementById('invite-code-display').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = '복사됨!';
    setTimeout(() => btn.textContent = '복사', 1500);
  });
}
async function joinBoard() {
  const code  = document.getElementById('join-code-input').value.trim().toUpperCase();
  const msgEl = document.getElementById('join-message');
  if (!code || code.length !== 6) {
    msgEl.style.color = '#e74c3c'; msgEl.textContent = '6자리 코드를 입력하세요.'; return;
  }
  const { data, error } = await sb.rpc('get_board_by_invite', { code });
  if (error || !data || data.length === 0) {
    msgEl.style.color = '#e74c3c'; msgEl.textContent = '유효하지 않은 코드입니다.'; return;
  }
  const boardId = data[0].board_id;
  if (boardId === currentBoardId) {
    msgEl.style.color = '#888'; msgEl.textContent = '이미 참가한 보드입니다.'; return;
  }
  const { error: joinErr } = await sb.from('board_members').insert({
    board_id: boardId, user_id: currentUser.id,
    email: currentUser.email, role: 'member'
  });
  if (joinErr && !joinErr.message.includes('duplicate')) {
    msgEl.style.color = '#e74c3c'; msgEl.textContent = '참가 실패: ' + joinErr.message; return;
  }
  msgEl.style.color = '#27ae60'; msgEl.textContent = '보드에 참가했습니다!';
  await switchBoard(boardId);
  renderBoardPicker();
  setTimeout(closeShareModal, 1000);
}
async function renderMemberList() {
  const { data } = await sb.from('board_members')
    .select('email, role, joined_at').eq('board_id', currentBoardId);
  const ul = document.getElementById('member-list');
  ul.innerHTML = '';
  (data || []).forEach(m => {
    const li = document.createElement('li');
    li.className = 'member-item';
    li.innerHTML = `
      <div class="member-avatar">${(m.email || '?').charAt(0).toUpperCase()}</div>
      <div class="member-info">
        <span class="member-email">${m.email || '(이메일 없음)'}</span>
        <span class="member-role ${m.role}">${m.role === 'owner' ? '소유자' : '멤버'}</span>
      </div>`;
    ul.appendChild(li);
  });
}

/* ══════════════════════════════════════
   활동 로그 패널
══════════════════════════════════════ */
function toggleActivityPanel() {
  activityPanelOpen = !activityPanelOpen;
  document.getElementById('activity-panel').classList.toggle('open', activityPanelOpen);
  document.getElementById('panel-overlay').classList.toggle('show', activityPanelOpen);
  if (activityPanelOpen) loadActivityLog();
}
async function loadActivityLog() {
  if (!currentBoardId) return;
  const { data } = await sb.from('activity_log')
    .select('*').eq('board_id', currentBoardId)
    .order('created_at', { ascending: false }).limit(50);
  const list = document.getElementById('activity-list');
  if (!data || data.length === 0) {
    list.innerHTML = '<p class="activity-empty">활동 내역이 없습니다.</p>'; return;
  }
  list.innerHTML = data.map(log => {
    const p     = log.payload || {};
    const email = p.user_email || '알 수 없음';
    const time  = new Date(log.created_at).toLocaleString('ko-KR', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return `<div class="activity-item">
      <div class="activity-avatar">${email.charAt(0).toUpperCase()}</div>
      <div class="activity-info">
        <span class="activity-desc">${actionLabel(log.action, p)}</span>
        <span class="activity-meta">${email.split('@')[0]} · ${time}</span>
      </div>
    </div>`;
  }).join('');
}
function actionLabel(action, p) {
  const COL = { todo: 'To-Do', inprogress: 'In-Progress', done: 'Done' };
  switch (action) {
    case 'card_add':    return `카드 추가: <b>${p.text || ''}</b> → ${COL[p.col] || p.col}`;
    case 'card_delete': return `카드 삭제: <b>${p.text || ''}</b>`;
    case 'card_move':   return `카드 이동: <b>${p.text || ''}</b> ${COL[p.from_col] || ''} → ${COL[p.to_col] || ''}`;
    case 'card_edit':   return `카드 수정: <b>${p.text || ''}</b>`;
    default:            return action;
  }
}
async function logActivity(action, payload) {
  if (!currentBoardId || !currentUser) return;
  await sb.from('activity_log').insert({
    board_id: currentBoardId,
    user_id:  currentUser.id,
    action,
    payload:  { ...payload, user_email: currentUser.email }
  });
  if (activityPanelOpen) loadActivityLog();
}

/* ══════════════════════════════════════
   카드 CRUD
══════════════════════════════════════ */
async function loadCards() {
  if (!currentUser || !currentBoardId) return;
  const { data, error } = await sb.from('cards')
    .select('id, col, text, position, priority, due_date, tags')
    .eq('board_id', currentBoardId)
    .order('position', { ascending: true });
  if (error) { console.error('카드 로드 실패:', error.message); return; }
  const state = { todo: [], inprogress: [], done: [] };
  (data || []).forEach(row => { if (state[row.col]) state[row.col].push(row); });
  render(state);
}

async function addCard(col) {
  const input = document.getElementById('input-' + col);
  const text  = input.value.trim();
  if (!text || !currentUser) return;

  const isLegacy = currentBoardId === '__legacy__';

  /* position 계산 */
  let posQuery = sb.from('cards').select('position').eq('col', col)
    .order('position', { ascending: false }).limit(1);
  if (isLegacy) posQuery = posQuery.eq('user_id', currentUser.id).is('board_id', null);
  else          posQuery = posQuery.eq('board_id', currentBoardId);

  const { data: existing } = await posQuery;
  const nextPos = existing?.length > 0 ? existing[0].position + 1 : 0;

  const insertObj = { user_id: currentUser.id, col, text, position: nextPos };
  if (!isLegacy) insertObj.board_id = currentBoardId;

  const { data: card, error } = await sb.from('cards').insert(insertObj).select().single();
  if (error) { console.error('카드 추가 실패:', error.message, error.hint); return; }

  input.value = '';
  if (!isLegacy) logActivity('card_add', { card_id: card.id, text, col });
  isLegacy ? loadCardsLegacy() : loadCards();
}

async function deleteCard(id, text) {
  const { error } = await sb.from('cards').delete().eq('id', id);
  if (error) { console.error('카드 삭제 실패:', error.message); return; }
  const isLegacy = currentBoardId === '__legacy__';
  if (!isLegacy) logActivity('card_delete', { card_id: id, text });
  isLegacy ? loadCardsLegacy() : loadCards();
}

async function moveCard(id, destCol, srcCol, text) {
  const isLegacy = currentBoardId === '__legacy__';
  let posQuery = sb.from('cards').select('position').eq('col', destCol)
    .order('position', { ascending: false }).limit(1);
  if (isLegacy) posQuery = posQuery.eq('user_id', currentUser.id).is('board_id', null);
  else          posQuery = posQuery.eq('board_id', currentBoardId);

  const { data: existing } = await posQuery;
  const nextPos = existing?.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await sb.from('cards').update({ col: destCol, position: nextPos }).eq('id', id);
  if (error) { console.error('카드 이동 실패:', error.message); return; }
  if (!isLegacy) logActivity('card_move', { card_id: id, text, from_col: srcCol, to_col: destCol });
  isLegacy ? loadCardsLegacy() : loadCards();
}

/* ══════════════════════════════════════
   카드 상세 모달
══════════════════════════════════════ */
async function openCardModal(cardId) {
  cardModalId = cardId;
  const { data: card, error } = await sb.from('cards')
    .select('text, priority, due_date, tags').eq('id', cardId).single();
  if (error || !card) return;
  document.getElementById('card-modal-text').value     = card.text     || '';
  document.getElementById('card-modal-priority').value = card.priority || '';
  document.getElementById('card-modal-due').value      = card.due_date || '';
  document.getElementById('card-modal-tags').value     = (card.tags || []).join(', ');
  document.getElementById('card-modal-backdrop').style.display = 'flex';
}
function closeCardModal() {
  document.getElementById('card-modal-backdrop').style.display = 'none';
  cardModalId = null;
}
async function saveCardModal() {
  if (!cardModalId) return;
  const text     = document.getElementById('card-modal-text').value.trim();
  const priority = document.getElementById('card-modal-priority').value || null;
  const due_date = document.getElementById('card-modal-due').value      || null;
  const tags     = document.getElementById('card-modal-tags').value
    .split(',').map(t => t.trim()).filter(Boolean);

  const { error } = await sb.from('cards').update({ text, priority, due_date, tags }).eq('id', cardModalId);
  if (error) { console.error('카드 수정 실패:', error.message); return; }
  logActivity('card_edit', { card_id: cardModalId, text, priority, due_date, tags });
  closeCardModal();
  loadCards();
}
async function deleteCardFromModal() {
  if (!cardModalId) return;
  const text = document.getElementById('card-modal-text').value;
  const id   = cardModalId;
  closeCardModal();
  await deleteCard(id, text);
}

/* ══════════════════════════════════════
   렌더링
══════════════════════════════════════ */
function render(state) {
  COLS.forEach(col => {
    const list = document.getElementById('list-' + col);
    list.innerHTML = '';
    (state[col] || []).forEach(card => list.appendChild(createCard(card)));
    document.getElementById('badge-' + col).textContent = (state[col] || []).length;
  });
}

function createCard(card) {
  const el = document.createElement('div');
  el.className = 'card' + (card.priority ? ' priority-' + card.priority : '');
  el.draggable = true;
  el.dataset.id  = card.id;
  el.dataset.col = card.col;

  const top = document.createElement('div');
  top.className = 'card-top';

  const span = document.createElement('span');
  span.className = 'card-text';
  span.textContent = card.text;

  const delBtn = document.createElement('button');
  delBtn.className = 'card-delete';
  delBtn.textContent = '✕';
  delBtn.title = '삭제';
  delBtn.onclick = e => { e.stopPropagation(); deleteCard(card.id, card.text); };

  top.appendChild(span);
  top.appendChild(delBtn);
  el.appendChild(top);

  /* 메타 배지 */
  const meta = document.createElement('div');
  meta.className = 'card-meta';

  if (card.priority) {
    const b = document.createElement('span');
    b.className = `meta-badge priority-badge ${card.priority}`;
    b.textContent = { high: '높음', medium: '보통', low: '낮음' }[card.priority];
    meta.appendChild(b);
  }
  if (card.due_date) {
    const b = document.createElement('span');
    const d = new Date(card.due_date + 'T00:00:00');
    const overdue = d < new Date() && card.col !== 'done';
    b.className = 'meta-badge due-badge' + (overdue ? ' overdue' : '');
    b.textContent = '📅 ' + d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    meta.appendChild(b);
  }
  (card.tags || []).forEach(tag => {
    const b = document.createElement('span');
    b.className = 'meta-badge tag-badge';
    b.textContent = tag;
    meta.appendChild(b);
  });
  if (meta.children.length > 0) el.appendChild(meta);

  el.addEventListener('click', () => openCardModal(card.id));
  el.addEventListener('dragstart', e => {
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: card.id, col: card.col, text: card.text }));
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelectorAll('.card-list').forEach(l => l.classList.remove('drag-over'));
  });
  return el;
}

/* ── 드롭 영역 ── */
COLS.forEach(col => {
  const list = document.getElementById('list-' + col);
  list.addEventListener('dragover',  e => { e.preventDefault(); list.classList.add('drag-over'); });
  list.addEventListener('dragleave', e => { if (!list.contains(e.relatedTarget)) list.classList.remove('drag-over'); });
  list.addEventListener('drop', async e => {
    e.preventDefault();
    list.classList.remove('drag-over');
    let src;
    try { src = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
    if (src.col === col) return;
    await moveCard(src.id, col, src.col, src.text);
  });
});

/* ── Enter 키 ── */
COLS.forEach(col => {
  const input = document.getElementById('input-' + col);
  if (input) input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCard(col); }
  });
});

/* ── ESC 키 ── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeCardModal();
  closeShareModal();
  closeNewBoardModal();
  if (activityPanelOpen) toggleActivityPanel();
});
