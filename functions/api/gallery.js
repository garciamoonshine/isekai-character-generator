
export async function onRequestGet(context) {
  const { GALLERY_KV } = context.env;
  try {
    // CRITICAL FIX: Only list keys that actually contain character data (prefix 'char_')
    // This excludes the 'id_' tracking markers which were causing "undefined" cards
    const list = await GALLERY_KV.list({ prefix: 'char_', limit: 50 });
    
    const results = await Promise.all(
      list.keys.map(key => GALLERY_KV.get(key.name, { type: 'json' }))
    );
    
    return new Response(JSON.stringify(results.filter(r => r !== null)), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
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

    const uniqueId = charData.id;
    const fileName = `portrait_${uniqueId}.png`;

    // Check for duplicate using the tracking prefix
    const exists = await GALLERY_KV.list({ prefix: `id_${uniqueId}` });
    if (exists.keys.length > 0) {
        return new Response(JSON.stringify({ error: 'Already Published' }), { status: 409 });
    }

    const timestamp = Date.now();
    const kvKey = `char_${timestamp}_${uniqueId}`;
    const trackingKey = `id_${uniqueId}`;

    if (imageBlob && PORTRAITS_R2) {
        await PORTRAITS_R2.put(fileName, imageBlob);
        charData.portraitUrl = `/api/portrait/${fileName}`;
    }

    await GALLERY_KV.put(kvKey, JSON.stringify(charData));
    await GALLERY_KV.put(trackingKey, "1");
    
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
