<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getDailyPrompt } from "$lib/promptGenerator";
	import { getUser, signIn } from "$lib/auth.svelte";
	import { gradeRank } from "$lib/gradeRank";
	import KeywordBubbles from "$lib/components/KeywordBubbles.svelte";
	import PageHeader from "$lib/components/PageHeader.svelte";
	import SubmissionCard from "$lib/components/SubmissionCard.svelte";
	import LoadingSkeleton from "$lib/components/LoadingSkeleton.svelte";

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
	<PageHeader title="Today" subtitle="Today's leaderboard. How does yours stack up?" />
	<!-- Prompt -->
	<div class="text-center space-y-3">
		<div class="text-lg flex gap-2 justify-center items-center">
			<div class="flex gap-2">
				<p>on</p>
				<p class="text-lg font-medium text-neutral-500">{prompt.date}</p>
				<p>we're writing</p>
			</div>

			<span class="font-semibold">{prompt.type}</span> stories about:
		</div>
		<KeywordBubbles keywords={prompt.keywords} />
	</div>

	{#if loading}
		<LoadingSkeleton />
	{:else if submissions.length === 0}
		<div class="text-center py-12 space-y-2">
			<p class="text-gray-500">No submissions yet today.</p>
			<a href="/" class="text-sm text-black underline underline-offset-2"
				>Be the first</a
			>
		</div>
	{:else}
		{#if !getUser()}
			<div class="w-full text-center py-4 space-y-2">
				<p class="text-sm text-gray-400">Sign in to submit yours</p>
				<button
					onclick={signIn}
					class="px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
				>
					Sign in with Google
				</button>
			</div>
		{/if}
		<div class="w-full space-y-4">
			{#each submissions as sub, i}
				<SubmissionCard
					sentence1={sub.sentence1}
					sentence2={sub.sentence2}
					grade={sub.llm_grade}
					score={sub.score}
					feedback={sub.llm_feedback}
					showFeedback={sub.user_id === getUser()?.id}
					rank={i + 1}
					displayName={sub.display_name}
				/>
			{/each}
		</div>
	{/if}
</div>
