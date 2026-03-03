<script lang="ts">
	import "../global.css";
	import favicon from "$lib/assets/favicon.svg";
	import {
		getUser,
		getUsername,
		updateUsername,
		signOut,
        signIn,
	} from "$lib/auth.svelte";
	import { page } from "$app/state";

	let { children } = $props();

	let editing = $state(false);
	let usernameInput = $state("");
	let usernameError = $state("");

	function startEditing() {
		usernameInput = getUsername() ?? "";
		usernameError = "";
		editing = true;
	}

	async function saveUsername() {
		const err = await updateUsername(usernameInput);
		if (err) {
			usernameError = err;
			return;
		}
		editing = false;
	}

	function cancelEditing() {
		editing = false;
		usernameError = "";
	}

	const navItems = [
		{ href: "/", label: "Play" },
		{ href: "/today", label: "Today" },
		{ href: "/history", label: "History" },
		{ href: "/experiments", label: "Experiments" },
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>The Two-Sentence Daily</title>
	<meta name="description" content="A daily creative writing game. Write a two-sentence story from today's prompt and see how you stack up." />
	<meta property="og:title" content="The Two-Sentence Daily" />
	<meta property="og:description" content="A daily creative writing game. Write a two-sentence story from today's prompt and see how you stack up." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://twosentencedaily.com" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="The Two-Sentence Daily" />
	<meta name="twitter:description" content="A daily creative writing game. Write a two-sentence story from today's prompt and see how you stack up." />
</svelte:head>

<div class="min-h-screen bg-white flex flex-col">
	<header class="border-b border-gray-200">
		<div class="max-w-2xl mx-auto px-4 pt-6 pb-4">
			<a href="/" class="block text-center">
				<p class="text-[10px] uppercase tracking-[0.3em] text-gray-400">
					The
				</p>
				<h1 class="text-3xl font-bold tracking-tight">
					Two-Sentence Daily
				</h1>
			</a>
		</div>

		<nav class="max-w-2xl mx-auto flex border-t border-gray-100">
			{#each navItems as { href, label }}
				<a
					class="flex-1 text-center py-2.5 text-sm font-medium transition-colors {page
						.url.pathname === href
						? 'text-black border-b-2 border-black'
						: 'text-gray-400 hover:text-gray-600'}"
					{href}
				>
					{label}
				</a>
			{/each}
		</nav>
	</header>

	<main class="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
		{@render children()}
	</main>

	<footer
		class="border-t border-gray-100 max-w-2xl mx-auto w-full px-4 py-4 flex justify-between items-center text-xs text-gray-400"
	>
		<a href="https://github.com/xandwr" class="hover:text-gray-600">
			@xandwr 2026
		</a>
		{#if getUser()}
			<div class="flex items-center gap-3">
				{#if editing}
					<div class="flex items-center gap-1.5">
						<input
							type="text"
							class="border border-gray-200 rounded px-2 py-0.5 text-xs w-28 focus:outline-none focus:border-gray-400"
							bind:value={usernameInput}
							onkeydown={(e) => {
								if (e.key === "Enter") saveUsername();
								if (e.key === "Escape") cancelEditing();
							}}
						/>
						<button
							onclick={saveUsername}
							class="hover:text-gray-600">Save</button
						>
						<button
							onclick={cancelEditing}
							class="hover:text-gray-600"
						>
							Cancel
						</button>
					</div>
					{#if usernameError}
						<span class="text-red-400">{usernameError}</span>
					{/if}
				{:else}
					<button
						onclick={startEditing}
						class="hover:text-gray-600"
						title="Change username"
					>
						{getUsername() ?? "set username"}
					</button>
				{/if}
				<span class="text-gray-200">|</span>
				<button onclick={signOut} class="hover:text-gray-600">
					Sign out
				</button>
			</div>
		{:else}
			<div>
				<button onclick={signIn} class="hover:text-gray-600">
					Sign in
				</button>
			</div>
		{/if}
	</footer>
</div>
