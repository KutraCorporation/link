export interface Env {
  KUTRA_LINKS_DB: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    if (!key) {
      return new Response("Please enter a key (e.g., /website)", { status: 400 });
    }

    try {
      const redirectUrl = await env.KUTRA_LINKS_DB.get(key);

      if (redirectUrl === null) {
        return new Response(`Key '${key}' not found.`, { status: 404 });
      }

      return Response.redirect(redirectUrl, 302);
    } catch (err) {
      console.error(`KV Error:`, err);
      return new Response("A server error occurred.", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;