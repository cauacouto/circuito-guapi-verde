/* ========================================
   EcoTrilhas Guapimirim — App JS
   ======================================== */

const API = '/api';
let tipoSelecionado = '';
let notaSelecionada = 0;

// ==================== NAVEGAÇÃO ====================

function navegarPara(pagina) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.bnav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pagina);
  });

  const el = document.getElementById(`page-${pagina}`);
  if (el) el.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (pagina === 'inicio') carregarInicio();
  if (pagina === 'pontos') carregarPontos();
  if (pagina === 'avaliacoes') carregarAvaliacoes();
  if (pagina === 'admin') carregarAdmin();
}

function toggleMenu() {
  document.getElementById('navMobile').classList.toggle('open');
}
function fecharMenu() {
  document.getElementById('navMobile').classList.remove('open');
}

// ==================== TOAST ====================

function showToast(msg, tipo = 'sucesso') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${tipo} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ==================== MODAL ====================

function abrirModal(conteudo) {
  document.getElementById('modalContent').innerHTML = conteudo;
  document.getElementById('modalOverlay').classList.add('open');
}
function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ==================== UTILS ====================

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function estrelas(nota, max = 5) {
  if (!nota) return '<span style="color:var(--texto-leve)">Sem avaliações</span>';
  let s = '';
  for (let i = 1; i <= max; i++) {
    s += `<span style="color:${i <= Math.round(nota) ? 'var(--dourado)' : 'var(--creme-escuro)'}">★</span>`;
  }
  return s;
}

function tipoIcon(tipo) {
  const icons = { trilha: '🥾', cachoeira: '💧', mirante: '⛰️', camping: '⛺', outro: '📍' };
  return icons[tipo] || '📍';
}

function difLabel(dif) {
  const labels = { facil: 'Fácil', moderado: 'Moderado', dificil: 'Difícil' };
  return labels[dif] || dif;
}

function formatarData(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function apiFetch(url, opts = {}) {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  return res.json();
}

// ==================== INÍCIO ====================

async function carregarInicio() {
  // Stats
  const [pontos, avaliacoes, usuarios] = await Promise.all([
    apiFetch('/pontos'),
    apiFetch('/avaliacoes'),
    apiFetch('/usuarios')
  ]);
  document.getElementById('statPontos').textContent = pontos.total || 0;
  document.getElementById('statAvaliacoes').textContent = avaliacoes.total || 0;
  document.getElementById('statUsuarios').textContent = usuarios.total || 0;

  // Destaques (top 4 com avaliação)
  const destaques = (pontos.dados || []).slice(0, 4);
  const container = document.getElementById('destaquesHome');
  container.innerHTML = destaques.map(renderCardPonto).join('');
}

// ==================== PONTOS ====================

async function carregarPontos() {
  const busca = document.getElementById('buscaInput')?.value || '';
  const dificuldade = document.getElementById('filtroDificuldade')?.value || '';
  let url = '/pontos?';
  if (busca) url += `busca=${encodeURIComponent(busca)}&`;
  if (tipoSelecionado) url += `tipo=${tipoSelecionado}&`;
  if (dificuldade) url += `dificuldade=${dificuldade}`;

  document.getElementById('listaPontos').innerHTML = '<div class="loading">🌿 Carregando destinos...</div>';

  const data = await apiFetch(url);
  const pontos = data.dados || [];

  if (pontos.length === 0) {
    document.getElementById('listaPontos').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <p>Nenhum destino encontrado com esses filtros.</p>
      </div>`;
    return;
  }
  document.getElementById('listaPontos').innerHTML = pontos.map(renderCardPonto).join('');
}

function renderCardPonto(p) {
  const imgHtml = p.foto_url
    ? `<img class="card-img" src="${p.foto_url}" alt="${p.nome}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const placeholderStyle = p.foto_url ? 'display:none' : '';

  return `
    <div class="ponto-card" onclick="verDetalhesPonto(${p.id})">
      ${imgHtml}
      <div class="card-img-placeholder" style="${placeholderStyle}">${tipoIcon(p.tipo)}</div>
      ${p.dificuldade ? `<span class="dif-badge dif-${p.dificuldade}">${difLabel(p.dificuldade)}</span>` : ''}
      <div class="card-body">
        <div class="card-tipo">${tipoIcon(p.tipo)} ${p.tipo}</div>
        <div class="card-nome">${p.nome}</div>
        <div class="card-desc">${p.descricao || 'Sem descrição.'}</div>
        <div class="card-footer">
          <div>
            <span class="card-stars">${estrelas(p.media_avaliacoes)}</span>
            <span class="card-nota">${p.media_avaliacoes ? p.media_avaliacoes.toFixed(1) : '—'}</span>
          </div>
          <span class="card-avaliacoes">${p.total_avaliacoes || 0} avaliação(ões)</span>
        </div>
      </div>
    </div>`;
}

function selecionarTipo(el, tipo) {
  tipoSelecionado = tipo;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  carregarPontos();
}

function filtrarPorTipo(tipo) {
  navegarPara('pontos');
  setTimeout(() => {
    tipoSelecionado = tipo;
    document.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.dataset.tipo === tipo);
    });
    carregarPontos();
  }, 100);
}

