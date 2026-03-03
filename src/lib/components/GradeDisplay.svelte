<script lang="ts">
	import { gradeColor } from "$lib/gradeRank";

	let {
		grade,
		score = null,
		size = "sm",
	}: {
		grade: string | null;
		score?: number | null;
		size?: "sm" | "lg";
	} = $props();
</script>

{#if grade}
	{#if size === "lg"}
		<p class="text-5xl font-bold {gradeColor(grade)}">
			{grade}
			{#if score}
				<span class="text-gray-400 font-normal">|</span>
				<span class="text-2xl text-gray-500 font-semibold">{score.toFixed(1)}x</span>
			{/if}
		</p>
	{:else}
		<span class="text-xs font-semibold {gradeColor(grade)}">
			{grade}
			{#if score}
				<span class="font-normal text-gray-300">|</span> {score.toFixed(1)}x
			{/if}
		</span>
	{/if}
{/if}
