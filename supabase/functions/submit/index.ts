import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// --- Prompt generation (must match client exactly) ---

const TYPES = [
  "comedy",
  "horror",
  "love",
  "grief",
  "mystery",
  "revenge",
  "wonder",
  "regret",
] as const;

// prettier-ignore
const KEYWORDS = ["abjectness","absence","abused","acrimony","actresses","admits","adversity","affability","afterthought","aliveness","altruism","amazes","ambushing","amends","amorously","amour","amuse","amusing","androgyny","anomalies","anomalous","anonymous","artistry","artwork","ask","askance","asking","astonishing","astounded","atones","attack","attacked","audiences","autism","autopsies","awakening","awestruck","awfulness","backlashes","banality","battering","bawls","befuddled","befuddlement","begrudges","behave","behaved","beheading","bemusement","bemuses","benevolence","berating","betrays","bewildering","bewilderment","biopics","bitterly","blame","blamed","blankly","bliss","blissfulness","bloodiest","bloodthirsty","blowjob","blowjobs","blunder","boggled","boggles","boggling","brooding","bug","burden","burdened","burying","caressing","caricatures","caring","carnality","casualties","character","chastise","cherished","childbirths","chuckled","circumstance","civvies","clownishness","clueless","comedienne","compensated","compulsion","condemnation","confess","confounded","confusedly","confuser","confusing","conjuring","conscience","consoling","conspiracy","contemning","contemplate","contemplated","contemplates","conundrums","convicting","cordiality","courtesies","coven","craven","creation","creep","creepers","cudgeling","curiosities","curiousness","curses","deadening","deadheading","dejectedly","deliberate","deliberated","demised","deplore","depressions","derisiveness","descries","descry","desecrate","desires","despaired","despondently","destinies","destroying","detective","detectives","dethronement","devils","devoted","dialogues","diffidence","dignity","dilemma","disappeared","disappearing","disappears","disbelief","discover","disguised","dishonoring","dislike","disowning","disrespect","distressful","distrust","disturbed","docudrama","docudramas","doubted","dramatist","dramatists","dramatizing","drowning","dumbfounded","eeriness","ejaculation","elusive","embalms","enamored","endearment","endearments","engulfment","entertained","entitlement","entomology","enviousness","erasure","esoteric","ethological","ethology","eulogized","euthanasia","euthanizing","evils","excoriated","executed","executions","exhumation","exoneration","expiation","explanation","explanations","exploitation","faddiness","fairness","familiarity","farce","fascinated","fatalism","fate","fearfully","fetish","filmmakers","flashback","flirt","flirtations","flowers","fondest","forget","forgetfully","forgettable","forgetting","forgiving","forgone","forgotten","formaldehyde","forsake","forsaking","friskiness","frowning","fun","funnyman","gaped","gayness","generousness","ghoulishly","gift","gifts","giggle","giggles","girlfriend","girlfriends","giving","gladness","glances","glee","gloating","glum","god","godliness","grandiosity","graved","gravest","greed","gremlins","grievances","grimiest","grudging","gruesomer","guiltier","guiltless","habit","harass","harshness","hatefulness","hating","hatreds","havoc","heartbeats","heartbroken","heartiest","heavyhearted","hellish","hesitate","hides","hiding","histories","hoax","hoaxes","holocaust","holocausts","homicide","honesty","honoring","hookups","horrifying","hostile","hugged","hugs","humiliated","humility","hypnotic","hysterical","identity","idly","illusions","imaginations","imagine","imagined","imagining","imaginings","immobility","impalement","inanity","indecision","indiscretion","infanticide","inhumanity","inquired","inquires","inquiring","inquiringly","inquiry","intercourse","intoxication","intrigue","investigate","investigates","invisible","irksomeness","irreverent","irritability","jealousies","jocularity","jokers","joking","journalism","kill","killers","lament","laughs","lesbianism","libeling","lifelessly","lingered","living","lonely","longing","losses","loutishness","lovable","loyalism","loyalties","luring","lusts","madly","maltreatment","marry","masochism","matrimony","media","memorability","mind","minds","miniseries","miracle","mirthless","miscarried","miscarries","miscued","miscues","misgivings","misspend","misstep","mocking","monologues","monstrosity","monstrous","morphine","motherhood","mummifying","mused","music","musicals","musingly","mutiny","muzzling","mystical","mystified","necrotic","negligence","nonplussed","numbing","obedience","obfuscated","obituaries","objurgations","oblivion","obscured","obscures","observation","obsessions","occult","oddities","oneness","ordeal","ordeals","orgasm","outcry","pained","pantomimes","parodist","pasts","pejoration","perpetrating","perplexed","perplexedly","perplexes","perplexing","perplexingly","perplexities","persecute","petting","phantom","phantoms","phenomenon","phobias","playfully","playfulness","playwrights","plunder","ponderous","ponderously","possessed","posterity","prankster","preciousness","probing","protection","psychiatric","psychiatry","psychology","psychotropic","puppetry","questionably","questioned","questionings","quizzically","racism","random","rap","ratting","rebelling","reckon","recollects","reconsiders","reelect","reevaluate","reevaluation","regrettably","rejection","religion","remains","remembering","remembers","remissness","repay","repentant","repented","reprehension","reprieving","reprise","rethink","retrospects","revealed","reveals","reverted","rivalry","romanticize","rotting","rudeness","ruin","rumination","ruminations","sadists","sardonic","satanism","satiric","satirically","satirize","satirizing","savageness","savoriness","scared","scarified","scarify","scarper","scripts","secreting","seduction","selfish","selflessness","sentencing","sentimental","shadow","shadows","shameful","shiver","shocked","shuddering","sigh","sins","skeptical","skeptically","skepticism","slayings","smiles","snuggle","snuggles","snuggling","sociology","solitude","soullessly","soulmate","spanked","speechless","spirits","spookier","spooking","squalidness","stabbed","stares","starvation","stillbirth","stumping","stunned","stupidity","superheroes","superheros","supernatural","surprised","surprising","suspect","suspicious","sweethearts","symbolic","sympathetic","tangled","tastefulness","tattlers","taunted","tearaways","temptation","terribleness","terrifies","theatrical","thinkers","thinking","thinks","thought","thoughtless","threatening","tormentors","tortured","traumatized","traumatizes","travails","trickery","trickiness","truelove","trumpery","trustfulness","truthfulness","twilight","twilled","ugliness","unanswerable","uncertainty","uncovers","undercover","unexpected","unexplored","unfairest","unfamiliar","unknowable","unknowings","unlearn","unlovely","unpleasant","unruliness","unspecified","untoward","unusual","unveiled","unwonted","vanished","vaudeville","veneration","vicarious","villains","visions","vomits","voodooism","warmness","weird","weirdies","werewolf","werewolves","whodunits","witch","witticism","worried","wreaking","wrestling","writers","wrongdoings","wrongness","wry"];

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return (hash >>> 0) / 4294967296;
  };
}

