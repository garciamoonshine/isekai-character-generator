// ===== POLLINATIONS BYOP AUTH =====
// Docs: https://github.com/pollinations/pollinations/blob/main/BRING_YOUR_OWN_POLLEN.md

const BYOP_APP_KEY = 'pk_isekaiCharGen2026';
const BYOP_AUTH_URL = 'https://enter.pollinations.ai/authorize';

function initBYOP() {
  // Check if key returned in hash
  const hash = window.location.hash;
  const keyMatch = hash.match(/[#&]api_key=([^&]+)/);
  if (keyMatch) {
    const key = keyMatch[1];
    localStorage.setItem('pollinations_key', key);
    // Clean hash from URL without reload
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setPollinationsKey(key);
    return;
  }

  // Check localStorage
  const stored = localStorage.getItem('pollinations_key');
  if (stored) {
    setPollinationsKey(stored);
    return;
  }

  // Show auth banner
  document.getElementById('auth-banner').classList.remove('hidden');
  document.getElementById('connect-hint').classList.remove('hidden');
}

function setPollinationsKey(key) {
  window.pollinationsKey = key;
  const status = document.getElementById('auth-status');
  if (status) status.textContent = '✅ Connected';
  const banner = document.getElementById('auth-banner');
  if (banner) banner.classList.add('hidden');
  const hint = document.getElementById('connect-hint');
  if (hint) hint.classList.add('hidden');
  console.log('[BYOP] Pollinations key loaded');
}

function launchBYOP() {
  const redirectUrl = encodeURIComponent(window.location.href.split('#')[0]);
  const url = `${BYOP_AUTH_URL}?redirect_url=${redirectUrl}&app_key=${BYOP_APP_KEY}&models=flux&budget=50&expiry=30`;
  window.location.href = url;
}

document.addEventListener('DOMContentLoaded', () => {
  const byopBtn = document.getElementById('byop-btn');
  if (byopBtn) byopBtn.addEventListener('click', launchBYOP);
  const connectLink = document.getElementById('connect-link');
  if (connectLink) connectLink.addEventListener('click', (e) => { e.preventDefault(); launchBYOP(); });
  initBYOP();
});
