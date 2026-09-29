/* ============================================================
   FIREBASE — inicialização
   As chaves reais ficam em firebase-config.js (não versionado
   com valores sensíveis expostos publicamente é normal para
   apps web Firebase: as regras de segurança são o que protege
   os dados, não o segredo da chave).
   ============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, deleteDoc, getDoc,
  query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getStorage, ref, uploadString, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUser = null;
let canManage = false;

/* ============================================================
   FUNÇÕES E EQUIPAMENTOS PRÉ-DEFINIDOS
   ============================================================ */
const FUNCOES = {
"Pedreiro": ["CONES DE 75 CM","TRANSFORMADOR 1088","VASSOUR","COLHER DE PEDREIRO","GUARRAFA DE 5 LITROS","MARRETAS DE 1 KG","NIVEL DE M","ALAVANCA","ENXADA","DESEMPENADEIRAS M","DESEMPENADEIRAS DENTADAS","PIS DE CARPINTEIRO","MARRETA DE BORRACHA","PONTEIRA","TAIADEIRA","ESQUADRO STANLEY 1084","FURADEIRA MARTELETE 1441","EXTENS O DE 20 METROS","ARCO DE SERRA","SERRA MARMORE 1194","MASSEIRA GRANDE"],
"Instalador - Habitado": ["ALICATE BOMBA D AGUA 10MM","ALICATE DE BICO","ARCO DE SERRA","BORRIFADO SAB","BROCA SDS 6MM CURTA","BROCA SDS 8MM CURTA","BROCA SDS 10MM M DIA","BROCA SDS 25MM CURTA","BROCA SDS 25MM LONGA","CAIXA DE FERRAMENTAS","CHAVE CANH O 6MM","CHAVE CANH O 8MM","CHAVE CANH O 11MM","CHAVE DE FENDA M DIA","CHAVE FENDA PEQUENA 3/16 X1/2","CHAVE FENDA PEQUENA 3/16 X1/2","CHAVE FENDA GRANDE 1/14 X 10","ESCAREADOR DE TUBO PES 20MM / 26MM /32MM","TULA","MANDRILSDS DE ENCAIXE","MARTELO DE BORRACHA","VEL DE M","PONTEIRA SDS","TAIADEIRA SDS","CHAVE GRIFO 12MM","TRENA DE 5 METROS","CHAVE PHILLIPS M"],
"Instalador - Auto Padrão": ["TRENA DE 5 METROS","ALICATE BOMBA D AGUA 10MM","CHAVE INGLESA 12MM","CHAVBE INGLESA 8MM","ARICO VONDER","EXTENS O DE 15 METROS","ALINHADOR DE TUBOS","BROCA DE 25MM","CURVADOR DE MOLAS DE 20MM","MARTELO DE BORRACHA","CORTA TUBOS VONDER","CLIPADEIRA RIGID RP241 BA 2009459 1570","ESCARREADOR DE TUBOS 20MM/26MM/32MM","TULA","ALICATE CORTA LATA","CHAVE CANH O 8MM","BROCA CHATA DE 1","CHAVE MANDRIL","PONTEIRA SDS","TAIADEIRA SDS","SERRA COPO DE 100MM","SERRA COPO DE 30MM","CONES DE SINALIZA O DE 50CM","BROCA SDS 6MM","EXTINTOR DE 1 KILO","CHAVE DE FENDA 1/8 X5","CHAVE DE FENDA 3/16 X 5","CHAVE DE FENDA","CHAVE DE FENDA TOCO 1/8 X1.1/2","CHAVEPHILLIPS TOCO 1/8 X1.1/2","CHAVE PHILLIPS 1/8 X5","CHAVE PHILLIPS 3/16 X 5","TRANSFORMDOR DE ENERGIA FIOLUX 3.000 VA","SERRA M RMORE BOSCH 1102","ESCADA DE 5 DEGRAUS EXTENSIVA BTF","PARAFUSADEIRA BOSCH GSR 1000 SMART","FURADEIRA MARTELETE BOSH GBH-2-24D 1613","LIXEIRA DE COLETA SELETIVA","BOLSA DE LONA VERDE","CHAVE GRIFO 14MM","MANOMETRO DE 04 BAR N 66637","FURADEIRA BOSCH FURO VISOR GBS2-O2RE"],
"Gasista": ["ALICATE BOMBA D AGUA 12MM","ALICATE DE BICO","ALICATE DE PRESS","BOLSA DE FERRAMENTAS IRWIN","BOMBA DE AR","BORRIFADOR DE SAB","JOGO DE BROCAS DE CONVERS O 0.80.0.90.0.95.1.0.1.10.1.20.1.30","CABO JUMPER","CANETA DE TESTE DE TENS","MANDRIL PARA BROCA DE CONVERS","JOGO DE CHALE ALLEN","CHAVE CANH O 6MM, 8MM,10MM.11MM 1.1/4","CHAVE DE FENDA TOCO 1/8X1.1/2","CHAVE DE FENDA 3/16X5","CHAVE DE FENDA 1/8X5","CHAVE FIXA DE 6MMX7MM","CHAVE FIXA DE 8MMX9MM","CHAVE FIXA DE 10MMX11MM","CHAVE FIXA DE 12MMX13MM","CHAVE INGLESA 12MM","JOGO DE CHAVE TORKS","GRIFO 12MM","GRIFO 14MM","GRIFO 18MM","PARAFUSADEIRA BOSCH GSRSMART 1000","DETECTOR DE G S HABOTEST 1243","COLUNA D AGUA DE 500 MMCA 690-19 690-19","PLACA DE INFORMA O INFLAMAVEL","CARRINHO DE CARGA MANUAL","CONES DE 50 CENTIMETROS"],
"Soldador": ["CHAVE CATRACA","CHAVE ALLEN 19MM","CHAVE ALLEN 17MM","SOQUETE 17MM","SOQUETE 12MM","CHAVE CANH O 8MM","RASPADOR DE TUBOS","CHAVE PHILLIPS M DIA","CHAVE DE FENDA M","TESOURA CORTA TUBOS VONDER 64MM","CHAVE GRIFO 12MM","CHAVE GRIFO DE 14MM","BORRIFADOR PARA ALCOOL","BORRIFADOR PARA SAB","PROLONGADOR CHAVE CATRACA DE 25MM","TRENA DE 5 METROS","LIMA CHATA","PAQUIMETRO","ALINHADOR DE TUBOS REDU O 32MM X 20MM","CHAVE VGB","CHAVE INGLESA 12MM","MAQUINA DE SOLDA PEAD","TRENA DE 50 METROS","COMPRESSOR DE AR CHIAPERINI 724-19","ESTRANGULADOR DE TUBOS SWEESER PEAD 1718","CHAVE CANH O 8MM -10MM 12MM","ALICATE UNIVERSAL","RASPADOR DE TUBOS PEAD"],
"Soldador - Especial": ["CHAVE ALLEN LONGA DE 10MM","CHAVE ALLEN LONGA DE 12MM","CHAVE ALLEN LINGA DE 17MM","CHAVE ALLEN LONGA DE 19MM","CHAVE CANH O 8MM","CHAVE CATRACA (C) 1/2","CHAVE GRIFO 12MM","CHAVE GRIFO 14MM","METRO DE 10 BAR 965-19","CHAVE PHILLIPS 3/16X3","CHAVE CATRACA 08MM","CORTADOR DE TUBO VONDER","ESQUADRO CABO DE ALUMINIO 1429","ESTENS O DE 20 METROS","LIMA DE ENXADA","MALA DE FERRAMENTAS BRASFOR","MARRETA DE 1KILO E MEIO","COMPRESSOR AR DIRETO CHIAPERINI 1626","PAQU METRO UNIVERSAL 1430","BORRIFADOR PARA ALCOOL","BORRIFADO PARA SAB","SOQUETE 8MM","SOQUETE DE 10MM","SOQUETE DE 12MM","SOQUETE DE 17MM","SOQUETE DE 19MM","PROLONGADORES","RASPADOR DE TUBO 63MM","MEDIDOR DE DIST NCIA VONDER 1628","CHAVE MILTSKIL","GERADOR DE ENERGIA MC 103","TRENA DE 5 METROS","ALINHADOR CURVA DE 40MM","ALINHADOR LUVA DE 40MM","ALINHADOR DE CURVA DE 32MM","LANTERNA DE CAPACETE 1521","MAQUINA DE SOLDA PEAD"],
"Encarregado": ["PARAFUSADEIRA MAKITA DHP453 1423","CLIPADEIRA EMETTI","CLIPADEIRA RIGID RP241 BA 20 09 457","CLIPADEIRA VONARX 1574","FURADEIRA MAKITA 110 VOLTS","FURADEIRA MAKITA 110 VOLTS","FURADEIRA MAKITA 110 VOLTS","FURADEIRA MAKITA 220 VOLTS","FURADEIRA MAKITA 220 VOLTS","FURADEIRA MAKITA 220 VOLTS","CURVADOR DE TUBOS 1452","LIXADEIRA","COMPRESSOR TUF","EXTENS ES DE 15 METROS","EXTENS ES DE 30 METROS","METRO DE 4 BAR N 66520 357-19","METRO DE 4 BAR N 70317 917-19","COLUNA D AGUA DE 1000 MMCA 490-19","COLUNA D AGUA DE 1000 MMCA 607-19","COLUNA D AGUA DE 1000 MMCA 1100","ESCADA DE 5 DEGRAUS","ESCADA DE 7 DEGRAUS","GARRAFA DE 12 LITROS"]
};