function getDailyPrompt(dateStr: string) {
  const rand = seededRandom(dateStr);
  const typeIndex = Math.floor(rand() * TYPES.length);
  const type = TYPES[typeIndex];
  const available = [...KEYWORDS];
  const keywords: string[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(rand() * available.length);
    keywords.push(available[idx]);
    available.splice(idx, 1);
  }
  return { type, keywords: keywords as [string, string, string], date: dateStr };
}

// --- Linear algebra (tiny 3x3, no dependencies needed) ---

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function vecNorm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

function normalize(v: number[]): number[] {
  const n = vecNorm(v);
  return n > 0 ? v.map((x) => x / n) : v;
}

/** Compute covariance matrix of rows (each row is an embedding vector) */
function covarianceMatrix(vecs: number[][]): number[][] {
  const n = vecs.length;
  const dim = vecs[0].length;

  // Mean vector
  const mean = new Array(dim).fill(0);
  for (const v of vecs) for (let i = 0; i < dim; i++) mean[i] += v[i] / n;

  // Center
  const centered = vecs.map((v) => v.map((x, i) => x - mean[i]));

  // Covariance: C = (1/n) * centered^T * centered → dim x dim
  // But we want the 3x3 covariance of the 3 vectors as points in embedding space
  // Actually: we want the covariance of the keyword embeddings as 3 points
  // The subspace they span is at most 3D (really 2D since 3 points define a plane)
  // We compute the 3x3 Gram matrix and extract eigenvectors, then map back to full space
  const gram: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const d = dot(centered[i], centered[j]);
      gram[i][j] = d / n;
      gram[j][i] = d / n;
    }
  }
  return gram;
}

/** Power iteration for eigenvectors of a small symmetric matrix */
function eigendecomposition(
  mat: number[][],
  numVecs: number = 3
): { values: number[]; vectors: number[][] } {
  const n = mat.length;
  const values: number[] = [];
  const vectors: number[][] = [];

  // Work on a copy so we can deflate
  const A = mat.map((row) => [...row]);

  for (let k = 0; k < Math.min(numVecs, n); k++) {
    // Power iteration
    let v = Array.from({ length: n }, () => Math.random());
    v = normalize(v);

    for (let iter = 0; iter < 100; iter++) {
      const Av = new Array(n).fill(0);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) Av[i] += A[i][j] * v[j];
      v = normalize(Av);
    }

    // Eigenvalue = v^T A v
    const Av = new Array(n).fill(0);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) Av[i] += A[i][j] * v[j];
    const eigenvalue = dot(v, Av);

    values.push(eigenvalue);
    vectors.push(v);

    // Deflate: A = A - eigenvalue * v * v^T
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) A[i][j] -= eigenvalue * v[i] * v[j];
  }

  return { values, vectors };
}

