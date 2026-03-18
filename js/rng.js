// ===== SEEDED RNG ENGINE =====
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeRNG(seed) {
  const rand = mulberry32(seed);
  return {
    next: rand,
    pick: (arr) => arr[Math.floor(rand() * arr.length)],
    range: (min, max) => Math.floor(rand() * (max - min + 1)) + min,
    pickN: (arr, n) => {
      const copy = [...arr];
      const result = [];
      for (let i = 0; i < n && copy.length; i++) {
        const idx = Math.floor(rand() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
      }
      return result;
    }
  };
}

function generateSeed() {
  return Math.floor(Math.random() * 0xFFFFFFFF);
}