async function verDetalhesPonto(id) {
  const data = await apiFetch(`/pontos/${id}`);
  const p = data.dados;
  if (!p) return;

  const avData = await apiFetch(`/avaliacoes/ponto/${id}`);
  const avs = avData.dados || [];
  const stats = avData.estatisticas || {};

  const avsHtml = avs.length ? avs.map(a => `
    <div style="padding:12px 0;border-bottom:1px solid var(--creme-escuro)">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
        <div class="av-avatar" style="width:32px;height:32px;font-size:0.8rem">${a.usuario_nome?.[0] || '?'}</div>
        <div>
          <div style="font-weight:600;font-size:0.88rem;color:var(--verde-escuro)">${a.usuario_nome}</div>
          <div>${estrelas(a.nota)}</div>
        </div>
      </div>
      <p style="font-size:0.85rem;color:var(--texto-medio)">${a.comentario || ''}</p>
      <p style="font-size:0.72rem;color:var(--texto-leve);margin-top:4px">${formatarData(a.criado_em)}</p>
    </div>`).join('') : '<p style="color:var(--texto-leve);font-size:0.9rem">Ainda sem avaliações. Seja o primeiro!</p>';

  abrirModal(`
    ${p.foto_url ? `<img class="detalhe-img" src="${p.foto_url}" alt="${p.nome}">` : ''}
    <h2 class="detalhe-titulo">${p.nome}</h2>
    <div class="detalhe-meta">
      <span class="card-tipo">${tipoIcon(p.tipo)} ${p.tipo}</span>
      ${p.dificuldade ? `<span class="dif-badge dif-${p.dificuldade}">${difLabel(p.dificuldade)}</span>` : ''}
    </div>
    <p class="detalhe-desc">${p.descricao || ''}</p>
    ${p.endereco ? `<p class="detalhe-endereco">📍 ${p.endereco}</p>` : ''}
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px">
      <span>${estrelas(p.media_avaliacoes)}</span>
      <strong style="color:var(--verde-escuro)">${p.media_avaliacoes ? p.media_avaliacoes.toFixed(1) : '—'}</strong>
      <span style="color:var(--texto-leve);font-size:0.85rem">(${p.total_avaliacoes || 0} avaliações)</span>
    </div>
    <button class="btn btn-primary btn-sm" onclick="fecharModal();abrirModalAvaliacao(${id})" style="margin-bottom:20px">⭐ Avaliar este local</button>
    <div class="detalhe-avaliacoes">
      <h3 class="detalhe-av-titulo">Avaliações</h3>
      ${avsHtml}
    </div>
  `);
}

// ==================== AVALIAÇÕES ====================

