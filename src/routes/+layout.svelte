<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import MedlinkIcon from '$lib/assets/Medlink.png';
	import { ModeWatcher } from "mode-watcher";
	import SunIcon from "@lucide/svelte/icons/sun";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import { toggleMode } from "mode-watcher";
	import { Button } from "$lib/components/ui/button/index.js";
	import TranslationSVG from '$lib/assets/translation.svg';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { goto } from '$app/navigation';

	let { children, data } = $props();
	let isLoggedIn = $state(false);
	let isAdmin = $state(false);
	let nav: HTMLElement;
	
	$effect(() => {
		isLoggedIn = Boolean((data as any)?.session);
		isAdmin = Boolean((data as any)?.session?.user?.admin);
	});

	let currentLanguage = $state("en");
	
	$effect(() => {
		currentLanguage = (data as any)?.language || "en";
	});

	function switchLanguage(lang: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('lang', lang);
		goto(url.toString());
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	{#if currentLanguage == "ar"}
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
		<link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100..900&display=swap" rel="stylesheet">
		<style>
			body {
				font-family: "Noto Kufi Arabic", sans-serif;
				font-optical-sizing: auto;
				font-weight: 500;
				font-style: normal;
			}
		</style>
	{/if}
</svelte:head>

<ModeWatcher />
<nav bind:this={nav} class="{currentLanguage == "ar" ? "noto-kufi-arabic " : ""} flex items-center justify-between bg-primary-foreground dark:bg-secondary px-10">
	<a href="/"><img class="rounded-lg dark:invert-100 dark:grayscale-100" src={MedlinkIcon} width="128" alt="Medlink"></a>

	<div class="flex items-center {isLoggedIn ? "gap-2" : "gap-10"}">
		{#if isLoggedIn}
			{#if isAdmin}
				<Button variant="outline" href="/admin">{data?.content?.nav?.adminDashboard || "Admin Dashboard"}</Button>
			{/if}
			<Button variant="outline" href="/dashboard">{data?.content?.nav?.dashboard || "Dashboard"}</Button>
			<form method="POST" action="/logout"><Button type="submit" variant="outline">{data?.content?.nav?.logout || "Logout"}</Button></form>
		{:else}
			<div class="flex items-center gap-4">
				<a href="/signup" class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">{data?.content?.nav?.signup || "Sign up"}</a>
				<a href="/login" class="text-sm font-medium underline-offset-4 hover:underline dark:text-primary-foreground">{data?.content?.nav?.login || "Login"}</a>
			</div>
		{/if}
		<div class="flex items-center gap-2">
			<Button onclick={toggleMode} variant="outline" size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all! dark:-rotate-90 dark:scale-0"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all! dark:rotate-0 dark:scale-100"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
					<Button {...props} variant="outline" size="icon">
						<img src={TranslationSVG} alt="Translation Icon" class="h-4 dark:invert-100" />
					</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-56">
					<DropdownMenu.Group>
					<DropdownMenu.Label>{data?.content?.nav?.languageLabel || "Language"}</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.RadioGroup value={currentLanguage}>
						<DropdownMenu.RadioItem value="fr" onclick={() => switchLanguage('fr')}>French</DropdownMenu.RadioItem>
						<DropdownMenu.RadioItem value="en" onclick={() => switchLanguage('en')}>English</DropdownMenu.RadioItem>
						<DropdownMenu.RadioItem value="ar" onclick={() => switchLanguage('ar')}>Arabic</DropdownMenu.RadioItem>
					</DropdownMenu.RadioGroup>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		
	</div>
</nav>
{@render children()}
