<script lang="ts">
	import { supabase } from "$lib/supabaseClient";
	import { getUser } from "$lib/auth.svelte";
	import { getDailyPrompt } from "$lib/promptGenerator";

	type Tab = "archive" | "mine";

	let activeTab = $state<Tab>("archive");
	let loading = $state(true);

	interface ArchiveDay {
		date: string;
		type: string;
		keywords: string[];
		submissions: { sentence1: string; sentence2: string }[];
	}

	interface MySubmission {
		prompt_date: string;
		sentence1: string;
		sentence2: string;
		score: number | null;
		submitted_at: string;
	}

	let archive = $state<ArchiveDay[]>([]);
	let mySubmissions = $state<MySubmission[]>([]);

	async function loadArchive() {
		loading = true;

		// Get all past prompts (not today)
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

		// Get top submissions for each date
		const dates = prompts.map((p) => p.date);
		const { data: subs } = await supabase
			.from("submissions")
			.select("prompt_date, sentence1, sentence2, score")
			.in("prompt_date", dates)
			.order("score", { ascending: false, nullsFirst: false })
			.limit(150);

		const subsByDate = new Map<
			string,
			{ sentence1: string; sentence2: string }[]
		>();
		for (const s of subs ?? []) {
			const list = subsByDate.get(s.prompt_date) ?? [];
			if (list.length < 5) list.push(s);
			subsByDate.set(s.prompt_date, list);
		}

		archive = prompts.map((p) => ({
			...p,
			submissions: subsByDate.get(p.date) ?? [],
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
			.select("prompt_date, sentence1, sentence2, score, submitted_at")
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

	// Initial load
	loadArchive();
</script>

<div class="w-full flex flex-col gap-y-4 items-center">
	<div class="flex w-full">
		<button
			onclick={() => switchTab("archive")}
			class="w-full p-2 transition-colors {activeTab === 'archive'
				? 'bg-blue-600 text-white'
				: 'bg-blue-400 hover:bg-blue-500'}"
		>
			Archive
		</button>
		{#if getUser()}
			<button
				onclick={() => switchTab("mine")}
				class="w-full p-2 transition-colors {activeTab === 'mine'
					? 'bg-blue-600 text-white'
					: 'bg-blue-400 hover:bg-blue-500'}"
			>
				My Submissions
			</button>
		{/if}
	</div>

	{#if loading}
		<p class="opacity-60">Loading...</p>
	{:else if activeTab === "archive"}
		{#if archive.length === 0}
			<div class="bg-blue-400 w-full p-8 text-center">
				<p class="text-lg">No past prompts yet.</p>
				<p class="text-sm opacity-70">Check back tomorrow!</p>
			</div>
		{:else}
			<div class="flex flex-col gap-y-6 w-full">
				{#each archive as day}
					<div class="bg-blue-400 p-4 w-full">
						<p class="text-xs opacity-50">{day.date}</p>
						<p class="font-bold">
							{day.type}
							<span class="font-normal opacity-70">
								— {day.keywords.join(", ")}
							</span>
						</p>
						{#if day.submissions.length > 0}
							<div class="mt-2 flex flex-col gap-y-2">
								{#each day.submissions as sub}
									<div
										class="bg-blue-300/50 p-3 text-sm italic"
									>
										<p>{sub.sentence1}</p>
										<p>{sub.sentence2}</p>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm opacity-50 mt-1">
								No submissions
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{:else if activeTab === "mine"}
		{#if mySubmissions.length === 0}
			<div class="bg-blue-400 w-full p-8 text-center">
				<p class="text-lg">No submissions yet.</p>
				<p class="text-sm opacity-70">
					<a href="/" class="underline">Write your first story!</a>
				</p>
			</div>
		{:else}
			<div class="flex flex-col gap-y-4 w-full">
				{#each mySubmissions as sub}
					<div class="bg-blue-400 p-4 w-full">
						<p class="text-xs opacity-50">{sub.prompt_date}</p>
						<p class="italic">{sub.sentence1}</p>
						<p class="italic">{sub.sentence2}</p>
						{#if sub.score !== null}
							<p class="text-xs opacity-60 mt-1">
								Score: {sub.score.toFixed(3)}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
