// ===== AI PORTRAIT GENERATION =====
const POLLINATIONS_BASE = 'https://gen.pollinations.ai/image/';

function buildPortraitPrompt(char) {
  return `anime fantasy RPG character portrait, ${char.race.name}, ${char.cls.name}, ` +
    `${char.hair} hair, ${char.eyes} eyes, ${char.build}, ${char.style}, ` +
    `${char.mark}, detailed face, cinematic lighting, high quality, ` +
    `white gradient background, upper body shot, digital art`;
}

function getPortraitUrl(char, seed, key) {
  const prompt = buildPortraitPrompt(char);
  const encoded = encodeURIComponent(prompt);
  let url = `${POLLINATIONS_BASE}${encoded}?width=512&height=512&nologo=true`;
  if (key) url += `&key=${key}`;
  if (seed !== undefined) url += `&seed=${seed}`;
  return url;
}

function loadPortrait(char, portraitSeed) {
  const key = window.pollinationsKey || null;
  const img = document.getElementById('portrait-img');
  const placeholder = document.getElementById('portrait-placeholder');
  const loading = document.getElementById('portrait-loading');
  const seedDisplay = document.getElementById('portrait-seed');
  const seedWrap = document.getElementById('portrait-seed');

  img.classList.add('hidden');
  placeholder.classList.add('hidden');
  loading.classList.remove('hidden');

  const pSeed = portraitSeed !== undefined ? portraitSeed : char.seed;
  const url = getPortraitUrl(char, pSeed, key);

  const tempImg = new Image();
  tempImg.crossOrigin = 'anonymous';
  tempImg.onload = () => {
    img.src = url;
    img.classList.remove('hidden');
    loading.classList.add('hidden');
    seedWrap.classList.remove('hidden');
    seedDisplay.textContent = pSeed;
  };
  tempImg.onerror = () => {
    loading.classList.add('hidden');
    placeholder.classList.remove('hidden');
    placeholder.innerHTML = '⚠️<br>Portrait failed<br><small>Check connection</small>';
  };
  tempImg.src = url;

  return pSeed;
}