/**
 * Map Gram-space eigenvectors back to full embedding space.
 * If gram eigenvector is [a, b, c] and centered embeddings are [e1, e2, e3],
 * the full-space eigenvector is a*e1 + b*e2 + c*e3 (normalized).
 */
function gramToFullSpace(
  gramVectors: number[][],
  centeredEmbeddings: number[][]
): number[][] {
  const dim = centeredEmbeddings[0].length;
  return gramVectors.map((gv) => {
    const full = new Array(dim).fill(0);
    for (let i = 0; i < gv.length; i++) {
      for (let d = 0; d < dim; d++) {
        full[d] += gv[i] * centeredEmbeddings[i][d];
      }
    }
    return normalize(full);
  });
}

// --- Embedding via OpenRouter ---

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;

async function embed(texts: string[]): Promise<number[][]> {
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3-embedding-8b",
      input: texts,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter embedding failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  // Sort by index to ensure correct order
  const sorted = json.data.sort((a: any, b: any) => a.index - b.index);
  return sorted.map((d: any) => d.embedding);
}

// --- LLM Grading ---

const GRADING_SYSTEM_PROMPT = `You are the judge for Two Sentence Daily — a creative writing game where players craft a two-sentence story (max 150 characters per sentence) from a story type and three keywords.

The keywords are thematic anchors, not vocabulary requirements. A story that never uses the word "betrays" but makes you FEEL betrayal is better than one that shoehorns it in. Reward subtlety and nuance over literal keyword stuffing.

The submission has already been scored on semantic alignment with the keywords (provided as xMult — higher means the embedding is closer to the keyword subspace). Factor this into your assessment, but weight craft and creativity equally.

Evaluate:
- **Thematic resonance**: Do the keywords live in the story as feelings, images, or tensions — not just vocabulary?
- **Genre craft**: Does it genuinely evoke the target type? Horror should unsettle, comedy should land, grief should ache.
- **Structure**: The two-sentence constraint is the game. Did they use it — setup/payoff, tension/release, misdirection/reveal?
- **Economy**: Every word costs precious characters. No filler, no wasted motion.

Be honest but not cruel. This is a game people play for fun.

IMPORTANT: Keep feedback concise — aim for 3-5 short sentences total across all categories. Do NOT write paragraph-length analysis for each criterion. Hit the key insight for each and move on.

Respond with ONLY a JSON object in this exact format (no other text):
{"grade": "<one of: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F>", "feedback": "<your feedback>"}`;

const VALID_GRADES = new Set(["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"]);

