
export async function onRequestGet(context) {
  const { PORTRAITS_R2 } = context.env;
  const url = new URL(context.request.url);
  const fileName = url.pathname.split('/').pop();

  if (!PORTRAITS_R2) return new Response("R2 Not Bound", { status: 500 });

  const object = await PORTRAITS_R2.get(fileName);

  if (object === null) {
    return new Response("Object Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=604800"); // Cache for 7 days

  return new Response(object.body, { headers });
}