let fichas = [];
let currentFichaId = null;
let filtroAtual = "todas";
let searchTerm = "";
let saveTimers = {};

function novaFichaParaFuncao(funcao){
  const lista = FUNCOES[funcao] || [];
  return {
    id: 'f_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
    colaborador: "", funcao: funcao,
    itens: lista.map(nome => ({
      nome, patrimonio: "",
      condEntrega: null, dataRetirada: "", obsEntrega: "",
      condDevolucao: null, dataDevolucao: "", obsDevolucao: ""
    })),
    assinaturaRetirada: null, dataAssinaturaRetirada: null,
    assinaturaDevolucao: null, dataAssinaturaDevolucao: null,
    status: "rascunho",
    criadoEm: new Date().toISOString(),
    criadoPor: currentUser ? currentUser.email : null
  };
}
function getFichaById(id){ return fichas.find(f => f.id === id); }
function fmtDate(iso){
  if(!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ============================================================
   AUTENTICAÇÃO
   ============================================================ */
onAuthStateChanged(auth, async (user)=>{
  currentUser = user;
  if(!user){
    canManage = false;
    showAuthView();
    return;
  }
  await refreshRole();
  document.getElementById('user-email-label').textContent = user.email;
  subscribeFichas();
  showDashboard();
});

async function refreshRole(){
  canManage = false;
  if(!currentUser) return;
  try{
    const snap = await getDoc(doc(db, 'config', 'admins'));
    if(snap.exists()){
      const emails = snap.data().emails || [];
      canManage = emails.map(e=>e.toLowerCase()).includes(currentUser.email.toLowerCase());
    }
  }catch(e){ console.error('Não foi possível verificar seu nível de acesso:', e); }
}

document.getElementById('auth-login-btn').addEventListener('click', async ()=>{
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if(!email || !pass){ setAuthError('Preencha e-mail e senha.'); return; }
  try{
    await signInWithEmailAndPassword(auth, email, pass);
    setAuthError('');
  }catch(e){ setAuthError(traduzErroAuth(e)); }
});
document.getElementById('auth-signup-btn').addEventListener('click', async ()=>{
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if(!email || !pass){ setAuthError('Preencha e-mail e senha.'); return; }
  if(pass.length < 6){ setAuthError('A senha precisa ter pelo menos 6 caracteres.'); return; }
  try{
    await createUserWithEmailAndPassword(auth, email, pass);
    setAuthError('');
  }catch(e){ setAuthError(traduzErroAuth(e)); }
});
document.getElementById('auth-reset-btn').addEventListener('click', async ()=>{
  const email = document.getElementById('auth-email').value.trim();
  if(!email){ setAuthError('Digite seu e-mail acima para receber o link de redefinição.'); return; }
  try{
    await sendPasswordResetEmail(auth, email);
    setAuthError('Enviamos um link de redefinição de senha para ' + email + '.', true);
  }catch(e){ setAuthError(traduzErroAuth(e)); }
});
document.getElementById('btn-logout').addEventListener('click', ()=> signOut(auth));

function setAuthError(msg, ok){
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.color = ok ? 'var(--good)' : 'var(--ruim)';
}
function traduzErroAuth(e){
  const code = e.code || '';
  if(code.includes('email-already-in-use')) return 'Este e-mail já tem uma conta. Tente entrar em vez de criar conta.';
  if(code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'E-mail ou senha incorretos.';
  if(code.includes('invalid-email')) return 'E-mail inválido.';
  if(code.includes('weak-password')) return 'Senha muito fraca (mínimo 6 caracteres).';
  return 'Não foi possível concluir: ' + (e.message || code);
}

function showAuthView(){
  hideAllViews();
  document.getElementById('view-auth').classList.remove('hidden');
  document.getElementById('top-actions').innerHTML = "";
}

/* ============================================================
   PERSISTÊNCIA (Firestore)
   ============================================================ */
function scheduleSave(f){
  clearTimeout(saveTimers[f.id]);
  saveTimers[f.id] = setTimeout(()=> persistFicha(f), 500);
}
async function persistFicha(f){
  try{
    const body = Object.assign({}, f);
    delete body.id;
    await setDoc(doc(db, 'fichas', f.id), body);
  }catch(e){
    console.error('Erro ao salvar ficha:', e);
    showToast('Não foi possível salvar agora. Verifique sua conexão ou permissão.');
  }
}
async function persistFichaNow(f){ clearTimeout(saveTimers[f.id]); await persistFicha(f); }
async function deleteFichaRemote(id){
  try{ await deleteDoc(doc(db, 'fichas', id)); }
  catch(e){ console.error('Erro ao excluir ficha:', e); showToast('Não foi possível excluir.'); }
}
function subscribeFichas(){
  const q = query(collection(db, 'fichas'), orderBy('criadoEm', 'desc'));
  onSnapshot(q, (snap)=>{
    fichas = snap.docs.map(d => Object.assign({id:d.id}, d.data()));
    if(!document.getElementById('view-dashboard').classList.contains('hidden')) renderDashboard();
    if(currentFichaId && !fichas.some(f=>f.id===currentFichaId) && !document.getElementById('view-ficha').classList.contains('hidden')){
      showToast('Esta ficha não está mais disponível.');
      showDashboard();
    }
  }, (err)=> console.error('Erro de sincronização:', err));
}

/* ============================================================
   TOAST / CONFIRM
   ============================================================ */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2800);
}
function askConfirm(title, msg, okLabel){
  return new Promise((resolve)=>{
    const root = document.getElementById('confirm-root');
    root.innerHTML = `<div class="confirm-overlay"><div class="confirm-box">
      <h3>${title}</h3><p>${msg}</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost btn-sm" id="conf-cancel">Cancelar</button>
        <button class="btn btn-danger btn-sm" id="conf-ok">${okLabel}</button>
      </div></div></div>`;
    document.getElementById('conf-cancel').onclick = ()=>{ root.innerHTML=""; resolve(false); };
    document.getElementById('conf-ok').onclick = ()=>{ root.innerHTML=""; resolve(true); };
  });
}

/* ============================================================
   ROTEAMENTO
   ============================================================ */
function hideAllViews(){
  ['view-auth','view-dashboard','view-select-funcao','view-ficha'].forEach(id=>{
    document.getElementById(id).classList.add('hidden');
  });
}
function showDashboard(){
  currentFichaId = null;
  hideAllViews();
  document.getElementById('view-dashboard').classList.remove('hidden');
  renderTopActionsDashboard();
  renderDashboard();
}
function showSelectFuncao(){
  if(!canManage){ showDashboard(); return; }
  hideAllViews();
  document.getElementById('view-select-funcao').classList.remove('hidden');
  renderTopActionsBar();
  renderFuncaoGrid();
}
function showFicha(id){
  currentFichaId = id;
  hideAllViews();
  document.getElementById('view-ficha').classList.remove('hidden');
  renderTopActionsBar();
  renderFicha();
  window.scrollTo({top:0, behavior:'instant'});
}
function renderTopActionsBar(){
  document.getElementById('top-actions').innerHTML = `
    <span class="funcao-badge" style="background:var(--line); color:var(--ink-soft);">${escapeHtml(currentUser.email)}${canManage ? ' · RESPONSÁVEL' : ' · CONSULTA'}</span>
    <button class="btn btn-ghost btn-sm" id="btn-logout-2">Sair</button>`;
  document.getElementById('btn-logout-2').onclick = ()=> signOut(auth);
}
function renderTopActionsDashboard(){
  let html = "";
  if(canManage) html += `<button class="btn btn-primary" id="btn-nova-ficha">+ Nova ficha</button> `;
  html += `<span class="funcao-badge" style="background:var(--line); color:var(--ink-soft);">${escapeHtml(currentUser.email)}${canManage ? ' · RESPONSÁVEL' : ' · CONSULTA'}</span>
    <button class="btn btn-ghost btn-sm" id="btn-logout-3">Sair</button>`;
  document.getElementById('top-actions').innerHTML = html;
  const btn = document.getElementById('btn-nova-ficha');
  if(btn) btn.onclick = showSelectFuncao;
  document.getElementById('btn-logout-3').onclick = ()=> signOut(auth);
}

/* ============================================================
   SELEÇÃO DE FUNÇÃO
   ============================================================ */
function renderFuncaoGrid(){
  const grid = document.getElementById('funcao-grid');
  grid.innerHTML = Object.keys(FUNCOES).map(nome => `
    <button type="button" class="funcao-card" data-funcao="${nome}">
      <div class="fc-name">${nome} <span class="fc-arrow">→</span></div>
      <div class="fc-count">${FUNCOES[nome].length} equipamentos no termo</div>
    </button>`).join('');
  grid.querySelectorAll('.funcao-card').forEach(card=>{
    card.addEventListener('click', ()=>{
      if(!canManage) return;
      const f = novaFichaParaFuncao(card.dataset.funcao);
      fichas = [f, ...fichas];
      showFicha(f.id);
      persistFichaNow(f);
    });
  });
}
document.getElementById('btn-back-funcao').addEventListener('click', showDashboard);

/* ============================================================
   DASHBOARD: LISTA
   ============================================================ */
function renderDashboard(){
  const list = document.getElementById('ficha-list');
  let items = [...fichas].filter(f => !(f.status === 'rascunho' && !f.colaborador && !f.itens.some(i=>i.condEntrega)));
  if(searchTerm.trim()){
    const q = searchTerm.trim().toLowerCase();
    items = items.filter(f => (f.colaborador||"").toLowerCase().includes(q) || (f.funcao||"").toLowerCase().includes(q));
  }
  if(filtroAtual !== 'todas'){
    items = items.filter(f => f.status === filtroAtual || (filtroAtual==='aberta' && f.status==='rascunho'));
  }
  items.sort((a,b)=> new Date(b.criadoEm) - new Date(a.criadoEm));

  if(items.length === 0){
    list.innerHTML = `<div class="empty"><b>Nenhuma ficha encontrada</b>${canManage ? 'Crie uma nova ficha selecionando a função do colaborador.' : 'Ainda não há fichas registradas.'}</div>`;
    return;
  }
  list.innerHTML = items.map(f => {
    const statusLabel = f.status === 'concluida' ? 'Concluída' : (f.status === 'aberta' ? 'Em aberto' : 'Rascunho');
    const statusClass = f.status === 'concluida' ? 'concluida' : 'aberta';
    const qtdItens = f.itens.filter(i => i.condEntrega).length;
    return `<div class="ficha-row status-${statusClass}" data-id="${f.id}">
      <div class="fr-main">
        <div class="fr-name">${escapeHtml(f.colaborador) || 'Colaborador não informado'}</div>
        <div class="fr-meta">
          <span class="funcao-badge">${escapeHtml(f.funcao)}</span>
          <span>${qtdItens}/${f.itens.length} itens registrados</span>
          <span>Criada em ${fmtDate(f.criadoEm).split(' às')[0]}</span>
        </div>
      </div>
      <div class="fr-right"><span class="status-badge ${statusClass}">${statusLabel.toUpperCase()}</span></div>
    </div>`;
  }).join("");
  list.querySelectorAll('.ficha-row').forEach(row=> row.addEventListener('click', ()=> showFicha(row.dataset.id)));
}
document.getElementById('search-input').addEventListener('input', (e)=>{ searchTerm = e.target.value; renderDashboard(); });
document.querySelectorAll('.chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    filtroAtual = chip.dataset.filter;
    renderDashboard();
  });
});
document.getElementById('btn-back').addEventListener('click', ()=>{
  const f = getFichaById(currentFichaId);
  if(canManage && f && f.status === 'rascunho' && !f.colaborador && !f.itens.some(i=>i.condEntrega)){
    fichas = fichas.filter(x => x.id !== f.id);
    deleteFichaRemote(f.id);
  }
  showDashboard();
});

