// ===== SHARE VIA URL (Option A — base64 encoded) =====
function buildShareUrl(seed) {
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
  return `${base}index.html#seed=${seed}`;
}

function getShareSeed() {
  const hash = window.location.hash;
  const match = hash.match(/#seed=(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function copyShareUrl(seed) {
  const url = buildShareUrl(seed);
  navigator.clipboard.writeText(url).then(() => {
    showToast('✅ Link copied to clipboard!');
  }).catch(() => {
    prompt('Copy this link:', url);
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}
