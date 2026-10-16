export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const targetUrl = `http://16.171.141.115${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
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

  return fetch(targetUrl, init);
}