/* ============================================================
   FICHA: RENDER
   ============================================================ */
function renderFicha(){
  const f = getFichaById(currentFichaId);
  if(!f){ showDashboard(); return; }
  document.getElementById('f-nome').value = f.colaborador || "";
  document.getElementById('f-nome').disabled = (f.status !== 'rascunho') || !canManage;
  document.getElementById('f-nome').oninput = (e)=>{ f.colaborador = e.target.value; scheduleSave(f); };
  document.getElementById('f-funcao-display').textContent = f.funcao;
  renderItems(f);
  renderSigRetirada(f);
  renderSigDevolucao(f);
  renderBottomBar(f);
  const cardDevolucao = document.getElementById('card-sig-devolucao');
  if(f.assinaturaRetirada) cardDevolucao.classList.remove('hidden'); else cardDevolucao.classList.add('hidden');
}

function obsBoxHtml(role, idx, value, cond, disabled){
  if(cond !== 'Regular' && cond !== 'Ruim') return '';
  if(disabled){
    if(!value) return '';
    return `<div class="obs-readonly"><b>Observação (${cond})</b>${escapeHtml(value)}</div>`;
  }
  const cls = cond === 'Ruim' ? 'ruim' : '';
  return `<div class="obs-box ${cls}" data-obsbox="${role}" data-idx="${idx}">
    <label>Motivo da condição "${cond}"</label>
    <textarea data-role="obs-${role}" data-idx="${idx}" placeholder="Descreva o problema observado...">${escapeHtml(value||'')}</textarea>
  </div>`;
}

