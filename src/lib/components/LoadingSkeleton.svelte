<script lang="ts">
	let { lines = 3 }: { lines?: number } = $props();
</script>

<div class="w-full space-y-4 animate-pulse">
	{#each Array(lines) as _}
		<div class="border border-gray-100 rounded-lg p-5 space-y-3">
			<div class="flex items-center gap-2">
				<div class="h-3 w-8 bg-gray-100 rounded"></div>
				<div class="h-3 w-20 bg-gray-100 rounded"></div>
				<div class="ml-auto h-3 w-12 bg-gray-100 rounded"></div>
			</div>
			<div class="h-4 bg-gray-100 rounded w-full"></div>
			<div class="h-4 bg-gray-100 rounded w-3/4"></div>
		</div>
	{/each}
</div>
