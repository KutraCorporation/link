export interface Env {
  KUTRA_LINKS_DB: KVNamespace;
}

function isValidRedirect(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.replace(/^\/+|\/+$/g, "");

    if (!key) {
      return new Response("Please enter a key (e.g., /website)", { status: 400 });
    }

    try {
      const redirectUrl = await env.KUTRA_LINKS_DB.get(key);

      if (redirectUrl === null) {
        return new Response(`Key '${key}' not found.`, { status: 404 });
      }

      if (!isValidRedirect(redirectUrl)) {
        return new Response("Redirect URL is misconfigured.", { status: 500 });
      }

      return Response.redirect(redirectUrl, 302);
    } catch (err) {
      console.error(`KV Error:`, err);
      return new Response("A server error occurred.", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;