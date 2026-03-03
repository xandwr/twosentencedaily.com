<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getDailyPrompt } from "$lib/promptGenerator";
	import { getUser, signIn } from "$lib/auth.svelte";
	const prompt = getDailyPrompt();

	let sentence1 = $state("");
	let sentence2 = $state("");
	let submitted = $state(false);
	let submitting = $state(false);
	let error = $state("");

	// Check on mount and when user changes (e.g. after OAuth redirect)
	$effect(() => {
		if (getUser()) checkExistingSubmission();
	});

	async function checkExistingSubmission() {
		const user = getUser();
		if (!user) return;
		const { data } = await supabase
			.from("submissions")
			.select("id, multiplier")
			.eq("user_id", user.id)
			.eq("prompt_date", prompt.date)
			.maybeSingle();
		if (data) {
			submitted = true;
			multiplier = data.multiplier;
		}
	}

	let score = $state<number | null>(null);
	let multiplier = $state<number | null>(null);
	let shared = $state(false);

	function shareText(mult: number): string {
		const clamped = Math.min(Math.max(mult, 0), 10);
		const full = Math.floor(clamped);
		const frac = clamped - full;
		const partial = frac >= 0.5 ? 1 : frac > 0 ? 1 : 0;
		const filled = "█".repeat(full);
		const mid = partial ? "▒" : "";
		const empty = "░".repeat(10 - full - partial);
		return `The Two-Sentence Daily | ${mult.toFixed(1)}x\n${filled}${mid}${empty}\ntwosentencedaily.com`;
	}

	async function share() {
		if (multiplier === null) return;
		await navigator.clipboard.writeText(shareText(multiplier));
		shared = true;
		setTimeout(() => (shared = false), 2000);
	}

	async function submit() {
		if (!sentence1.trim() || !sentence2.trim()) return;
		submitting = true;
		error = "";

		try {
			const { data, error: fnError } = await supabase.functions.invoke("submit", {
				body: {
					date: prompt.date,
					sentence1: sentence1.trim(),
					sentence2: sentence2.trim(),
				},
			});

			if (fnError) {
				// Try to parse error body
				const errBody = typeof fnError === "object" && "context" in fnError
					? fnError.context
					: fnError;
				const msg = data?.error || fnError.message || "Submission failed. Try again.";
				if (msg.includes("Already submitted")) {
					error = "You already submitted today!";
					submitted = true;
				} else {
					error = msg;
				}
			} else {
				submitted = true;
				score = data.score;
				multiplier = data.multiplier;
			}
		} catch (e) {
			error = "Network error. Try again.";
		}

		submitting = false;
	}

</script>

<div class="flex flex-col items-center gap-8">
	<!-- Prompt -->
	<div class="text-center space-y-3">
		<p class="text-gray-500 text-sm">Today's prompt</p>
		<h2 class="text-lg">
			Write a two-sentence
			<span class="font-semibold">{prompt.type}</span> story about:
		</h2>
		<div class="flex gap-4 justify-center">
			{#each prompt.keywords as keyword}
				<span
					class="px-3 py-1 bg-gray-100 text-sm font-medium rounded-full"
				>
					{keyword}
				</span>
			{/each}
		</div>
	</div>

	{#if !getUser()}
		<div class="w-full text-center py-12 space-y-4">
			<p class="text-sm text-gray-400">Sign in to play</p>
			<button
				onclick={signIn}
				class="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
			>
				Sign in with Google
			</button>
		</div>
	{:else if submitted}
		<div class="w-full text-center py-12 space-y-2">
			<p class="text-2xl font-semibold">Submitted</p>
			{#if multiplier !== null}
				<p class="text-lg font-mono">{multiplier.toFixed(1)}x</p>
				<p class="text-gray-400 text-sm">above random</p>
				<button
					onclick={share}
					class="mt-4 px-6 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
				>
					{shared ? "Copied!" : "Share"}
				</button>
			{/if}
			<p class="text-gray-400 text-sm">
				Come back tomorrow for a new prompt.
			</p>
		</div>
	{:else}
		<!-- Input -->
		<div class="w-full space-y-4">
			<div>
				<label
					for="s1"
					class="block text-xs font-medium text-gray-500 mb-1"
				>
					Sentence 1
				</label>
				<textarea
					id="s1"
					class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-gray-400 transition-colors"
					rows={2}
					maxlength={150}
					placeholder="Begin your story..."
					bind:value={sentence1}
				></textarea>
				<p class="text-right text-[11px] text-gray-300 mt-0.5">
					{sentence1.length}/150
				</p>
			</div>

			<div>
				<label
					for="s2"
					class="block text-xs font-medium text-gray-500 mb-1"
				>
					Sentence 2
				</label>
				<textarea
					id="s2"
					class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-gray-400 transition-colors"
					rows={2}
					maxlength={150}
					placeholder="End your story..."
					bind:value={sentence2}
				></textarea>
				<p class="text-right text-[11px] text-gray-300 mt-0.5">
					{sentence2.length}/150
				</p>
			</div>
		</div>

		{#if error}
			<p class="text-red-500 text-sm">{error}</p>
		{/if}

		<button
			onclick={submit}
			disabled={submitting || !sentence1.trim() || !sentence2.trim()}
			class="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
		>
			{submitting ? "Submitting..." : "Submit"}
		</button>
	{/if}
</div>