async function gradeSubmission(
  type: string,
  keywords: string[],
  xMult: number,
  sentence1: string,
  sentence2: string,
): Promise<{ grade: string; feedback: string }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-haiku-4.5",
      messages: [
        { role: "system", content: GRADING_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Type: ${type}\nKeywords: ${keywords.join(", ")}\nxMult: ${xMult.toFixed(2)}\n\nSubmission:\n${sentence1}\n${sentence2}\n\nJudge this submission.`,
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`LLM grading failed (${res.status}): ${body}`);
    return { grade: "?", feedback: "Grading temporarily unavailable." };
  }

  const json = await res.json();
  const choice = json.choices?.[0];
  const content = choice?.message?.content;
  if (choice?.finish_reason === "length") {
    console.warn("LLM grading was truncated (hit max_tokens)");
  }
  if (!content) {
    console.error("LLM grading returned no content:", JSON.stringify(json));
    return { grade: "?", feedback: "Grading temporarily unavailable." };
  }

  try {
    // Strip markdown fences if present
    const cleaned = content.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!parsed.grade || !parsed.feedback || !VALID_GRADES.has(parsed.grade)) {
      console.error("LLM grading invalid structure:", parsed);
      return { grade: "?", feedback: "Grading temporarily unavailable." };
    }
    return { grade: parsed.grade, feedback: parsed.feedback };
  } catch {
    console.error("LLM grading JSON parse failed:", content);
    return { grade: "?", feedback: "Grading temporarily unavailable." };
  }
}

// --- Scoring ---

function computeScore(
  responseEmbedding: number[],
  eigenvectors: number[],  // flat array stored in DB
  eigenvalues: number[]
): number {
  const dim = responseEmbedding.length;
  const numVecs = eigenvalues.length;

  // Unflatten eigenvectors
  const evecs: number[][] = [];
  for (let i = 0; i < numVecs; i++) {
    evecs.push(eigenvectors.slice(i * dim, (i + 1) * dim));
  }

  // Project response onto the keyword subspace (span of eigenvectors)
  // Only use eigenvectors with non-negligible eigenvalues
  const proj = new Array(dim).fill(0);
  for (let i = 0; i < numVecs; i++) {
    if (Math.abs(eigenvalues[i]) < 1e-10) continue;
    const coeff = dot(responseEmbedding, evecs[i]);
    for (let d = 0; d < dim; d++) proj[d] += coeff * evecs[i][d];
  }

  // Score = ||projection|| / ||response||
  // Cosine of the angle between response and the subspace
  const projNorm = vecNorm(proj);
  const respNorm = vecNorm(responseEmbedding);
  if (respNorm === 0) return 0;

  return projNorm / respNorm;
}

// --- Supabase client ---

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// --- Main handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Verify JWT from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid token" }, 401);
    }

    const body = await req.json();
    const { date, sentence1, sentence2 } = body;

    if (!date || !sentence1 || !sentence2) {
      return jsonResponse({ error: "Missing date, sentence1, or sentence2" }, 400);
    }

    if (sentence1.length > 150 || sentence2.length > 150) {
      return jsonResponse({ error: "Sentences must be 150 characters or less" }, 400);
    }

    // Check for existing submission
    const { data: existing } = await supabaseAdmin
      .from("submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("prompt_date", date)
      .maybeSingle();

    if (existing) {
      return jsonResponse({ error: "Already submitted today" }, 409);
    }

    // Generate prompt deterministically (same as client)
    const prompt = getDailyPrompt(date);

    // Check if geometry is cached
    let { data: cached } = await supabaseAdmin
      .from("daily_prompts")
      .select("eigenvectors, eigenvalues")
      .eq("date", date)
      .maybeSingle();

    let eigenvectorsFlat: number[];
    let eigenvalues: number[];

    if (cached?.eigenvectors && cached?.eigenvalues) {
      // Cache hit
      eigenvectorsFlat = cached.eigenvectors;
      eigenvalues = cached.eigenvalues;
    } else {
      // Cache miss — compute geometry
      console.log(`Computing geometry for ${date}`);

      // Embed the 3 keywords
      const keywordEmbeddings = await embed(prompt.keywords);
      const dim = keywordEmbeddings[0].length;

      // Compute mean
      const mean = new Array(dim).fill(0);
      for (const v of keywordEmbeddings)
        for (let i = 0; i < dim; i++) mean[i] += v[i] / 3;

      // Center
      const centered = keywordEmbeddings.map((v) =>
        v.map((x, i) => x - mean[i])
      );

      // Gram matrix (3x3)
      const gram = covarianceMatrix(keywordEmbeddings);

      // Eigenvectors in Gram space
      const { values, vectors: gramVecs } = eigendecomposition(gram);

      // Map back to full embedding space
      const fullEigenvectors = gramToFullSpace(gramVecs, centered);

      // Flatten for storage
      eigenvectorsFlat = fullEigenvectors.flat();
      eigenvalues = values;

      // Upsert daily_prompts with geometry
      await supabaseAdmin.from("daily_prompts").upsert(
        {
          date: prompt.date,
          type: prompt.type,
          keywords: prompt.keywords,
          keyword_embeddings: keywordEmbeddings.flat(),
          eigenvectors: eigenvectorsFlat,
          eigenvalues: eigenvalues,
        },
        { onConflict: "date" }
      );
    }

    // Embed the response
    const responseText = `${sentence1.trim()} ${sentence2.trim()}`;
    const [responseEmbedding] = await embed([responseText]);

    // Compute score
    const score = computeScore(responseEmbedding, eigenvectorsFlat, eigenvalues);
    const dim = responseEmbedding.length;
    const baseline = Math.sqrt(2 / dim);
    const multiplier = score / baseline;

    // LLM grading
    const { grade, feedback } = await gradeSubmission(
      prompt.type,
      prompt.keywords,
      multiplier,
      sentence1.trim(),
      sentence2.trim(),
    );

    // Insert submission with multiplier as score and LLM grade
    const { error: insertError } = await supabaseAdmin
      .from("submissions")
      .insert({
        user_id: user.id,
        prompt_date: date,
        sentence1: sentence1.trim(),
        sentence2: sentence2.trim(),
        score: multiplier,
        llm_grade: grade,
        llm_feedback: feedback,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return jsonResponse({ error: "Already submitted today" }, 409);
      }
      throw insertError;
    }

    // Also ensure daily_prompts row exists (without geometry if it was cached)
    if (!cached) {
      // Already upserted above
    } else {
      // Make sure the prompt row exists
      await supabaseAdmin.from("daily_prompts").upsert(
        {
          date: prompt.date,
          type: prompt.type,
          keywords: prompt.keywords,
        },
        { onConflict: "date" }
      );
    }

    return jsonResponse({ score, multiplier, grade, feedback, date: prompt.date });
  } catch (err) {
    console.error("Submit error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Internal error" },
      500
    );
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
