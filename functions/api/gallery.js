
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

    const timestamp = Date.now();
    const fileName = `portrait_${charData.id}.png`;
    const kvKey = `char_${timestamp}_${charData.id}`;

    // 1. Freeze the image in R2
    if (imageBlob && PORTRAITS_R2) {
        await PORTRAITS_R2.put(fileName, imageBlob);
        // Update URL to point to our persistent internal storage
        charData.portraitUrl = `/api/portrait/${fileName}`;
    }

    // 2. Save metadata to KV
    await GALLERY_KV.put(kvKey, JSON.stringify(charData));
    
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
