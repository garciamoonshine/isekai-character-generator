// ===== GLOBAL GALLERY CONTROLLER =====
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const loader = document.createElement('div');
  loader.id = 'gallery-loader';
  loader.innerHTML = '🔮 Summoning Heroes from the Multiverse...';
  loader.style.textAlign = 'center';
  loader.style.padding = '40px';
  loader.style.color = 'var(--muted)';
  grid.appendChild(loader);

  try {
    const res = await fetch('/api/gallery');
    const gallery = await res.json();
    loader.remove();

    if (!gallery || gallery.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    gallery.reverse().forEach(char => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      
      let link = `index.html#seed=${char.seed}`;
      if (char.portraitSeed && char.portraitSeed !== char.seed) {
          link += `&pseed=${char.portraitSeed}`;
      }

      // CRITICAL FIX: The stored portraitUrl is a local Blob URL which EXPIRES.
      // We must reconstruct the live Pollinations URL for the gallery view.
      const prompt = `anime fantasy RPG character portrait, ${char.race}, ${char.cls}, detailed face, digital art`;
      const liveUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?width=300&height=533&nologo=true&model=zimage&seed=${char.portraitSeed || char.seed}`;

      card.innerHTML = `
        <img src="${liveUrl}" alt="${char.name}" loading="lazy">
        <div class="gc-name">${char.name}</div>
        <div class="gc-class">${char.cls}</div>
        <div class="gc-traits">${char.traits ? char.traits.slice(0,2).join(' · ') : ''}</div>
      `;
      card.addEventListener('click', () => {
        window.location.href = link;
      });
      grid.appendChild(card);
    });
  } catch (e) {
    loader.innerHTML = '⚠️ Failed to connect to the Multiverse API.';
    console.error('[Gallery] API Error:', e);
  }
});
