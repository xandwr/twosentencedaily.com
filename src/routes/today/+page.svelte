<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getDailyPrompt } from "$lib/promptGenerator";
	import { getUser } from "$lib/auth.svelte";
	import { renderFeedback } from "$lib/renderFeedback";
	import { gradeRank } from "$lib/gradeRank";

	const prompt = getDailyPrompt();

	interface Submission {
		id: string;
		user_id: string;
		sentence1: string;
		sentence2: string;
		score: number | null;
		llm_grade: string | null;
		llm_feedback: string | null;
		submitted_at: string;
		display_name: string;
	}

	let submissions = $state<Submission[]>([]);
	let loading = $state(true);

	async function loadSubmissions() {
		const { data } = await supabase
			.from("submissions")
			.select("id, user_id, sentence1, sentence2, score, llm_grade, llm_feedback, submitted_at, profiles!submissions_profile_id_fkey(username, display_name)")
			.eq("prompt_date", prompt.date)
			.order("score", { ascending: false, nullsFirst: false });

		submissions = (data ?? []).map((s: any) => ({
			id: s.id,
			user_id: s.user_id,
			sentence1: s.sentence1,
			sentence2: s.sentence2,
			score: s.score,
			llm_grade: s.llm_grade,
			llm_feedback: s.llm_feedback,
			submitted_at: s.submitted_at,
			display_name: s.profiles?.username ?? s.profiles?.display_name ?? "Anonymous",
		})).sort((a, b) => {
			const gd = gradeRank(a.llm_grade) - gradeRank(b.llm_grade);
			if (gd !== 0) return gd;
			return (b.score ?? 0) - (a.score ?? 0);
		});
		loading = false;
	}

	loadSubmissions();
</script>

<div class="flex flex-col items-center gap-8">
	<!-- Prompt -->
	<div class="text-center space-y-3">
		<p class="text-gray-500 text-sm">Today's prompt</p>
		<h2 class="text-lg">
			<span class="font-semibold">{prompt.type}</span> stories about:
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

	{#if loading}
		<p class="text-gray-400 text-sm">Loading...</p>
	{:else if submissions.length === 0}
		<div class="text-center py-12 space-y-2">
			<p class="text-gray-500">No submissions yet today.</p>
			<a href="/" class="text-sm text-black underline underline-offset-2"
				>Be the first</a
			>
		</div>
	{:else}
		<div class="w-full space-y-4">
			{#each submissions as sub, i}
				<div class="border border-gray-100 rounded-lg p-5">
					<div class="flex items-center gap-2 mb-3">
						<span class="text-[11px] text-gray-300">#{i + 1}</span>
						<span class="text-xs text-gray-400">{sub.display_name}</span>
						{#if sub.llm_grade}
							<span class="ml-auto text-xs font-semibold text-gray-500">{sub.llm_grade}{#if sub.score} <span class="font-normal text-gray-300">|</span> {sub.score.toFixed(1)}x{/if}</span>
						{/if}
					</div>
					<p class="text-sm leading-relaxed">{sub.sentence1}</p>
					<p class="text-sm leading-relaxed mt-1">{sub.sentence2}</p>
					{#if sub.llm_feedback && sub.user_id === getUser()?.id}
						<div class="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded p-3 mt-3 whitespace-pre-wrap">{@html renderFeedback(sub.llm_feedback)}</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
