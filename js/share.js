// ===== SHARE VIA URL (Dual Seed Support) =====
function buildShareUrl(charSeed, portraitSeed) {
    const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    let hash = `seed=${charSeed}`;
    if (portraitSeed !== charSeed && portraitSeed !== null) {
        hash += `&pseed=${portraitSeed}`;
    }
    return `${base}index.html#${hash}`;
}

function getShareSeed() {
    const hash = window.location.hash;
    const charMatch = hash.match(/seed=(\d+)/);
    const portMatch = hash.match(/pseed=(\d+)/);
    
    return {
        charSeed: charMatch ? parseInt(charMatch[1]) : null,
        portraitSeed: portMatch ? parseInt(portMatch[1]) : null
    };
}

function copyShareUrl(charSeed, portraitSeed) {
    const url = buildShareUrl(charSeed, portraitSeed);
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
