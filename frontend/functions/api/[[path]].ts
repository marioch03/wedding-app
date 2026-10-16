export async function onRequest(context: { request: Request }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(context.request.url);
  const targetUrl = `http://16.171.141.115.nip.io${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete('origin');
  headers.delete('referer');
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', 'https');

  const hasBody = !['GET', 'HEAD'].includes(context.request.method);

  const init: RequestInit = {
    method: context.request.method,
    headers,
    redirect: 'follow',
  };

  if (hasBody) {
    init.body = context.request.body;
    // @ts-expect-error duplex is required in standard fetch streaming
    init.duplex = 'half';
  }

  const response = await fetch(targetUrl, init);

  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
