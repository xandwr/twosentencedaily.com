<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getDailyPrompt } from "$lib/promptGenerator";

	const prompt = getDailyPrompt();

	interface Submission {
		id: string;
		sentence1: string;
		sentence2: string;
		submitted_at: string;
	}

	let submissions = $state<Submission[]>([]);
	let loading = $state(true);

	async function loadSubmissions() {
		const { data } = await supabase
			.from("submissions")
			.select("id, sentence1, sentence2, submitted_at")
			.eq("prompt_date", prompt.date)
			.order("submitted_at", { ascending: true });

		submissions = data ?? [];
		loading = false;
	}

	loadSubmissions();
</script>

<div class="text-center bg-blue-500 p-4 w-full">
	<h2>
		Today's <span class="font-bold italic">{prompt.type}</span> stories about:
	</h2>
	<ul class="flex gap-x-16 font-semibold justify-center">
		{#each prompt.keywords as keyword}
			<li>{keyword}</li>
		{/each}
	</ul>
</div>

{#if loading}
	<p class="opacity-60">Loading...</p>
{:else if submissions.length === 0}
	<div class="bg-blue-400 w-full p-8 text-center">
		<p class="text-lg">No submissions yet today.</p>
		<p class="text-sm opacity-70">
			<a href="/" class="underline">Be the first!</a>
		</p>
	</div>
{:else}
	<div class="flex flex-col gap-y-4 w-full">
		{#each submissions as sub, i}
			<div class="bg-blue-400 p-6 w-full">
				<p class="text-sm opacity-50 mb-2">#{i + 1}</p>
				<p class="italic">{sub.sentence1}</p>
				<p class="italic">{sub.sentence2}</p>
			</div>
		{/each}
	</div>
{/if}
