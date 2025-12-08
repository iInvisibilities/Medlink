<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import MedlinkIcon from '$lib/assets/Medlink.png';
	import { ModeWatcher } from "mode-watcher";
	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import { toggleMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button/index.js";

	let { children, data } = $props();
	let isLoggedIn = $state(false);
	let isAdmin = $state(false);
	$effect(() => {
		isLoggedIn = Boolean((data as any)?.session);
		isAdmin = Boolean((data as any)?.session?.user?.admin);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<nav class="flex items-center justify-between bg-primary-foreground dark:bg-secondary px-10">
	<a href="/"><img class="rounded-lg dark:invert-100 dark:grayscale-100" src={MedlinkIcon} width="128" alt="Medlink"></a>

	<div class="flex items-center {isLoggedIn ? "gap-2" : "gap-10"}">
		{#if isLoggedIn}
			{#if isAdmin}
				<Button variant="outline" href="/admin">Admin Dashboard</Button>
			{/if}
			<Button variant="outline" href="/dashboard">Dashboard</Button>
			<form method="POST" action="/logout"><Button type="submit" variant="outline">Logout</Button></form>
		{:else}
			<div class="flex items-center gap-4">
				<a href="/signup" class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">Sign up</a>
				<a href="/login" class="text-sm font-medium underline-offset-4 hover:underline dark:text-primary-foreground">Login</a>
			</div>
		{/if}
		<Button onclick={toggleMode} variant="outline" size="icon">
			<SunIcon
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all! dark:-rotate-90 dark:scale-0"
			/>
			<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all! dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</nav>
{@render children()}