function renderItems(f){
  const container = document.getElementById('items-container');
  const entregaEditable = !f.assinaturaRetirada && canManage;
  const devolucaoEditable = !!f.assinaturaRetirada && !f.assinaturaDevolucao && canManage;
  const readOnlyBanner = !canManage ? '<div class="locked-note" style="margin-bottom:10px;">Modo consulta: você pode visualizar esta ficha, mas não editá-la.</div>' : '';

  container.innerHTML = readOnlyBanner + f.itens.map((item, idx) => `
    <div class="item-card">
      <div class="item-head">
        <input type="text" class="item-name-input" data-idx="${idx}" value="${escapeHtml(item.nome)}" ${!entregaEditable?'disabled':''}>
        <span class="item-tag">ITEM ${String(idx+1).padStart(2,'0')}</span>
      </div>
      <div class="item-body">
        <div class="patrimonio-row">
          <div class="mini-field">
            <label>ID / Patrimônio</label>
            <input type="text" class="inp-patrimonio" data-idx="${idx}" value="${escapeHtml(item.patrimonio||'')}" placeholder="Nº do patrimônio" ${!entregaEditable?'disabled':''}>
          </div>
        </div>
        <div class="subgrid">
          <div>
            <div class="subgroup-title"><span class="dot entrega"></span>Na retirada</div>
            <div class="cond-options" data-role="cond-entrega" data-idx="${idx}">
              ${['Bom','Regular','Ruim'].map(v => `<button type="button" class="cond-btn ${item.condEntrega===v?'selected':''} ${!entregaEditable?'locked':''}" data-v="${v}" ${!entregaEditable?'disabled':''}>${v}</button>`).join('')}
            </div>
            ${obsBoxHtml('entrega', idx, item.obsEntrega, item.condEntrega, !entregaEditable)}
            <div class="mini-field" style="margin-top:10px;">
              <label>Data de retirada</label>
              <input type="date" class="inp-data-retirada" data-idx="${idx}" value="${item.dataRetirada || ''}" ${!entregaEditable?'disabled':''}>
            </div>
          </div>
          <div>
            <div class="subgroup-title"><span class="dot devolucao"></span>Na devolução</div>
            <div class="cond-options" data-role="cond-devolucao" data-idx="${idx}">
              ${['Bom','Regular','Ruim'].map(v => `<button type="button" class="cond-btn ${item.condDevolucao===v?'selected':''} ${!devolucaoEditable?'locked':''}" data-v="${v}" ${!devolucaoEditable?'disabled':''}>${v}</button>`).join('')}
            </div>
            ${obsBoxHtml('devolucao', idx, item.obsDevolucao, item.condDevolucao, !devolucaoEditable)}
            <div class="mini-field" style="margin-top:10px;">
              <label>Data de devolução</label>
              <input type="date" class="inp-data-devolucao" data-idx="${idx}" value="${item.dataDevolucao || ''}" ${!devolucaoEditable?'disabled':''}>
            </div>
            ${!f.assinaturaRetirada ? '<div class="locked-note">Disponível após a assinatura de retirada.</div>' : ''}
            ${f.assinaturaDevolucao ? '<div class="locked-note">Devolução já confirmada.</div>' : ''}
          </div>
        </div>
      </div>
    </div>`).join('');

  if(entregaEditable){
    container.querySelectorAll('.item-name-input').forEach(inp=> inp.addEventListener('input', (e)=>{ f.itens[+inp.dataset.idx].nome = e.target.value; scheduleSave(f); }));
    container.querySelectorAll('.inp-patrimonio').forEach(inp=> inp.addEventListener('input', (e)=>{ f.itens[+inp.dataset.idx].patrimonio = e.target.value; scheduleSave(f); }));
    container.querySelectorAll('[data-role="cond-entrega"]').forEach(group=>{
      group.querySelectorAll('.cond-btn').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = +group.dataset.idx;
        f.itens[idx].condEntrega = btn.dataset.v;
        if(btn.dataset.v === 'Bom') f.itens[idx].obsEntrega = '';
        scheduleSave(f); renderItems(f); renderBottomBar(f);
      }));
    });
    container.querySelectorAll('[data-role="obs-entrega"]').forEach(ta=> ta.addEventListener('input', (e)=>{ f.itens[+ta.dataset.idx].obsEntrega = e.target.value; scheduleSave(f); }));
    container.querySelectorAll('.inp-data-retirada').forEach(inp=> inp.addEventListener('change', (e)=>{ f.itens[+inp.dataset.idx].dataRetirada = e.target.value; scheduleSave(f); renderBottomBar(f); }));
  }
  if(devolucaoEditable){
    container.querySelectorAll('[data-role="cond-devolucao"]').forEach(group=>{
      group.querySelectorAll('.cond-btn').forEach(btn=> btn.addEventListener('click', ()=>{
        const idx = +group.dataset.idx;
        f.itens[idx].condDevolucao = btn.dataset.v;
        if(btn.dataset.v === 'Bom') f.itens[idx].obsDevolucao = '';
        scheduleSave(f); renderItems(f); renderBottomBar(f);
      }));
    });
    container.querySelectorAll('[data-role="obs-devolucao"]').forEach(ta=> ta.addEventListener('input', (e)=>{ f.itens[+ta.dataset.idx].obsDevolucao = e.target.value; scheduleSave(f); }));
    container.querySelectorAll('.inp-data-devolucao').forEach(inp=> inp.addEventListener('change', (e)=>{ f.itens[+inp.dataset.idx].dataDevolucao = e.target.value; scheduleSave(f); renderBottomBar(f); }));
  }
}

