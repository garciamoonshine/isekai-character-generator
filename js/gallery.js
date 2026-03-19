// ===== GLOBAL GALLERY (PRO-UX EDITION) =====
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  const loader = document.createElement('div');
  loader.id = 'gallery-loader';
  loader.innerHTML = '🔮 Summoning Heroes from R2 Storage...';
  loader.style.textAlign = 'center';
  loader.style.gridColumn = '1/-1';
  loader.style.padding = '100px 20px';
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
      
      // We pass the R2 filename in the URL so the index page knows to load the FROZEN image
      let filename = `portrait_${char.seed}_${char.portraitSeed}.png`;
      let link = `index.html#seed=${char.seed}&pseed=${char.portraitSeed}&r2=${filename}`;

      const liveUrl = char.portraitUrl || `https://pollinations.ai/p/rpg-portrait?seed=${char.portraitSeed}`;

      card.innerHTML = `
        <div class="gc-portrait-wrap" style="aspect-ratio:9/16; background:var(--bg3); border-radius:10px; overflow:hidden; margin-bottom:12px;">
            <img src="${liveUrl}" alt="${char.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
        </div>
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
    loader.innerHTML = '⚠️ The Multiverse connection is unstable.';
  }
});
