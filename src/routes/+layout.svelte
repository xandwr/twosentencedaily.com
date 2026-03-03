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
	let mobileMenuOpen = $state(false);

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

	// Close mobile menu on navigation
	$effect(() => {
		page.url.pathname;
		mobileMenuOpen = false;
	});

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
		<div class="max-w-2xl mx-auto px-4 pt-6 pb-4 relative">
			<a href="/" class="block text-left md:text-center">
				<p class="text-[10px] uppercase tracking-[0.3em] text-gray-400">
					The
				</p>
				<h1 class="text-3xl font-bold tracking-tight">
					Two-Sentence Daily
				</h1>
			</a>
			<!-- Mobile hamburger -->
			<button
				class="absolute right-4 top-1/2 -translate-y-1/2 md:hidden p-2 text-gray-400 hover:text-gray-600"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				<div class="relative w-5 h-5">
					<svg class="absolute inset-0 transition-all duration-200 {mobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="4" y1="6" x2="20" y2="6" />
						<line x1="4" y1="12" x2="20" y2="12" />
						<line x1="4" y1="18" x2="20" y2="18" />
					</svg>
					<svg class="absolute inset-0 transition-all duration-200 {mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="6" y1="6" x2="18" y2="18" />
						<line x1="6" y1="18" x2="18" y2="6" />
					</svg>
				</div>
			</button>
		</div>

		<!-- Desktop nav -->
		<nav class="max-w-2xl mx-auto hidden md:flex border-t border-gray-100">
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

		<!-- Mobile nav dropdown -->
		<nav
			class="md:hidden border-t border-gray-100 grid transition-[grid-template-rows] duration-200 {mobileMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}"
		>
			<div class="overflow-hidden">
				{#each navItems as { href, label }}
					<a
						class="block px-6 py-3 text-sm font-medium transition-colors {page
							.url.pathname === href
							? 'text-black bg-gray-50'
							: 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}"
						{href}
					>
						{label}
					</a>
				{/each}
			</div>
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
