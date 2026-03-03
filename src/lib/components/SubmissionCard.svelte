<script lang="ts">
	import { gradeBorder } from "$lib/gradeRank";
	import { renderFeedback } from "$lib/renderFeedback";
	import GradeDisplay from "./GradeDisplay.svelte";

	let {
		sentence1,
		sentence2,
		grade = null,
		score = null,
		feedback = null,
		showFeedback = false,
		rank = null,
		displayName = null,
	}: {
		sentence1: string;
		sentence2: string;
		grade?: string | null;
		score?: number | null;
		feedback?: string | null;
		showFeedback?: boolean;
		rank?: number | null;
		displayName?: string | null;
	} = $props();
</script>

<div class="border {gradeBorder(grade)} rounded-lg p-5">
	<div class="flex items-center gap-2 {displayName || rank ? 'mb-3' : ''}">
		{#if rank}
			<span class="text-[11px] text-gray-300">#{rank}</span>
		{/if}
		{#if displayName}
			<span class="text-xs text-gray-400">{displayName}</span>
		{/if}
		{#if grade}
			<span class="ml-auto">
				<GradeDisplay {grade} {score} />
			</span>
		{/if}
	</div>
	<p class="text-sm leading-relaxed">{sentence1}</p>
	<p class="text-sm leading-relaxed mt-1">{sentence2}</p>
	{#if feedback && showFeedback}
		<div class="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded p-3 mt-3 whitespace-pre-wrap">{@html renderFeedback(feedback)}</div>
	{/if}
</div>
