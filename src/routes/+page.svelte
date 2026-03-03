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

	async function ensurePromptExists() {
		const { error: err } = await supabase.from("daily_prompts").upsert(
			{
				date: prompt.date,
				type: prompt.type,
				keywords: prompt.keywords,
			},
			{ onConflict: "date" },
		);
		return err;
	}

	async function submit() {
		if (!sentence1.trim() || !sentence2.trim()) return;

		const user = getUser();
		if (!user) {
			// Stash draft before showing auth prompt
			localStorage.setItem(
				"tsd_draft",
				JSON.stringify({ sentence1, sentence2 }),
			);
			setShowAuthPrompt(true);
			return;
		}

		submitting = true;
		error = "";

		const promptErr = await ensurePromptExists();
		if (promptErr) {
			error = "Failed to initialize prompt. Try again.";
			submitting = false;
			return;
		}

		const { error: subErr } = await supabase.from("submissions").insert({
			user_id: user.id,
			prompt_date: prompt.date,
			sentence1: sentence1.trim(),
			sentence2: sentence2.trim(),
		});

		if (subErr) {
			if (subErr.code === "23505") {
				error = "You already submitted today!";
				submitted = true;
			} else {
				error = subErr.message;
			}
		} else {
			submitted = true;
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

<div class="text-center bg-blue-500 p-4 w-full">
	<h2>
		Write a two-sentence <span class="font-bold italic">{prompt.type}</span>
		story about:
	</h2>
	<ul class="flex gap-x-16 font-semibold justify-center">
		{#each prompt.keywords as keyword}
			<li>{keyword}</li>
		{/each}
	</ul>
</div>

{#if submitted}
	<div class="bg-blue-400 w-full p-8 text-center">
		<p class="text-xl font-bold">Submitted!</p>
		<p class="text-sm opacity-70">Come back tomorrow for a new prompt.</p>
	</div>
{:else}
	<div class="flex flex-col gap-y-2 w-full p-8 bg-blue-400">
		<div class="w-full">
			<h1 class="text-center font-bold">Sentence 1:</h1>
			<input
				class="border w-full"
				maxlength={150}
				bind:value={sentence1}
			/>
			<p class="text-right text-xs opacity-60">{sentence1.length}/150</p>
		</div>

		<div class="w-full">
			<h1 class="text-center font-bold">Sentence 2:</h1>
			<input
				class="border w-full"
				maxlength={150}
				bind:value={sentence2}
			/>
			<p class="text-right text-xs opacity-60">{sentence2.length}/150</p>
		</div>
	</div>

	{#if error}
		<p class="text-red-700 text-sm">{error}</p>
	{/if}

	<div>
		<button
			onclick={submit}
			disabled={submitting || !sentence1.trim() || !sentence2.trim()}
			class="border rounded-xl text-xl p-2 bg-blue-500 font-bold hover:bg-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{submitting ? "Submitting..." : "Submit"}
		</button>
	</div>

	{#if getShowAuthPrompt()}
		<div
			class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
		>
			<div
				class="bg-blue-200 p-6 rounded-xl max-w-sm text-center flex flex-col gap-y-4"
			>
				<p class="font-bold text-lg">
					You must be logged in to submit.
				</p>
				<p class="text-sm opacity-70">Log in now?</p>
				<button
					onclick={handleSignIn}
					class="border rounded-xl p-2 bg-blue-500 font-bold hover:bg-blue-300 transition-colors"
				>
					Sign in with Google
				</button>
				<button
					onclick={() => setShowAuthPrompt(false)}
					class="text-sm opacity-60 hover:opacity-100"
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}
{/if}