/* ------------- ASSINATURA (canvas + upload no Storage) ------------- */
function setupSignaturePad(canvasId){
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  function resize(){
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio; canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.strokeStyle = '#1B1B1B';
  }
  resize();
  window.addEventListener('resize', resize);
  let drawing = false, lastX=0, lastY=0;
  function pos(e){ const rect = canvas.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - rect.left, y: t.clientY - rect.top }; }
  function start(e){ drawing=true; const p=pos(e); lastX=p.x; lastY=p.y; e.preventDefault(); }
  function move(e){ if(!drawing) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(p.x,p.y); ctx.stroke(); lastX=p.x; lastY=p.y; canvas._hasContent = true; e.preventDefault(); }
  function end(){ drawing=false; }
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, {passive:false});
  canvas.addEventListener('touchmove', move, {passive:false});
  canvas.addEventListener('touchend', end);
  canvas._clear = function(){ const rect = canvas.getBoundingClientRect(); ctx.clearRect(0,0,rect.width,rect.height); canvas._hasContent = false; };
  canvas._isEmpty = function(){ return !canvas._hasContent; };
  return canvas;
}
function canvasToDataURL(canvas){
  const rect = canvas.getBoundingClientRect();
  const maxW = 500;
  const scale = Math.min(1, maxW / rect.width);
  const tmp = document.createElement('canvas');
  tmp.width = Math.max(1, Math.round(rect.width * scale));
  tmp.height = Math.max(1, Math.round(rect.height * scale));
  const tctx = tmp.getContext('2d');
  tctx.fillStyle = '#fff'; tctx.fillRect(0,0,tmp.width,tmp.height);
  tctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);
  return tmp.toDataURL('image/png');
}
async function uploadSignature(fichaId, kind, canvas){
  const dataUrl = canvasToDataURL(canvas);
  const path = `assinaturas/${fichaId}/${kind}-${Date.now()}.png`;
  const sref = ref(storage, path);
  await uploadString(sref, dataUrl, 'data_url');
  return await getDownloadURL(sref);
}

