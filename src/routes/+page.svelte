<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getDailyPrompt } from "$lib/promptGenerator";
	import {
		getUser,
		getShowAuthPrompt,
		setShowAuthPrompt,
		signIn,
	} from "$lib/auth.svelte";
	import { onMount } from "svelte";

	const prompt = getDailyPrompt();

	let sentence1 = $state("");
	let sentence2 = $state("");
	let submitted = $state(false);
	let submitting = $state(false);
	let error = $state("");

	onMount(() => {
		const user = getUser();
		if (user) checkExistingSubmission();

		// Restore draft from before OAuth redirect and auto-submit
		const draft = localStorage.getItem("tsd_draft");
		if (draft && user) {
			const { sentence1: s1, sentence2: s2 } = JSON.parse(draft);
			localStorage.removeItem("tsd_draft");
			if (s1 && s2) {
				sentence1 = s1;
				sentence2 = s2;
				submit();
			}
		}
	});

	// Re-check when user changes (e.g. after OAuth redirect)
	$effect(() => {
		const user = getUser();
		if (user) {
			checkExistingSubmission();
			// Restore draft after auth
			const draft = localStorage.getItem("tsd_draft");
			if (draft) {
				const { sentence1: s1, sentence2: s2 } = JSON.parse(draft);
				localStorage.removeItem("tsd_draft");
				if (s1 && s2) {
					sentence1 = s1;
					sentence2 = s2;
					submit();
				}
			}
		}
	});

	async function checkExistingSubmission() {
		const user = getUser();
		if (!user) return;
		const { data } = await supabase
			.from("submissions")
			.select("id")
			.eq("user_id", user.id)
			.eq("prompt_date", prompt.date)
			.maybeSingle();
		if (data) submitted = true;
	}

	let score = $state<number | null>(null);
	let multiplier = $state<number | null>(null);

	async function submit() {
		if (!sentence1.trim() || !sentence2.trim()) return;

		const user = getUser();
		if (!user) {
			localStorage.setItem(
				"tsd_draft",
				JSON.stringify({ sentence1, sentence2 }),
			);
			setShowAuthPrompt(true);
			return;
		}

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

	function handleSignIn() {
		localStorage.setItem(
			"tsd_draft",
			JSON.stringify({ sentence1, sentence2 }),
		);
		signIn();
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

	{#if submitted}
		<div class="w-full text-center py-12 space-y-2">
			<p class="text-2xl font-semibold">Submitted</p>
			{#if multiplier !== null}
				<p class="text-lg font-mono">{multiplier.toFixed(1)}x</p>
				<p class="text-gray-400 text-sm">above random</p>
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

		{#if getShowAuthPrompt()}
			<div
				class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
			>
				<div
					class="bg-white p-8 rounded-2xl max-w-sm w-full mx-4 text-center space-y-4 shadow-lg"
				>
					<p class="font-semibold text-lg">Sign in to submit</p>
					<p class="text-sm text-gray-400">
						Your story will be submitted automatically.
					</p>
					<button
						onclick={handleSignIn}
						class="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
					>
						Sign in with Google
					</button>
					<button
						onclick={() => setShowAuthPrompt(false)}
						class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
