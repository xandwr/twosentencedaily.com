<script lang="ts">
	let { keywords }: { keywords: string[] } = $props();

	function keywordColor(word: string): string {
		let h = 0;
		for (let i = 0; i < word.length; i++) {
			h = word.charCodeAt(i) + ((h << 5) - h);
		}
		const hue = ((h % 360) + 360) % 360;
		return `background: hsl(${hue} 55% 92%); color: hsl(${hue} 45% 35%)`;
	}
</script>

<div class="flex gap-4 justify-center">
	{#each keywords as keyword}
		<span
			class="px-3 py-1 text-sm font-medium rounded-full"
			style={keywordColor(keyword)}
		>
			{keyword}
		</span>
	{/each}
</div>
