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
    // Fetch from Cloudflare KV API
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
      
      // Determine link: if pseed exists and is different from seed
      let link = `index.html#seed=${char.seed}`;
      if (char.portraitSeed && char.portraitSeed !== char.seed) {
          link += `&pseed=${char.portraitSeed}`;
      }

      card.innerHTML = `
        <img src="${char.portraitUrl || ''}" alt="${char.name}" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='">
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
    loader.innerHTML = '⚠️ Failed to connect to the Multiverse API. Check your Cloudflare KV bindings.';
    console.error('[Gallery] API Error:', e);
  }
});