let canvasRetirada, canvasDevolucao;

function renderSigRetirada(f){
  const emptyBlock = document.getElementById('sig-retirada-empty');
  const savedBlock = document.getElementById('sig-retirada-saved');
  if(f.assinaturaRetirada){
    emptyBlock.classList.add('hidden'); savedBlock.classList.remove('hidden');
    document.getElementById('img-retirada').src = f.assinaturaRetirada;
    document.getElementById('meta-retirada').textContent = 'Assinado em ' + fmtDate(f.dataAssinaturaRetirada);
    return;
  }
  savedBlock.classList.add('hidden'); emptyBlock.classList.remove('hidden');
  if(canManage){
    emptyBlock.innerHTML = `<div class="sig-wrap"><canvas class="sigpad" id="canvas-retirada"></canvas></div>
      <div class="sig-actions"><span class="sig-hint">Assine com o dedo ou o mouse na área acima.</span>
      <div style="display:flex;gap:8px;"><button class="btn btn-ghost btn-sm" id="btn-clear-retirada">Limpar</button></div></div>`;
    document.getElementById('btn-clear-retirada').addEventListener('click', ()=> canvasRetirada && canvasRetirada._clear());
    setTimeout(()=>{ canvasRetirada = setupSignaturePad('canvas-retirada'); }, 0);
  } else {
    emptyBlock.innerHTML = `<div class="locked-note">Assinatura de retirada pendente.</div>`;
  }
}
function renderSigDevolucao(f){
  const emptyBlock = document.getElementById('sig-devolucao-empty');
  const savedBlock = document.getElementById('sig-devolucao-saved');
  if(f.assinaturaDevolucao){
    emptyBlock.classList.add('hidden'); savedBlock.classList.remove('hidden');
    document.getElementById('img-devolucao').src = f.assinaturaDevolucao;
    document.getElementById('meta-devolucao').textContent = 'Assinado em ' + fmtDate(f.dataAssinaturaDevolucao);
    return;
  }
  if(!f.assinaturaRetirada) return;
  savedBlock.classList.add('hidden'); emptyBlock.classList.remove('hidden');
  if(canManage){
    emptyBlock.innerHTML = `<div class="sig-wrap"><canvas class="sigpad" id="canvas-devolucao"></canvas></div>
      <div class="sig-actions"><span class="sig-hint">Assine com o dedo ou o mouse na área acima.</span>
      <div style="display:flex;gap:8px;"><button class="btn btn-ghost btn-sm" id="btn-clear-devolucao">Limpar</button></div></div>`;
    document.getElementById('btn-clear-devolucao').addEventListener('click', ()=> canvasDevolucao && canvasDevolucao._clear());
    setTimeout(()=>{ canvasDevolucao = setupSignaturePad('canvas-devolucao'); }, 0);
  } else {
    emptyBlock.innerHTML = `<div class="locked-note">Assinatura de devolução pendente.</div>`;
  }
}

