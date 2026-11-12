// Bidou : fonction « bidou-chef ». Elle reçoit une demande de l'appli, vérifie que la personne est connectée
// (et autorisée), compte ses appels du jour, puis interroge Claude avec TA clé API et renvoie le texte au fil de l'eau.
// Ta clé Anthropic reste ici, dans les secrets Supabase : elle n'est jamais envoyée au téléphone.
//
// Secrets à définir (Supabase → Edge Functions → Secrets) :
//   ANTHROPIC_API_KEY  (obligatoire) ta clé sk-ant-...
//   ALLOWED_EMAILS     (obligatoire) e-mails autorisés, séparés par des virgules. Vide = personne (sécurité).
//   DAILY_LIMIT        (facultatif)  nombre d'appels par personne et par jour, 30 par défaut.
//   BIDOU_MODEL        (facultatif)  modèle Claude, claude-sonnet-5-5 par défaut.

const MODEL = Deno.env.get("BIDOU_MODEL") || "claude-sonnet-5-5";
const DAILY = Number(Deno.env.get("DAILY_LIMIT") || "30");
const ALLOWED = (Deno.env.get("ALLOWED_EMAILS") || "")
  .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

const SYSTEM =
  "Tu es le chef de Bidou, une application française de planification de repas maison. " +
  "Tu écris des recettes équilibrées, réalistes et gourmandes, en français. " +
  "Tu réponds uniquement avec le JSON demandé, sans texte avant ni après, sans bloc de code.";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json(500, { error: "missing_anthropic_key" });

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
  let body: { prompt?: unknown; max_tokens?: unknown };
  try { body = await req.json(); } catch { return json(400, { error: "bad_json" }); }
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
});
