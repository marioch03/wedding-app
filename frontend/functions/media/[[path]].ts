export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const targetUrl = `http://16.171.141.115.nip.io${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete('origin');
  headers.delete('referer');
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', 'https');

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers,
  });

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
