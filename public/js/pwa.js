/* ================================================
   EcoTrilhas — PWA: Service Worker + Install Banner
   ================================================ */

// ─── Registrar Service Worker ─────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[PWA] Service Worker registrado:', reg.scope);

        // Verifica se há atualização disponível
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => console.warn('[PWA] Falha ao registrar SW:', err));
  });
}

// ─── Banner de instalação ─────────────────────────────────────────
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;

  // Só mostra o banner se o usuário nunca instalou
  if (!localStorage.getItem('pwa-dismissed')) {
    setTimeout(showInstallBanner, 3000); // aparece após 3s
  }
});

function showInstallBanner() {
  if (!deferredPrompt) return;

  const banner = document.createElement('div');
  banner.id = 'pwa-banner';
  banner.innerHTML = `
    <div class="pwa-banner-inner">
      <span class="pwa-icon">🌿</span>
      <div class="pwa-text">
        <strong>Instalar EcoTrilhas</strong>
        <span>Use como app no seu celular</span>
      </div>
      <div class="pwa-actions">
        <button class="pwa-btn-instalar" onclick="instalarPWA()">Instalar</button>
        <button class="pwa-btn-fechar" onclick="fecharBanner()" aria-label="Fechar">✕</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #pwa-banner {
      position: fixed;
      bottom: calc(72px + 12px);
      left: 12px;
      right: 12px;
      z-index: 400;
      animation: slideUpBanner 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes slideUpBanner {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }
    .pwa-banner-inner {
      background: #1a3a2a;
      color: white;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    }
    .pwa-icon { font-size: 28px; flex-shrink: 0; }
    .pwa-text { flex: 1; }
    .pwa-text strong { display: block; font-size: 0.9rem; font-weight: 700; }
    .pwa-text span   { display: block; font-size: 0.75rem; color: rgba(255,255,255,0.65); margin-top: 2px; }
    .pwa-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .pwa-btn-instalar {
      background: #74c69d;
      color: #1a3a2a;
      border: none;
      border-radius: 100px;
      padding: 8px 16px;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
      white-space: nowrap;
      font-family: inherit;
    }
    .pwa-btn-fechar {
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      font-size: 1rem;
      padding: 4px;
    }
    @media (min-width: 768px) {
      #pwa-banner { bottom: 24px; max-width: 420px; left: auto; right: 24px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(banner);
}

async function instalarPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    console.log('[PWA] Usuário instalou o app!');
    showToast('EcoTrilhas instalado! 🌿 Procure na tela inicial.', 'sucesso');
  }

  deferredPrompt = null;
  fecharBanner();
}

function fecharBanner() {
  const banner = document.getElementById('pwa-banner');
  if (banner) banner.remove();
  localStorage.setItem('pwa-dismissed', '1');
}

// Banner de "App instalado com sucesso"
window.addEventListener('appinstalled', () => {
  console.log('[PWA] App instalado!');
  showToast('EcoTrilhas instalado com sucesso! 🌿', 'sucesso');
  fecharBanner();
});

// ─── Banner de atualização disponível ────────────────────────────
function showUpdateBanner() {
  const banner = document.createElement('div');
  banner.style.cssText = `
    position:fixed; top:70px; left:12px; right:12px; z-index:400;
    background:#2d6a4f; color:white; border-radius:12px;
    padding:12px 16px; display:flex; align-items:center;
    justify-content:space-between; gap:12px;
    box-shadow:0 4px 20px rgba(0,0,0,0.25);
    font-family:'DM Sans',sans-serif; font-size:0.88rem;
  `;
  banner.innerHTML = `
    <span>🔄 Nova versão disponível!</span>
    <button onclick="window.location.reload()" style="
      background:#74c69d; color:#1a3a2a; border:none;
      border-radius:100px; padding:6px 14px; font-weight:700;
      cursor:pointer; font-size:0.8rem; font-family:inherit;
    ">Atualizar</button>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 8000);
}

// ─── Detectar modo standalone (já instalado) ─────────────────────
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('[PWA] Rodando como app instalado');
  document.documentElement.classList.add('pwa-standalone');
}
