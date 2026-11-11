// Steady ↔ Oura helper (Cloudflare Worker).
// Oura's API doesn't accept requests from web pages, and the sign-in needs a
// client secret that can't live in public page code. This worker:
//   GET  /config               -> the public client id
//   POST /token   {code, redirect_uri} -> exchanges a sign-in code for tokens
//   POST /refresh {refresh_token}      -> renews tokens
//   GET  /v2/usercollection/...         -> passes data requests through to Oura
// It stores nothing. Only the Steady site may call it.
// Secrets: OURA_CLIENT_ID (var) and OURA_CLIENT_SECRET (secret).

const ALLOWED_ORIGIN = "https://emmar-commits.github.io";
const OURA = "https://api.ouraring.com";

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (req.headers.get("Origin") !== ALLOWED_ORIGIN) return new Response("Forbidden", { status: 403 });

    const url = new URL(req.url);

    if (url.pathname === "/config" && req.method === "GET") {
      return json({ client_id: env.OURA_CLIENT_ID });
    }

    if ((url.pathname === "/token" || url.pathname === "/refresh") && req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
      const form = new URLSearchParams({ client_id: env.OURA_CLIENT_ID, client_secret: env.OURA_CLIENT_SECRET });
      if (url.pathname === "/token") {
        if (!body.code || !String(body.redirect_uri || "").startsWith(ALLOWED_ORIGIN + "/")) return json({ error: "bad_request" }, 400);
        form.set("grant_type", "authorization_code");
        form.set("code", body.code);
        form.set("redirect_uri", body.redirect_uri);
      } else {
        if (!body.refresh_token) return json({ error: "bad_request" }, 400);
        form.set("grant_type", "refresh_token");
        form.set("refresh_token", body.refresh_token);
      }
      const r = await fetch(OURA + "/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      return new Response(await r.text(), { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (url.pathname.startsWith("/v2/usercollection/") && req.method === "GET") {
      const r = await fetch(OURA + url.pathname + url.search, {
        headers: { Authorization: req.headers.get("Authorization") || "" },
      });
      return new Response(r.body, { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
    }

    return json({ error: "not_found" }, 404);
  },
};