/* ------------- BARRA INFERIOR ------------- */
function renderBottomBar(f){
  const bar = document.getElementById('bottom-bar');
  bar.innerHTML = "";
  if(canManage && (f.status === 'rascunho' || (f.status === 'aberta' && !f.assinaturaRetirada))){
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary'; btn.textContent = 'Confirmar retirada e assinar';
    btn.addEventListener('click', ()=> confirmarRetirada(f));
    bar.appendChild(btn);
  } else if(canManage && f.assinaturaRetirada && !f.assinaturaDevolucao){
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary'; btn.textContent = 'Confirmar devolução e assinar';
    btn.addEventListener('click', ()=> confirmarDevolucao(f));
    bar.appendChild(btn);
    const del = document.createElement('button');
    del.className = 'btn btn-danger'; del.textContent = 'Excluir ficha';
    del.addEventListener('click', ()=> excluirFicha(f));
    bar.appendChild(del);
  } else if(f.status === 'concluida'){
    const btn = document.createElement('button');
    btn.className = 'btn btn-ghost'; btn.textContent = 'Imprimir / gerar PDF';
    btn.addEventListener('click', ()=> window.print());
    bar.appendChild(btn);
    if(canManage){
      const del = document.createElement('button');
      del.className = 'btn btn-danger'; del.textContent = 'Excluir ficha';
      del.addEventListener('click', ()=> excluirFicha(f));
      bar.appendChild(del);
    }
  }
}

