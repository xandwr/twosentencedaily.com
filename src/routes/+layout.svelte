<script lang="ts">
	import "../global.css";
	import favicon from "$lib/assets/favicon.svg";
	import { getUser, signOut } from "$lib/auth.svelte";
	import { page } from "$app/state";

	let { children } = $props();

	const navItems = [
		{ href: "/", label: "Play" },
		{ href: "/today", label: "Today" },
		{ href: "/history", label: "History" },
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="bg-blue-300 w-screen h-screen flex flex-col items-center justify-between gap-y-8 max-w-3xl m-auto p-8"
>
	<div class="w-full flex flex-col items-center gap-y-4">
		<div class="text-4xl bg-blue-400 w-full p-4 text-center">
			<h3 class="text-sm">THE</h3>
			<h1><a href="/">Two-Sentence Daily</a></h1>
		</div>

		<nav class="flex gap-x-16 bg-blue-500 w-full justify-between text-center">
			{#each navItems as { href, label }}
				<a
					class="w-full transition-colors {page.url.pathname === href
						? 'bg-blue-700 text-white'
						: 'bg-blue-600 hover:bg-blue-500'}"
					{href}
				>
					{label}
				</a>
			{/each}
		</nav>
	</div>

	<div class="w-full flex-1 flex flex-col gap-y-4 items-center">
		{@render children()}
	</div>

	<div
		class="bg-blue-400 w-full text-center p-4 flex justify-between items-center"
	>
		<h1><a href="https://github.com/xandwr">@xandwr</a> 2026</h1>
		{#if getUser()}
			<button
				onclick={signOut}
				class="text-sm opacity-60 hover:opacity-100"
			>
				Sign out
			</button>
		{/if}
	</div>
</div>
