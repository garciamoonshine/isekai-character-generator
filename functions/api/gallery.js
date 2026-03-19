
export async function onRequestGet(context) {
  const { GALLERY_KV } = context.env;
  
  try {
    // Get the keys for the latest 50 characters
    const list = await GALLERY_KV.list({ limit: 50 });
    const results = await Promise.all(
      list.keys.map(key => GALLERY_KV.get(key.name, { type: 'json' }))
    );
    
    return new Response(JSON.stringify(results.filter(r => r !== null)), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { GALLERY_KV } = context.env;
  
  try {
    const charData = await context.request.json();
    
    // We use the unique character ID (seed_pseed) as the key
    // We add a timestamp prefix to the key so KV.list returns them in a semi-ordered way
    const timestamp = Date.now();
    const key = `char_${timestamp}_${charData.id}`;
    
    await GALLERY_KV.put(key, JSON.stringify(charData));
    
    return new Response(JSON.stringify({ success: true, id: key }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
