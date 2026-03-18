// ===== MAIN APP CONTROLLER =====
let currentSeed = null;
let currentPortraitSeed = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check for shared seed in URL
  const sharedSeed = getShareSeed();
  if (sharedSeed !== null) {
    loadFromSeed(sharedSeed);
  }

  // Generate button
  document.getElementById('generate-btn').addEventListener('click', () => {
    currentSeed = generateSeed();
    loadFromSeed(currentSeed);
  });

  // Reroll portrait
  document.getElementById('reroll-portrait-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    currentPortraitSeed = generateSeed();
    loadPortrait(window.currentCharacter, currentPortraitSeed);
  });

  // Share button
  document.getElementById('share-btn').addEventListener('click', () => {
    if (currentSeed !== null) copyShareUrl(currentSeed);
  });

  // Publish to gallery
  document.getElementById('publish-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    publishToGallery(window.currentCharacter);
    showToast('🌐 Published to gallery!');
  });

  // Export JSON
  document.getElementById('export-btn').addEventListener('click', () => {
    if (!window.currentCharacter) return;
    const blob = new Blob([JSON.stringify(window.currentCharacter, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${window.currentCharacter.name.replace(/\s+/g, '_')}.json`;
    a.click();
  });
});

function loadFromSeed(seed) {
  currentSeed = seed;
  const char = generateCharacter(seed);
  renderCharacter(char);
  currentPortraitSeed = loadPortrait(char, seed);
}

function publishToGallery(char) {
  const gallery = JSON.parse(localStorage.getItem('isekai_gallery') || '[]');
  // Avoid duplicates
  const exists = gallery.find(c => c.seed === char.seed);
  if (!exists) {
    gallery.unshift({
      seed: char.seed,
      name: char.name,
      title: char.title,
      race: char.race.name,
      cls: `${char.cls.icon} ${char.cls.name}`,
      traits: char.traits,
      portraitUrl: document.getElementById('portrait-img').src || ''
    });
    localStorage.setItem('isekai_gallery', JSON.stringify(gallery.slice(0, 50)));
  }
}
