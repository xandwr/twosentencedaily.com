# twosentencedaily.com

A daily writing game. Each day you get a story type and three keywords. Write a two-sentence story using them. Your score reflects how well your response aligns with the keywords.

Think Wordle, but for writing.

## How it works

1. A deterministic prompt is generated each day (seeded PRNG, so everyone gets the same prompt).
2. You write two sentences (150 characters each, max).
3. Your submission is scored using embedding-based semantic alignment against the keyword subspace.
4. Scores are displayed as a multiplier above random chance (e.g. "10.0x").

## Stack

- SvelteKit 5 + Tailwind v4
- Supabase (auth, database, edge functions)
- Vercel (hosting)
- OpenRouter (embeddings via Qwen3-Embedding-8B)

## Development

```sh
npm install
npm run dev
```

## Building

```sh
npm run build
```

## Supabase

Edge functions live in `supabase/functions/`. The `submit` function handles scoring server-side so the embedding math stays out of the client.

Supabase secrets required:
- `OPENROUTER_API_KEY`
- `SUPABASE_URL` (set automatically)
- `SUPABASE_SERVICE_ROLE_KEY` (set automatically)

## License

All rights reserved.
