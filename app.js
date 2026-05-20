/* ── Supabase 초기화 ── */
const SUPABASE_URL = 'https://tfakzxaygrvvzmtgqwhr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_dKRm1KtOMAV9Ow3VGI4QDQ_N87ile5h';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COLS = ['todo', 'inprogress', 'done'];
let currentUser = null;

/* ── 에러 메시지 한국어 변환 ── */
function toKoreanError(msg) {
  if (!msg) return '알 수 없는 오류가 발생했습니다.';
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (msg.includes('Email not confirmed')) return '이메일 확인이 필요합니다. 받은편지함(스팸 포함)을 확인해 주세요.';
  if (msg.includes('User already registered')) return '이미 가입된 이메일입니다. 로그인을 시도해 주세요.';
  if (msg.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다.';
  if (msg.includes('Unable to validate email')) return '유효하지 않은 이메일 주소입니다.';
  if (msg.includes('signup is disabled')) return '이메일 회원가입이 비활성화되어 있습니다.';
  if (msg.includes('provider is not enabled')) return '해당 로그인 방법이 Supabase에서 활성화되지 않았습니다.';
  return msg;
}

/* ── 화면 전환 ── */
function showBoard() {
  document.getElementById('auth-section').hidden = true;
  document.getElementById('board-section').hidden = false;
}

function showAuth() {
  document.getElementById('auth-section').hidden = false;
  document.getElementById('board-section').hidden = true;
}

function showMessage(msg, isError = false) {
  const el = document.getElementById('auth-message');
  el.textContent = msg;
  el.className = 'auth-message ' + (isError ? 'error' : 'success');
  el.hidden = false;
}

/* ── 사용자 UI 업데이트 ── */
function updateUserUI(user) {
  if (!user) return;
  const email = user.email || user.user_metadata?.full_name || user.user_metadata?.email || '사용자';
  document.getElementById('user-email').textContent = email;
  const initial = (email || '?').charAt(0).toUpperCase();
  const avatar = document.getElementById('user-avatar');
  avatar.textContent = initial;
}

/* ── OAuth 로그인 ── */
async function signInWithGoogle() {
  showMessage('Google 로그인 페이지로 이동 중...', false);
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) showMessage(toKoreanError(error.message), true);
}

async function signInWithGitHub() {
  showMessage('GitHub 로그인 페이지로 이동 중...', false);
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) showMessage(toKoreanError(error.message), true);
}

/* ── 이메일 로그인 ── */
async function handleEmailLogin() {
  const email = document.getElementById('email-input').value.trim();
  const password = document.getElementById('password-input').value;
  if (!email || !password) { showMessage('이메일과 비밀번호를 입력하세요.', true); return; }

  showMessage('로그인 중...', false);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { showMessage(toKoreanError(error.message), true); return; }

  currentUser = data.user;
  updateUserUI(currentUser);
  showBoard();
  await loadCards();
}

/* ── 이메일 회원가입 ── */
async function handleEmailSignup() {
  const email = document.getElementById('email-input').value.trim();
  const password = document.getElementById('password-input').value;
  if (!email || !password) { showMessage('이메일과 비밀번호를 입력하세요.', true); return; }
  if (password.length < 6) { showMessage('비밀번호는 6자 이상이어야 합니다.', true); return; }

  showMessage('회원가입 중...', false);
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { emailRedirectTo: window.location.origin + window.location.pathname }
  });
  if (error) { showMessage(toKoreanError(error.message), true); return; }

  if (data.session && data.user) {
    /* 이메일 확인 불필요 설정인 경우 바로 로그인 */
    currentUser = data.user;
    updateUserUI(currentUser);
    showBoard();
    await loadCards();
  } else {
    showMessage('확인 이메일을 발송했습니다. 받은편지함(스팸 포함)을 확인해 주세요.', false);
  }
}

/* ── 로그아웃 ── */
async function signOut() {
  await sb.auth.signOut();
  currentUser = null;
  showAuth();
}

/* ── 세션 감지 ── */
sb.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    updateUserUI(currentUser);
    showBoard();
    await loadCards();
  } else {
    currentUser = null;
    showAuth();
  }
});

/* ── DB: 카드 로드 ── */
async function loadCards() {
  if (!currentUser) return;
  const { data, error } = await sb
    .from('cards')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('position', { ascending: true });

  if (error) { console.error('카드 로드 실패:', error.message); return; }

  const state = { todo: [], inprogress: [], done: [] };
  (data || []).forEach(row => {
    if (state[row.col] !== undefined) {
      state[row.col].push({ id: row.id, text: row.text });
    }
  });
  render(state);
}

/* ── DB: 카드 추가 ── */
async function addCard(col) {
  const input = document.getElementById('input-' + col);
  const text = input.value.trim();
  if (!text || !currentUser) return;

  const { data: existing } = await sb
    .from('cards')
    .select('position')
    .eq('user_id', currentUser.id)
    .eq('col', col)
    .order('position', { ascending: false })
    .limit(1);

  const nextPos = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await sb.from('cards').insert({
    user_id: currentUser.id, col, text, position: nextPos
  });
  if (error) { console.error('카드 추가 실패:', error.message); return; }
  input.value = '';
  await loadCards();
}

/* ── DB: 카드 삭제 ── */
async function deleteCard(id) {
  const { error } = await sb.from('cards').delete().eq('id', id);
  if (error) { console.error('카드 삭제 실패:', error.message); return; }
  await loadCards();
}

/* ── DB: 카드 이동 ── */
async function moveCard(id, destCol) {
  const { data: existing } = await sb
    .from('cards')
    .select('position')
    .eq('user_id', currentUser.id)
    .eq('col', destCol)
    .order('position', { ascending: false })
    .limit(1);

  const nextPos = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await sb.from('cards').update({ col: destCol, position: nextPos }).eq('id', id);
  if (error) { console.error('카드 이동 실패:', error.message); return; }
  await loadCards();
}

/* ── 렌더링 ── */
function render(state) {
  COLS.forEach(col => {
    const list = document.getElementById('list-' + col);
    list.innerHTML = '';
    (state[col] || []).forEach(card => {
      list.appendChild(createCard(card.text, col, card.id));
    });
    document.getElementById('badge-' + col).textContent = (state[col] || []).length;
  });
}

function createCard(text, col, id) {
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.dataset.id = id;
  card.dataset.col = col;

  const span = document.createElement('span');
  span.className = 'card-text';
  span.textContent = text;

  const btn = document.createElement('button');
  btn.className = 'card-delete';
  btn.textContent = '✕';
  btn.title = '삭제';
  btn.onclick = (e) => { e.stopPropagation(); deleteCard(id); };

  card.appendChild(span);
  card.appendChild(btn);

  card.addEventListener('dragstart', (e) => {
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, col }));
  });
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    document.querySelectorAll('.card-list').forEach(l => l.classList.remove('drag-over'));
  });

  return card;
}

/* ── 드롭 영역 이벤트 ── */
COLS.forEach(col => {
  const list = document.getElementById('list-' + col);

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    list.classList.add('drag-over');
  });
  list.addEventListener('dragleave', (e) => {
    if (!list.contains(e.relatedTarget)) list.classList.remove('drag-over');
  });
  list.addEventListener('drop', async (e) => {
    e.preventDefault();
    list.classList.remove('drag-over');
    let src;
    try { src = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
    const { id, col: srcCol } = src;
    if (srcCol === col) return;
    await moveCard(id, col);
  });
});

/* ── Enter 키로 카드 추가 ── */
COLS.forEach(col => {
  const input = document.getElementById('input-' + col);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCard(col); }
    });
  }
});
