export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const targetUrl = `http://16.171.141.115${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', 'https');

  return fetch(targetUrl, {
    method: context.request.method,
    headers,
  });
}
