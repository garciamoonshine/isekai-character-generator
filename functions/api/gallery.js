
export async function onRequestGet(context) {
  const { GALLERY_KV } = context.env;
  try {
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
  const { GALLERY_KV, PORTRAITS_R2 } = context.env;
  
  try {
    const formData = await context.request.formData();
    const charData = JSON.parse(formData.get('metadata'));
    const imageBlob = formData.get('image');

    const uniqueId = charData.id; // composite seed_pseed
    const fileName = `portrait_${uniqueId}.png`;

    // 1. DUPLICATE CHECK
    // We check if this specific character+portrait combo exists in KV already
    // To do this efficiently, we check for a key starting with "id_" + uniqueId
    const exists = await GALLERY_KV.list({ prefix: `id_${uniqueId}` });
    if (exists.keys.length > 0) {
        return new Response(JSON.stringify({ error: 'Already Published' }), { status: 409 });
    }

    const timestamp = Date.now();
    const kvKey = `char_${timestamp}_${uniqueId}`;
    const trackingKey = `id_${uniqueId}`;

    // 2. Freeze the image in R2
    if (imageBlob && PORTRAITS_R2) {
        await PORTRAITS_R2.put(fileName, imageBlob);
        charData.portraitUrl = `/api/portrait/${fileName}`;
    }

    // 3. Save to KV (Main list and Tracking key)
    await GALLERY_KV.put(kvKey, JSON.stringify(charData));
    await GALLERY_KV.put(trackingKey, "1"); // Marker for duplicate check
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
