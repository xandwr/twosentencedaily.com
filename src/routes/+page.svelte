<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getDailyPrompt } from "$lib/promptGenerator";
	import { getUser, signIn } from "$lib/auth.svelte";
	import { renderFeedback } from "$lib/renderFeedback";
	import KeywordBubbles from "$lib/components/KeywordBubbles.svelte";
	import GradeDisplay from "$lib/components/GradeDisplay.svelte";
	import SentenceInput from "$lib/components/SentenceInput.svelte";
	import LoadingSkeleton from "$lib/components/LoadingSkeleton.svelte";
	const prompt = getDailyPrompt();

	let sentence1 = $state("");
	let sentence2 = $state("");
	let submitted = $state(false);
	let submitting = $state(false);
	let error = $state("");
	let checked = $state(false);

	// Check on mount and when user changes (e.g. after OAuth redirect)
	$effect(() => {
		if (getUser()) checkExistingSubmission();
	});

	async function checkExistingSubmission() {
		const user = getUser();
		if (!user) return;
		const { data } = await supabase
			.from("submissions")
			.select("id, sentence1, sentence2, score, llm_grade, llm_feedback")
			.eq("user_id", user.id)
			.eq("prompt_date", prompt.date)
			.maybeSingle();
		if (data) {
			submitted = true;
			sentence1 = data.sentence1 ?? "";
			sentence2 = data.sentence2 ?? "";
			multiplier = data.score;
			grade = data.llm_grade;
			feedback = data.llm_feedback;
		}
		checked = true;
	}

	let score = $state<number | null>(null);
	let multiplier = $state<number | null>(null);
	let grade = $state<string | null>(null);
	let feedback = $state<string | null>(null);
	let shared = $state(false);

	function shareText(g: string): string {
		const scorePart = multiplier ? ` | ${multiplier.toFixed(1)}x` : '';
		return `The Two-Sentence Daily | ${g}${scorePart}\ntwosentencedaily.com`;
	}

	async function share() {
		if (!grade) return;
		await navigator.clipboard.writeText(shareText(grade));
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
				grade = data.grade;
				feedback = data.feedback;
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
		<p class="text-gray-500 text-lg">{prompt.date}</p>
		<h2 class="text-lg">
			Write a two-sentence
			<span class="font-semibold">{prompt.type}</span> story about:
		</h2>
		<KeywordBubbles keywords={prompt.keywords} />
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
	{:else if !checked}
		<LoadingSkeleton lines={1} />
	{:else if submitted}
		<div class="w-full text-center py-12 space-y-4">
			{#if sentence1 || sentence2}
				<div class="text-left text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 italic">
					{#if sentence1}<p>{sentence1}</p>{/if}
					{#if sentence2}<p class="mt-1">{sentence2}</p>{/if}
				</div>
			{/if}
			{#if grade}
				<GradeDisplay {grade} score={multiplier} size="lg" />
			{:else}
				<p class="text-2xl font-semibold">Submitted</p>
			{/if}
			{#if feedback}
				<div class="text-left text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">{@html renderFeedback(feedback)}</div>
			{/if}
			<button
				onclick={share}
				class="mt-2 px-6 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
			>
				{shared ? "Copied!" : "Share"}
			</button>
			<p class="text-gray-400 text-sm">
				Come back tomorrow for a new prompt.
			</p>
		</div>
	{:else}
		<!-- Input -->
		<div class="w-full space-y-4">
			<SentenceInput id="s1" label="Sentence 1" placeholder="Begin your story..." bind:value={sentence1} onsubmit={submit} />
			<SentenceInput id="s2" label="Sentence 2" placeholder="End your story..." bind:value={sentence2} onsubmit={submit} />
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
