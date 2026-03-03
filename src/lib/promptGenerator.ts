import keywordsData from './keywords.json';

// Story types — octonion basis
// Comedy = d0 (identity/real unit), the rest map to Fano plane points e1-e7
export const TYPES = [
	'comedy',   // d0 — identity
	'horror',   // e1
	'love',     // e2
	'grief',    // e3
	'mystery',  // e4
	'revenge',  // e5
	'wonder',   // e6
	'regret',   // e7
] as const;

export type StoryType = (typeof TYPES)[number];

// 600 keywords from embedding space, balanced across types
const KEYWORDS = keywordsData.map((k: { word: string }) => k.word);

// Deterministic PRNG seeded by date string
// Ensures everyone gets the same prompt on the same day
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

export interface DailyPrompt {
	type: StoryType;
	keywords: [string, string, string];
	date: string; // YYYY-MM-DD
}

export function getDailyPrompt(date: Date = new Date()): DailyPrompt {
	const dateStr = date.toISOString().split('T')[0];
	const rand = seededRandom(dateStr);

	// Pick type
	const typeIndex = Math.floor(rand() * TYPES.length);
	const type = TYPES[typeIndex];

	// Pick 3 unique keywords
	const available = [...KEYWORDS];
	const keywords: string[] = [];
	for (let i = 0; i < 3; i++) {
		const idx = Math.floor(rand() * available.length);
		keywords.push(available[idx]);
		available.splice(idx, 1);
	}

	return {
		type,
		keywords: keywords as [string, string, string],
		date: dateStr,
	};
}
