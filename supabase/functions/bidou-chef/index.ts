// Bidou : fonction « bidou-chef ». Elle reçoit une demande de l'appli, vérifie que la personne est connectée
// (et autorisée), compte ses appels du jour, puis interroge Claude avec TA clé API et renvoie le texte au fil de l'eau.
// Ta clé Anthropic reste ici, dans les secrets Supabase : elle n'est jamais envoyée au téléphone.
//
// Secrets à définir (Supabase → Edge Functions → Secrets) :
//   ANTHROPIC_API_KEY  (obligatoire) ta clé sk-ant-...
//   ALLOWED_EMAILS     (obligatoire) e-mails autorisés, séparés par des virgules. Vide = personne (sécurité).
//   DAILY_LIMIT        (facultatif)  nombre d'appels par personne et par jour, 30 par défaut.
//   BIDOU_MODEL        (facultatif)  modèle Claude, claude-sonnet-5-5 par défaut.
//   ALLOWED_ORIGINS    (facultatif)  sites autorisés à appeler la fonction, séparés par des virgules.
//                                    Par défaut : https://lampadwair.github.io (+ localhost pour tester).
//
// Elle sait aussi lire une recette depuis un lien (action "url") : elle télécharge la page,
// cherche la recette au format standard schema.org (Marmiton, 750g, la plupart des blogs) et la renvoie.
// Cette partie n'utilise pas Claude ; si la page n'a pas ce format, elle renvoie le texte de la page
// et l'appli demande à Claude de le mettre en forme.

const MODEL = Deno.env.get("BIDOU_MODEL") || "claude-sonnet-5-5";
const DAILY = Number(Deno.env.get("DAILY_LIMIT") || "30");
const ALLOWED = (Deno.env.get("ALLOWED_EMAILS") || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

const SYSTEM =
  "Tu es le chef de Bidou, une application française de planification de repas maison. " +
  "Tu écris des recettes équilibrées, réalistes et gourmandes, en français. " +
  "Tu réponds uniquement avec le JSON demandé, sans texte avant ni après, sans bloc de code.";

// Seul le site de Bidou peut appeler la fonction depuis un navigateur (les autres sites sont refusés).
const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "https://lampadwair.github.io")
  .split(",").map((s) => s.trim().replace(/\/+$/, "").toLowerCase()).filter(Boolean);
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const originOk = (o: string) => ORIGINS.includes(o.toLowerCase()) || LOCAL.test(o);
const CORS: Record<string, string> = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  if (origin && !originOk(origin)) return json(403, { error: "origin_not_allowed" });
  const res = await handle(req);
  if (origin) res.headers.set("Access-Control-Allow-Origin", origin);
  return res;
});

