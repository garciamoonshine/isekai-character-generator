// ===== POLLINATIONS BYOP AUTH =====
// Docs: https://github.com/pollinations/pollinations/blob/main/BRING_YOUR_OWN_POLLEN.md

const BYOP_APP_KEY = 'pk_isekaiCharGen2026';
const BYOP_AUTH_URL = 'https://enter.pollinations.ai/authorize';

async function validateKey(key) {
  // Quick test call to verify key works
  try {
    const resp = await fetch('https://gen.pollinations.ai/image/test?width=32&height=32&nologo=true&model=zimage', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    return resp.ok;
  } catch {
    return false;
  }
}

async function initBYOP() {
  // Check if key returned in hash after BYOP redirect
  const hash = window.location.hash;
  const keyMatch = hash.match(/[#&]api_key=([^&]+)/);
  if (keyMatch) {
    const key = decodeURIComponent(keyMatch[1]);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    const valid = await validateKey(key);
    if (valid) {
      localStorage.setItem('pollinations_key', key);
      setPollinationsKey(key);
    } else {
      showAuthError('Key returned but validation failed. Please try reconnecting.');
    }
    return;
  }

  // Check localStorage
  const stored = localStorage.getItem('pollinations_key');
  if (stored) {
    setPollinationsKey(stored);
    return;
  }

  // No key — show connect banner
  showConnectBanner();
}

function setPollinationsKey(key) {
  window.pollinationsKey = key;
  // Update banner to show connected state with logout option
  const banner = document.getElementById('auth-banner');
  const inner = document.querySelector('.auth-inner');
  if (inner) {
    inner.innerHTML = `
      <span>✅ Pollinations connected</span>
      <button id="logout-btn" style="background:#ef4444;color:#fff;border:none;padding:6px 14px;border-radius:20px;cursor:pointer;font-size:13px;font-weight:bold;">🔓 Disconnect</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', logoutBYOP);
  }
  if (banner) banner.classList.remove('hidden');
  const hint = document.getElementById('connect-hint');
  if (hint) hint.classList.add('hidden');
  console.log('[BYOP] Pollinations key loaded ✓');
}

function showConnectBanner() {
  document.getElementById('auth-banner').classList.remove('hidden');
  document.getElementById('connect-hint').classList.remove('hidden');
}

function showAuthError(msg) {
  const status = document.getElementById('auth-status');
  if (status) { status.textContent = '⚠️ ' + msg; status.style.color = '#f87171'; }
  showConnectBanner();
}

function logoutBYOP() {
  localStorage.removeItem('pollinations_key');
  window.pollinationsKey = null;
  const inner = document.querySelector('.auth-inner');
  if (inner) {
    inner.innerHTML = `
      <span>⚡ Connect Pollinations to generate portraits</span>
      <button id="byop-btn" style="background:#c084fc;color:#000;border:none;padding:6px 16px;border-radius:20px;cursor:pointer;font-weight:bold;font-size:13px;">🔗 Connect with Pollinations</button>
      <span id="auth-status"></span>
    `;
    document.getElementById('byop-btn').addEventListener('click', launchBYOP);
  }
  document.getElementById('connect-hint').classList.remove('hidden');
  console.log('[BYOP] Logged out');
}

function launchBYOP() {
  const redirectUrl = encodeURIComponent(window.location.href.split('#')[0]);
  const url = `${BYOP_AUTH_URL}?redirect_url=${redirectUrl}&app_key=${BYOP_APP_KEY}&models=zimage,flux&budget=50&expiry=30`;
  window.location.href = url;
}

document.addEventListener('DOMContentLoaded', () => {
  const byopBtn = document.getElementById('byop-btn');
  if (byopBtn) byopBtn.addEventListener('click', launchBYOP);
  const connectLink = document.getElementById('connect-link');
  if (connectLink) connectLink.addEventListener('click', (e) => { e.preventDefault(); launchBYOP(); });
  initBYOP();
});