async function excluirFicha(f){
  if(!canManage) return;
  const ok = await askConfirm('Excluir ficha?', `Esta ação vai apagar permanentemente a ficha de <b>${escapeHtml(f.colaborador) || 'colaborador não informado'}</b>. Não é possível desfazer.`, 'Excluir');
  if(!ok) return;
  fichas = fichas.filter(x => x.id !== f.id);
  showToast('Ficha excluída.');
  showDashboard();
  await deleteFichaRemote(f.id);
}

async function confirmarRetirada(f){
  if(!canManage) return;
  if(!f.colaborador || !f.colaborador.trim()){ showToast('Informe o nome do colaborador.'); document.getElementById('f-nome').focus(); return; }
  for(const item of f.itens){
    if(!item.condEntrega || !item.dataRetirada){ showToast(`Preencha condição e data de retirada de todos os itens (faltando: ${item.nome}).`); return; }
    if((item.condEntrega === 'Regular' || item.condEntrega === 'Ruim') && !item.obsEntrega.trim()){ showToast(`Descreva o motivo da condição "${item.condEntrega}" em: ${item.nome}.`); return; }
  }
  if(!canvasRetirada || canvasRetirada._isEmpty()){ showToast('Colete a assinatura do colaborador antes de confirmar.'); return; }
  try{
    f.assinaturaRetirada = await uploadSignature(f.id, 'retirada', canvasRetirada);
  }catch(e){ console.error(e); showToast('Falha ao enviar a assinatura. Tente novamente.'); return; }
  f.dataAssinaturaRetirada = new Date().toISOString();
  f.status = 'aberta';
  await persistFichaNow(f);
  showToast('Retirada registrada com sucesso.');
  renderFicha();
}
async function confirmarDevolucao(f){
  if(!canManage) return;
  for(const item of f.itens){
    if(!item.condDevolucao || !item.dataDevolucao){ showToast(`Preencha condição e data de devolução de todos os itens (faltando: ${item.nome}).`); return; }
    if((item.condDevolucao === 'Regular' || item.condDevolucao === 'Ruim') && !item.obsDevolucao.trim()){ showToast(`Descreva o motivo da condição "${item.condDevolucao}" em: ${item.nome}.`); return; }
  }
  if(!canvasDevolucao || canvasDevolucao._isEmpty()){ showToast('Colete a assinatura do colaborador antes de confirmar.'); return; }
  try{
    f.assinaturaDevolucao = await uploadSignature(f.id, 'devolucao', canvasDevolucao);
  }catch(e){ console.error(e); showToast('Falha ao enviar a assinatura. Tente novamente.'); return; }
  f.dataAssinaturaDevolucao = new Date().toISOString();
  f.status = 'concluida';
  await persistFichaNow(f);
  showToast('Devolução registrada com sucesso.');
  renderFicha();
}