async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  // 1. Qui appelle ? On demande à Supabase Auth de valider le jeton de la personne.
  const auth = req.headers.get("Authorization") || "";
  const anon = req.headers.get("apikey") || "";
  if (!auth.startsWith("Bearer ") || !anon) return json(401, { error: "not_signed_in" });
  const ures = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: anon, Authorization: auth } });
  if (!ures.ok) return json(401, { error: "not_signed_in" });
  const user = await ures.json();
  const email = String(user?.email || "").toLowerCase();
  // Fermé par défaut : seuls les e-mails listés ET confirmés peuvent utiliser ta clé Claude.
  if (!ALLOWED.length || !ALLOWED.includes(email)) return json(403, { error: "not_allowed" });
  if (!user?.email_confirmed_at) return json(403, { error: "email_not_confirmed" });

  // 2. Limite d'appels par jour.
  const cres = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bidou_bump_usage`, {
    method: "POST",
    headers: { apikey: anon, Authorization: auth, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!cres.ok) return json(500, { error: "usage_counter_failed" });
  const count = Number(await cres.json());
  if (count > DAILY) return json(429, { error: "daily_limit" });

  // 3. La demande.
  let body: { prompt?: unknown; max_tokens?: unknown; action?: unknown; url?: unknown };
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
  if (body.action === "url") return await importUrl(body.url);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json(500, { error: "missing_anthropic_key" });
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  if (!prompt || prompt.length > 40000) return json(400, { error: "bad_prompt" });
  const maxTokens = Math.min(Math.max(Number(body.max_tokens) || 8000, 500), 16000);

  // 4. Appel à Claude en streaming, renvoyé à l'appli sous forme de texte brut.
  const up = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      stream: true,
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!up.ok || !up.body) {
    const detail = await up.text().catch(() => "");
    console.error("anthropic", up.status, detail.slice(0, 500));
    return json(up.status === 429 ? 429 : 502, { error: "claude_unavailable" });
  }

  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = up.body!.getReader();
      let buf = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, i).trim();
            buf = buf.slice(i + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const ev = JSON.parse(data);
              if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta") {
                controller.enqueue(enc.encode(ev.delta.text));
              } else if (ev.type === "error") {
                controller.enqueue(enc.encode(`\n[[BIDOU_ERROR:${ev.error?.type || "error"}]]`));
              }
            } catch { /* ligne incomplète ignorée */ }
          }
        }
      } catch (e) {
        console.error("stream", e);
        controller.enqueue(enc.encode("\n[[BIDOU_ERROR:stream]]"));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

// ---------------------------------------------------------------------------------------------
// Import d'une recette depuis un lien.
// Garde-fous : http(s) uniquement, pas d'adresse IP en dur ni de nom local, pas d'IP privée après
// résolution DNS, ports 80/443, 4 redirections au plus (chacune revérifiée), 10 s et 3 Mo maximum.

const PRIV4 = [/^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^19[89]\.1[89]\./, /^2(2[4-9]|[3-5]\d)\./];

function badHost(h: string) {
  h = h.toLowerCase().replace(/\.$/, "");
  if (!h || !h.includes(".") || h === "localhost") return true;
  if (/\.(localhost|local|internal|lan|home|arpa|corp)$/.test(h)) return true;
  if (/^[\d.]+$/.test(h) || h.includes(":") || h.startsWith("[")) return true; // adresse IP en dur
  return false;
}

async function resolvesPrivate(h: string) {
  try {
    const a = await Deno.resolveDns(h, "A");
    if (a.some((ip) => PRIV4.some((re) => re.test(ip)))) return true;
  } catch { /* pas d'IPv4 ou résolution indisponible */ }
  try {
    const a6 = await Deno.resolveDns(h, "AAAA");
    if (a6.some((ip) => /^(::1?$|::ffff:|f[cd]|fe[89ab])/i.test(ip))) return true;
  } catch { /* pas d'IPv6 */ }
  return false;
}

function decode(t: string) {
  return t.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;|&rsquo;/g, "’")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}
const clean = (x: unknown, max = 600) => decode(String(x ?? "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim().slice(0, max);

// deno-lint-ignore no-explicit-any
function findRecipe(x: any, d = 0): any {
  if (!x || typeof x !== "object" || d > 6) return null;
  if (Array.isArray(x)) { for (const y of x) { const r = findRecipe(y, d + 1); if (r) return r; } return null; }
  const t = x["@type"];
  if (t === "Recipe" || (Array.isArray(t) && t.includes("Recipe"))) return x;
  for (const k of ["@graph", "mainEntity", "mainEntityOfPage", "itemListElement"]) {
    const r = findRecipe(x[k], d + 1); if (r) return r;
  }
  return null;
}

// deno-lint-ignore no-explicit-any
function steps(x: any, out: string[] = [], d = 0): string[] {
  if (!x || d > 6 || out.length >= 40) return out;
  if (typeof x === "string") { for (const l of x.split(/\n+/)) { const c = clean(l, 900); if (c) out.push(c); } return out; }
  if (Array.isArray(x)) { for (const y of x) steps(y, out, d + 1); return out; }
  if (typeof x === "object") {
    if (x.itemListElement) return steps(x.itemListElement, out, d + 1);
    if (typeof x.text === "string") return steps(x.text, out, d + 1);
    if (typeof x.name === "string") return steps(x.name, out, d + 1);
  }
  return out;
}

function fromHtml(html: string) {
  const blocks = [...html.matchAll(/<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    const raw = b[1].replace(/^\s*(<!--|<!\[CDATA\[)|(-->|\]\]>)\s*$/g, "");
    // deno-lint-ignore no-explicit-any
    let data: any = null;
    try { data = JSON.parse(raw); } catch { try { data = JSON.parse(raw.replace(/[\u0000-\u001f]+/g, " ")); } catch { continue; } }
    const r = findRecipe(data);
    if (!r) continue;
    const ing = (Array.isArray(r.recipeIngredient) ? r.recipeIngredient : Array.isArray(r.ingredients) ? r.ingredients : [])
      .slice(0, 60).map((x: unknown) => clean(x, 200)).filter(Boolean);
    if (!ing.length) continue;
    const y = Array.isArray(r.recipeYield) ? r.recipeYield.join(" ") : r.recipeYield;
    return {
      recipe: {
        name: clean(r.name, 120), description: clean(r.description, 300), recipeIngredient: ing,
        recipeInstructions: steps(r.recipeInstructions), recipeYield: clean(y, 60),
        prepTime: clean(r.prepTime, 30), cookTime: clean(r.cookTime, 30), totalTime: clean(r.totalTime, 30),
        calories: clean(r.nutrition?.calories, 30),
      },
    };
  }
  // Pas de recette structurée : on renvoie le texte lisible de la page (l'appli le confie à Claude).
  const title = clean((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1], 160);
  const body = html.replace(/<(script|style|noscript|svg|nav|header|footer|form|iframe|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|li|h\d|div|tr)>/gi, "\n").replace(/<[^>]*>/g, " ");
  const text = decode(body).replace(/[ \t\r\f]+/g, " ").replace(/\n\s*\n+/g, "\n").trim().slice(0, 15000);
  return text.length > 200 ? { text: (title ? title + "\n\n" : "") + text } : null;
}

async function importUrl(raw: unknown) {
  let u: URL;
  try { u = new URL(String(raw ?? "").trim()); } catch { return json(400, { error: "bad_url" }); }
  for (let hop = 0; hop < 5; hop++) {
    if (!/^https?:$/.test(u.protocol) || u.username || u.password || (u.port && u.port !== "80" && u.port !== "443") ||
        badHost(u.hostname) || await resolvesPrivate(u.hostname)) return json(400, { error: "bad_url" });
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 10000);
    try {
      const res = await fetch(u, {
        redirect: "manual", signal: ctl.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Bidou/1.0; recette pour usage personnel)", "Accept": "text/html,application/xhtml+xml", "Accept-Language": "fr-FR,fr;q=0.9" },
      });
      const loc = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && loc) { await res.body?.cancel(); u = new URL(loc, u); continue; }
      if (!res.ok || !res.body) { await res.body?.cancel(); return json(502, { error: "fetch_failed", status: res.status }); }
      const ct = res.headers.get("content-type") || "";
      if (!/html/i.test(ct)) { await res.body.cancel(); return json(415, { error: "not_html" }); }
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); size += value.length;
        if (size > 3_000_000) { await reader.cancel(); break; }
      }
      const all = new Uint8Array(size); let o = 0;
      for (const c of chunks) { all.set(c.subarray(0, Math.min(c.length, size - o)), o); o += c.length; if (o >= size) break; }
      let cs = (ct.match(/charset=([\w-]+)/i) || [])[1] || "utf-8";
      let html: string;
      try { html = new TextDecoder(cs).decode(all); } catch { cs = "utf-8"; html = new TextDecoder().decode(all); }
      const out = fromHtml(html);
      return out ? json(200, out) : json(422, { error: "no_recipe" });
    } catch (e) {
      console.error("import", String(e).slice(0, 200));
      return json(502, { error: "fetch_failed" });
    } finally {
      clearTimeout(timer);
    }
  }
  return json(502, { error: "too_many_redirects" });
}
