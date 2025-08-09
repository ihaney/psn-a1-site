import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

// Env vars injected at deploy time
const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiKey    = Deno.env.get("OPENAI_API_KEY")!;
const sb           = createClient(supabaseUrl, serviceKey);
const oai          = new OpenAI({ apiKey: openaiKey });

serve(async req => {
  try {
    // The trigger’s POST body is the NEW row JSON
    const record = await req.json();

    // 1) Embed the product title
    const text = `${record.Product_Title ?? ""}`;
    const emb  = (await oai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })).data[0].embedding;

    // 2) Find the nearest taxonomy node
    const { data: [match], error } = await sb.rpc("match_taxonomy", { emb, k: 1 });
    if (error) throw error;

    // 3) Update the Products row with prediction
    await sb.from("Products").update({
      predicted_category_id: match.id,
      predicted_score:       match.score,
      label_source:          "model",
    }).eq("Product_ID", record.Product_ID);

    return new Response("ok");
  } catch (err) {
    console.error("categorize function error:", err);
    return new Response("error", { status: 500 });
  }
});
