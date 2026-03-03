<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getUser } from "$lib/auth.svelte";
	import { getDailyPrompt } from "$lib/promptGenerator";
	import { renderFeedback } from "$lib/renderFeedback";
	import { gradeRank, gradeColor } from "$lib/gradeRank";

	type Tab = "archive" | "mine";

	let activeTab = $state<Tab>("archive");
	let loading = $state(true);

	interface ArchiveDay {
		date: string;
		type: string;
		keywords: string[];
		submissions: { sentence1: string; sentence2: string; display_name: string; score: number | null; llm_grade: string | null }[];
	}

	interface MySubmission {
		prompt_date: string;
		sentence1: string;
		sentence2: string;
		score: number | null;
		llm_grade: string | null;
		llm_feedback: string | null;
		submitted_at: string;
	}

	let archive = $state<ArchiveDay[]>([]);
	let mySubmissions = $state<MySubmission[]>([]);

	async function loadArchive() {
		loading = true;

		const today = getDailyPrompt().date;
		const { data: prompts } = await supabase
			.from("daily_prompts")
			.select("date, type, keywords")
			.lt("date", today)
			.order("date", { ascending: false })
			.limit(30);

		if (!prompts || prompts.length === 0) {
			archive = [];
			loading = false;
			return;
		}

		const dates = prompts.map((p) => p.date);
		const { data: subs } = await supabase
			.from("submissions")
			.select("prompt_date, sentence1, sentence2, score, llm_grade, profiles!submissions_profile_id_fkey(username, display_name)")
			.in("prompt_date", dates)
			.order("score", { ascending: false, nullsFirst: false })
			.limit(150);

		const subsByDate = new Map<
			string,
			{ sentence1: string; sentence2: string; display_name: string; score: number | null; llm_grade: string | null }[]
		>();
		for (const s of (subs ?? []) as any[]) {
			const list = subsByDate.get(s.prompt_date) ?? [];
			if (list.length < 5) list.push({
				sentence1: s.sentence1,
				sentence2: s.sentence2,
				display_name: s.profiles?.username ?? s.profiles?.display_name ?? "Anonymous",
				score: s.score,
				llm_grade: s.llm_grade,
			});
			subsByDate.set(s.prompt_date, list);
		}

		archive = prompts.map((p) => ({
			...p,
			submissions: (subsByDate.get(p.date) ?? []).sort((a, b) => {
				const gd = gradeRank(a.llm_grade) - gradeRank(b.llm_grade);
				if (gd !== 0) return gd;
				return (b.score ?? 0) - (a.score ?? 0);
			}),
		}));

		loading = false;
	}

	async function loadMine() {
		loading = true;
		const user = getUser();
		if (!user) {
			mySubmissions = [];
			loading = false;
			return;
		}

		const { data } = await supabase
			.from("submissions")
			.select("prompt_date, sentence1, sentence2, score, llm_grade, llm_feedback, submitted_at")
			.eq("user_id", user.id)
			.order("prompt_date", { ascending: false })
			.limit(50);

		mySubmissions = data ?? [];
		loading = false;
	}

	function switchTab(tab: Tab) {
		activeTab = tab;
		if (tab === "archive") loadArchive();
		else loadMine();
	}

	loadArchive();
</script>

<div class="flex flex-col items-center gap-6 w-full">
	<div class="text-center flex flex-col gap-3 border-b-2 pb-2.5 font-medium w-full">
		<h1 class="text-xl">History</h1>
		<p class="text-sm text-neutral-400">Past prompts and submissions from the community.</p>
	</div>
	<!-- Tabs -->
	<div class="flex w-full">
		{#if getUser()}
			<button
				onclick={() => switchTab("mine")}
				class="flex-1 pb-2.5 text-sm font-medium transition-colors {activeTab ===
				'mine'
					? 'text-black border-b-2 border-black'
					: 'text-gray-400 hover:text-gray-600'}"
			>
				My Submissions
			</button>
		{/if}
	</div>

	{#if loading}
		<p class="text-gray-400 text-sm">Loading...</p>
	{:else if activeTab === "archive"}
		{#if archive.length === 0}
			<div class="text-center py-12 space-y-2">
				<p class="text-gray-500">No past prompts yet.</p>
				<p class="text-sm text-gray-400">Check back tomorrow!</p>
			</div>
		{:else}
			<div class="w-full space-y-6">
				{#each archive as day}
					<div class="border border-gray-100 rounded-lg p-5">
						<p class="text-[11px] text-gray-300">{day.date}</p>
						<p class="font-semibold text-sm mt-1">
							{day.type}
							<span class="font-normal text-gray-400">
								&mdash; {day.keywords.join(", ")}
							</span>
						</p>
						{#if day.submissions.length > 0}
							<div
								class="mt-3 space-y-2 border-t border-gray-50 pt-3"
							>
								{#each day.submissions as sub}
									<div class="text-sm leading-relaxed">
										<div class="flex items-center gap-2 mb-1">
											<p class="text-xs text-gray-400">{sub.display_name}</p>
											{#if sub.llm_grade}
												<span class="ml-auto text-xs font-semibold {gradeColor(sub.llm_grade)}">{sub.llm_grade}{#if sub.score} <span class="font-normal text-gray-300">|</span> {sub.score.toFixed(1)}x{/if}</span>
											{/if}
										</div>
										<p>{sub.sentence1}</p>
										<p class="text-gray-600">
											{sub.sentence2}
										</p>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-xs text-gray-300 mt-2">
								No submissions
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{:else if activeTab === "mine"}
		{#if mySubmissions.length === 0}
			<div class="text-center py-12 space-y-2">
				<p class="text-gray-500">No submissions yet.</p>
				<a
					href="/"
					class="text-sm text-black underline underline-offset-2"
				>
					Write your first story
				</a>
			</div>
		{:else}
			<div class="w-full space-y-4">
				{#each mySubmissions as sub}
					<div class="border border-gray-100 rounded-lg p-5">
						<div class="flex items-center gap-2">
							<p class="text-[11px] text-gray-300">
								{sub.prompt_date}
							</p>
							{#if sub.llm_grade}
								<span class="ml-auto text-xs font-semibold {gradeColor(sub.llm_grade)}">{sub.llm_grade}{#if sub.score} <span class="font-normal text-gray-300">|</span> {sub.score.toFixed(1)}x{/if}</span>
							{/if}
						</div>
						<p class="text-sm leading-relaxed mt-2">
							{sub.sentence1}
						</p>
						<p class="text-sm leading-relaxed mt-1">
							{sub.sentence2}
						</p>
						{#if sub.llm_feedback}
							<div class="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded p-3 mt-3 whitespace-pre-wrap">{@html renderFeedback(sub.llm_feedback)}</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
