<script lang="ts">
	let { title, subtitle }: { title: string; subtitle: string } = $props();
</script>

<div class="text-center flex flex-col gap-3 border-b-2 pb-2.5 font-medium w-full">
	<h1 class="text-xl">{title}</h1>
	<p class="text-sm text-neutral-400">{subtitle}</p>
</div>