async function carregarAvaliacoes() {
  document.getElementById('listaAvaliacoes').innerHTML = '<div class="loading">⭐ Carregando avaliações...</div>';
  const data = await apiFetch('/avaliacoes');
  const avs = data.dados || [];

  if (avs.length === 0) {
    document.getElementById('listaAvaliacoes').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⭐</div>
        <p>Nenhuma avaliação ainda. Seja o primeiro!</p>
      </div>`;
    return;
  }

  document.getElementById('listaAvaliacoes').innerHTML = avs.map(a => `
    <div class="avaliacao-card">
      <div class="av-header">
        <div class="av-avatar">${a.usuario_nome?.[0] || '?'}</div>
        <div class="av-meta">
          <div class="av-usuario">${a.usuario_nome}</div>
          <div class="av-ponto">${tipoIcon(a.ponto_tipo)} ${a.ponto_nome}</div>
          <div class="av-stars"><span class="av-nota">${estrelas(a.nota)}</span></div>
        </div>
      </div>
      ${a.comentario ? `<p class="av-comentario">"${a.comentario}"</p>` : ''}
      <p class="av-data">${formatarData(a.criado_em)}</p>
    </div>`).join('');
}

async function abrirModalAvaliacao(pontoIdPre = null) {
  const pontosData = await apiFetch('/pontos');
  const pontos = pontosData.dados || [];
  const usuariosData = await apiFetch('/usuarios');
  const usuarios = usuariosData.dados || [];

  notaSelecionada = 0;

  abrirModal(`
    <h2 class="modal-title">Nova Avaliação</h2>
    <div class="form-group">
      <label class="form-label">Destino *</label>
      <select class="form-control" id="avPontoId">
        <option value="">Selecione um local...</option>
        ${pontos.map(p => `<option value="${p.id}" ${pontoIdPre == p.id ? 'selected' : ''}>${tipoIcon(p.tipo)} ${p.nome}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Usuário *</label>
      <select class="form-control" id="avUsuarioId">
        <option value="">Selecione um usuário...</option>
        ${usuarios.map(u => `<option value="${u.id}">${u.nome}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Nota *</label>
      <div class="star-picker" id="starPicker">
        ${[1,2,3,4,5].map(n => `<button class="star-btn" data-nota="${n}" onclick="selecionarNota(${n})">★</button>`).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Comentário</label>
      <textarea class="form-control" id="avComentario" placeholder="Conte sua experiência..."></textarea>
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarAvaliacao()">Enviar Avaliação</button>
    </div>
  `);
}

function selecionarNota(n) {
  notaSelecionada = n;
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.classList.toggle('selected', parseInt(btn.dataset.nota) <= n);
  });
}

async function salvarAvaliacao() {
  const ponto_id = document.getElementById('avPontoId').value;
  const usuario_id = document.getElementById('avUsuarioId').value;
  const comentario = document.getElementById('avComentario').value;

  if (!ponto_id || !usuario_id || !notaSelecionada) {
    showToast('Preencha todos os campos obrigatórios!', 'erro');
    return;
  }

  const data = await apiFetch('/avaliacoes', {
    method: 'POST',
    body: JSON.stringify({ ponto_id, usuario_id, nota: notaSelecionada, comentario })
  });

  if (data.sucesso) {
    fecharModal();
    showToast('Avaliação enviada com sucesso! 🌿', 'sucesso');
    carregarAvaliacoes();
  } else {
    showToast(data.erro || 'Erro ao salvar.', 'erro');
  }
}

// ==================== MODAL NOVO PONTO ====================

function abrirModalNovoPonto(pontoExistente = null) {
  const p = pontoExistente;
  const titulo = p ? 'Editar Ponto' : 'Novo Ponto Turístico';

  abrirModal(`
    <h2 class="modal-title">${titulo}</h2>
    <div class="form-group">
      <label class="form-label">Nome *</label>
      <input type="text" class="form-control" id="pNome" value="${p?.nome || ''}" placeholder="Ex: Cachoeira do Véu de Noiva">
    </div>
    <div class="form-group">
      <label class="form-label">Tipo *</label>
      <select class="form-control" id="pTipo">
        <option value="">Selecione...</option>
        ${['trilha','cachoeira','mirante','camping','outro'].map(t =>
          `<option value="${t}" ${p?.tipo === t ? 'selected' : ''}>${tipoIcon(t)} ${t.charAt(0).toUpperCase()+t.slice(1)}</option>`
        ).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Dificuldade</label>
      <select class="form-control" id="pDificuldade">
        <option value="">Selecione...</option>
        ${['facil','moderado','dificil'].map(d =>
          `<option value="${d}" ${p?.dificuldade === d ? 'selected' : ''}>${difLabel(d)}</option>`
        ).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Descrição</label>
      <textarea class="form-control" id="pDescricao" placeholder="Descreva o local...">${p?.descricao || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Endereço</label>
      <input type="text" class="form-control" id="pEndereco" value="${p?.endereco || ''}" placeholder="Ex: Estrada do Colono, Guapimirim - RJ">
    </div>
    <div class="form-group">
      <label class="form-label">URL da Foto</label>
      <input type="url" class="form-control" id="pFoto" value="${p?.foto_url || ''}" placeholder="https://...">
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarPonto(${p?.id || null})">${p ? 'Salvar' : 'Cadastrar'}</button>
    </div>
  `);
}

async function salvarPonto(id = null) {
  const body = {
    nome: document.getElementById('pNome').value.trim(),
    tipo: document.getElementById('pTipo').value,
    dificuldade: document.getElementById('pDificuldade').value || undefined,
    descricao: document.getElementById('pDescricao').value.trim() || undefined,
    endereco: document.getElementById('pEndereco').value.trim() || undefined,
    foto_url: document.getElementById('pFoto').value.trim() || undefined,
  };

  if (!body.nome || !body.tipo) {
    showToast('Nome e tipo são obrigatórios!', 'erro');
    return;
  }

  const url = id ? `/pontos/${id}` : '/pontos';
  const method = id ? 'PUT' : 'POST';

  const data = await apiFetch(url, { method, body: JSON.stringify(body) });

  if (data.sucesso) {
    fecharModal();
    showToast(data.mensagem || 'Salvo com sucesso!', 'sucesso');
    carregarPontos();
    carregarAdmin();
  } else {
    showToast(data.erro || 'Erro ao salvar.', 'erro');
  }
}

async function deletarPonto(id) {
  if (!confirm('Remover este ponto turístico?')) return;
  const data = await apiFetch(`/pontos/${id}`, { method: 'DELETE' });
  if (data.sucesso) {
    showToast('Ponto removido!', 'sucesso');
    carregarAdmin();
    carregarPontos();
  } else {
    showToast(data.erro || 'Erro ao remover.', 'erro');
  }
}

// ==================== MODAL NOVO USUÁRIO ====================

function abrirModalNovoUsuario(u = null) {
  abrirModal(`
    <h2 class="modal-title">${u ? 'Editar Usuário' : 'Novo Usuário'}</h2>
    <div class="form-group">
      <label class="form-label">Nome *</label>
      <input type="text" class="form-control" id="uNome" value="${u?.nome || ''}" placeholder="Nome completo">
    </div>
    <div class="form-group">
      <label class="form-label">E-mail *</label>
      <input type="email" class="form-control" id="uEmail" value="${u?.email || ''}" placeholder="email@exemplo.com">
    </div>
    <div class="form-group">
      <label class="form-label">${u ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}</label>
      <input type="password" class="form-control" id="uSenha" placeholder="${u ? '••••••' : 'Mínimo 6 caracteres'}">
    </div>
    <div class="form-actions">
      <button class="btn btn-outline" onclick="fecharModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarUsuario(${u?.id || null})">${u ? 'Salvar' : 'Cadastrar'}</button>
    </div>
  `);
}

async function salvarUsuario(id = null) {
  const nome = document.getElementById('uNome').value.trim();
  const email = document.getElementById('uEmail').value.trim();
  const senha = document.getElementById('uSenha').value;

  if (!nome || !email || (!id && !senha)) {
    showToast('Preencha todos os campos obrigatórios!', 'erro');
    return;
  }

  const body = { nome, email };
  if (senha) body.senha = senha;

  const url = id ? `/usuarios/${id}` : '/usuarios';
  const method = id ? 'PUT' : 'POST';

  const data = await apiFetch(url, { method, body: JSON.stringify(body) });

  if (data.sucesso) {
    fecharModal();
    showToast(data.mensagem || 'Usuário salvo!', 'sucesso');
    carregarAdmin();
  } else {
    showToast(data.erro || 'Erro ao salvar.', 'erro');
  }
}

async function deletarUsuario(id) {
  if (!confirm('Remover este usuário? Suas avaliações também serão removidas.')) return;
  const data = await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
  if (data.sucesso) {
    showToast('Usuário removido!', 'sucesso');
    carregarAdmin();
  } else {
    showToast(data.erro || 'Erro ao remover.', 'erro');
  }
}

// ==================== ADMIN ====================

async function carregarAdmin() {
  const [pontosData, usuariosData] = await Promise.all([
    apiFetch('/pontos'),
    apiFetch('/usuarios')
  ]);

  // Tabela Pontos
  const pontos = pontosData.dados || [];
  document.getElementById('adminListaPontos').innerHTML = pontos.length ? `
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr>
        <th>Nome</th>
        <th>Tipo</th>
        <th>Dificuldade</th>
        <th>Nota</th>
        <th>Ações</th>
      </tr></thead>
      <tbody>
        ${pontos.map(p => `<tr>
          <td><strong>${p.nome}</strong></td>
          <td>${tipoIcon(p.tipo)} ${p.tipo}</td>
          <td>${p.dificuldade ? `<span class="dif-badge dif-${p.dificuldade}" style="position:static">${difLabel(p.dificuldade)}</span>` : '—'}</td>
          <td>${p.media_avaliacoes ? `⭐ ${Number(p.media_avaliacoes).toFixed(1)}` : '—'}</td>
          <td>
            <div class="admin-actions">
              <button class="btn btn-outline btn-xs" onclick="editarPonto(${p.id})">✏️ Editar</button>
              <button class="btn btn-danger btn-xs" onclick="deletarPonto(${p.id})">🗑️</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>` : '<div class="empty-state"><div class="empty-icon">🗺️</div><p>Nenhum ponto cadastrado.</p></div>';

  // Tabela Usuários
  const usuarios = usuariosData.dados || [];
  document.getElementById('adminListaUsuarios').innerHTML = usuarios.length ? `
    <div style="overflow-x:auto">
    <table class="admin-table">
      <thead><tr>
        <th>Nome</th>
        <th>E-mail</th>
        <th>Cadastro</th>
        <th>Ações</th>
      </tr></thead>
      <tbody>
        ${usuarios.map(u => `<tr>
          <td><div style="display:flex;align-items:center;gap:10px">
            <div class="av-avatar" style="width:32px;height:32px;font-size:0.8rem;flex-shrink:0">${u.nome[0]}</div>
            <strong>${u.nome}</strong>
          </div></td>
          <td style="color:var(--texto-leve)">${u.email}</td>
          <td style="color:var(--texto-leve)">${formatarData(u.criado_em)}</td>
          <td>
            <div class="admin-actions">
              <button class="btn btn-outline btn-xs" onclick="editarUsuario(${u.id})">✏️</button>
              <button class="btn btn-danger btn-xs" onclick="deletarUsuario(${u.id})">🗑️</button>
            </div>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>` : '<div class="empty-state"><div class="empty-icon">👥</div><p>Nenhum usuário cadastrado.</p></div>';
}

async function editarPonto(id) {
  const data = await apiFetch(`/pontos/${id}`);
  if (data.dados) abrirModalNovoPonto(data.dados);
}

async function editarUsuario(id) {
  const data = await apiFetch(`/usuarios/${id}`);
  if (data.dados) abrirModalNovoUsuario(data.dados);
}

function adminTab(el, painelId) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(painelId).classList.add('active');
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  carregarInicio();
});
