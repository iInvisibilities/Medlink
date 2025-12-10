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
	import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
	import { Drawer } from "$lib/components/ui/drawer/index.js";
	import TranslationSVG from '$lib/assets/translation.svg';
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { children, data } = $props();
	let isLoggedIn = $state(false);
	let isAdmin = $state(false);
	let nav: HTMLElement;
	let drawerOpen = $state(false);
	let isDesktop = $state(true);
	let notifications = $state<any[]>([]);
	let seenNewNotificationIds = new Set<string>();
	let seenReloadAppointmentIds = new Set<string>();
	const isOnDashboard = $derived(page.url.pathname.startsWith("/dashboard"));
	
	$effect(() => {
		isLoggedIn = Boolean((data as any)?.session);
		isAdmin = Boolean((data as any)?.session?.user?.admin);
	});

	let currentLanguage = $state("en");

	const inlineNotifications = $derived(notifications.slice(0, 3));
	const hasMoreNotifications = $derived(notifications.length > 3);
	const redirectParam = $derived(encodeURIComponent(page.url.pathname + page.url.search));
	const localeForDates = $derived(currentLanguage === "fr" ? "fr-FR" : currentLanguage === "ar" ? "ar" : "en-US");
	
	$effect(() => {
		currentLanguage = (data as any)?.language || "en";
	});

	$effect(() => {
		if (!browser) return;
		const update = () => { isDesktop = window.innerWidth >= 768; };
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	});

	onMount(() => {
		if (!browser) return;
		const sessionId = (data as any)?.session?.user?.id;
		if (!sessionId) return;
		const fetchLatest = async () => {
			try {
				const res = await fetch("/api/notifications", { cache: "no-store" });
				if (!res.ok) return;
				const payload = await res.json();
				if (Array.isArray(payload?.notifications)) {
					notifications = payload.notifications;
					trackNewNotifications(notifications, true);
				}
			} catch {}
		};
		void fetchLatest();
		setInterval(fetchLatest, 5000);
	});

	async function refreshDashboardAppointments(apptId?: string) {
		if (!browser || !isOnDashboard) return;
		try {
			const res = await fetch("/api/dashboard/appointments", { cache: "no-store" });
			if (!res.ok) return;
			const payload = await res.json();
			window.dispatchEvent(new CustomEvent("dashboard:appointments:update", {
				detail: {
					appointments: Array.isArray(payload?.appointments) ? payload.appointments : [],
					isClinic: Boolean(payload?.isClinic)
				}
			}));
			if (apptId) seenReloadAppointmentIds.add(apptId);
		} catch {}
	}

	

	function formatDateTime(value?: string | Date | null) {
		if (!value) return "";
		try {
			return new Intl.DateTimeFormat(localeForDates, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
		} catch {
			return new Date(value).toLocaleString();
		}
	}

	function renderNotification(n: any) {
		const strings = (data as any)?.content?.notifications || {};
		const doctor = n?.doctor_name || strings?.unknownDoctor || "your clinic";
		const patient = n?.patient_name || strings?.unknownPatient || "a patient";
		const time = formatDateTime(n?.appointment_date);
		const withPlaceholders = (template?: string) => (template || "")
			.replace("{doctor}", doctor)
			.replace("{time}", time)
			.replace("{patient}", patient);
		switch (n?.type) {
			case "due":
				return withPlaceholders(strings?.due);
			case "reschedule":
				return withPlaceholders(strings?.reschedule);
			case "deleted":
				return withPlaceholders(strings?.deleted);
			case "new":
				return withPlaceholders(strings?.newAppointmentClinic);
			default:
				return n?.message || strings?.fallback || "You have a new notification.";
		}
	}

	function trackNewNotifications(list: any[], triggerRefresh: boolean) {
		if (!triggerRefresh) return;
		for (const n of list) {
			if ((n?.type === "new" || n?.type === "deleted" || n?.type === "reschedule") && n?._id) {
				const id = String(n._id);
				if (seenNewNotificationIds.has(id)) continue;
				seenNewNotificationIds.add(id);
				if (!isOnDashboard) continue;
				const apptId = n.appointment_id ? String(n.appointment_id) : undefined;
				if (apptId && seenReloadAppointmentIds.has(apptId) && n?.type !== "deleted") continue;
				void refreshDashboardAppointments(apptId);
			}
		}
	}


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
				direction: rtl;
			}
		</style>
	{/if}
</svelte:head>

<ModeWatcher />
<nav bind:this={nav} class="{currentLanguage == "ar" ? "noto-kufi-arabic " : ""} relative z-30 flex flex-wrap items-center justify-between gap-3 bg-primary-foreground px-4 py-3 dark:bg-secondary sm:flex-nowrap sm:px-10">
 	<a href="/" class="shrink-0"><img class="rounded-lg dark:invert-100 dark:grayscale-100 w-24 sm:w-32" src={MedlinkIcon} alt="Medlink"></a>

 	<div class={`flex w-full flex-wrap items-center justify-end ${isLoggedIn ? "gap-2 sm:gap-4" : "gap-4 sm:gap-8"} sm:w-auto sm:flex-nowrap`}>
		{#if isLoggedIn}
			{#if isAdmin}
				<Button class="shrink-0" variant="outline" href="/admin">{data?.content?.nav?.adminDashboard || "Admin Dashboard"}</Button>
			{/if}
			<Button class="shrink-0" variant="outline" href="/dashboard">{data?.content?.nav?.dashboard || "Dashboard"}</Button>
			<Button class="shrink-0" variant="outline" href="/account">{data?.content?.nav?.account || "Account"}</Button>
			<form method="POST" action="/logout" class="shrink-0"><Button type="submit" variant="outline">{data?.content?.nav?.logout || "Logout"}</Button></form>
		{:else}
			<div class="flex items-center gap-4">
				<a href="/signup" class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border bg-background px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">{data?.content?.nav?.signup || "Sign up"}</a>
				<a href="/login" class="text-sm font-medium underline-offset-4 hover:underline dark:text-primary-foreground">{data?.content?.nav?.login || "Login"}</a>
			</div>
		{/if}
		<div class="flex items-center gap-2">
			<Button class="shrink-0 hover:cursor-pointer" onclick={toggleMode} variant="outline" size="icon">
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
					<Button {...props} class="shrink-0 hover:cursor-pointer" variant="outline" size="icon">
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

{#if notifications.length && isDesktop}
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 pt-4 sm:px-6">
		<div class="flex items-center justify-between">
			<h2 class="text-base font-semibold">{(data as any)?.content?.notifications?.title || "Notifications"}</h2>
			<div class="flex items-center gap-2">
				{#if hasMoreNotifications}
					<button type="button" class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm hover:bg-muted" onclick={() => drawerOpen = true}>
						{(data as any)?.content?.notifications?.showAll || "You have notifications"}
					</button>
				{/if}
				<form method="POST" action={`/notifications?redirectTo=${redirectParam}`}>
					<input type="hidden" name="ids" value={JSON.stringify(notifications.map((n: any) => n._id))} />
					<button type="submit" class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm hover:bg-muted">{(data as any)?.content?.notifications?.markAllRead || "Mark all as read"}</button>
				</form>
			</div>
		</div>
		<div class="space-y-2">
			{#each inlineNotifications as n}
				<Alert class="border-none bg-muted w-full text-wrap">
					<div class="flex gap-2 min-w-max sm:flex-row sm:items-center sm:justify-between">
						<AlertDescription>{renderNotification(n)}</AlertDescription>
						<form method="POST" action={`/notifications?redirectTo=${redirectParam}`} class="flex justify-end">
							<input type="hidden" name="id" value={n._id} />
							<button type="submit" class="text-xs font-medium underline-offset-2 hover:underline">{(data as any)?.content?.notifications?.markRead || "Mark read"}</button>
						</form>
					</div>
				</Alert>
			{/each}
		</div>
	</div>
{:else if notifications.length}
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 pt-4 sm:px-6">
		<button type="button" class="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted" onclick={() => drawerOpen = true}>
			{(data as any)?.content?.notifications?.showAll || "You have notifications"}
		</button>
	</div>
{/if}

<Drawer bind:open={drawerOpen}>
	<div class="flex h-full flex-col gap-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">{(data as any)?.content?.notifications?.allTitle || (data as any)?.content?.notifications?.title || "Notifications"}</h3>
			<button type="button" class="text-sm underline-offset-2 hover:underline" onclick={() => drawerOpen = false}>{(data as any)?.content?.notifications?.close || "Close"}</button>
		</div>
		{#if notifications.length === 0}
			<p class="text-sm text-muted-foreground">{(data as any)?.content?.notifications?.empty || "No notifications."}</p>
		{:else}
			<div class="flex-1 space-y-3 overflow-y-auto pr-1">
				{#each notifications as n}
					<div class="rounded-md border bg-muted/60 p-3">
						<div class="flex items-center justify-between gap-2">
							<span class="text-sm font-medium">{(data as any)?.content?.notifications?.senderLabel || "Medlink"}</span>
							{#if n.created_at}
								<span class="text-xs text-muted-foreground">{formatDateTime(n.created_at)}</span>
							{/if}
						</div>
						<p class="mt-2 text-sm leading-relaxed">{renderNotification(n)}</p>
						<form method="POST" action={`/notifications?redirectTo=${redirectParam}`} class="mt-3 flex justify-end">
							<input type="hidden" name="id" value={n._id} />
							<button type="submit" class="text-xs font-medium underline-offset-2 hover:underline">{(data as any)?.content?.notifications?.markRead || "Mark read"}</button>
						</form>
					</div>
				{/each}
			</div>
			<form method="POST" action={`/notifications?redirectTo=${redirectParam}`} class="flex justify-end pt-1">
				<input type="hidden" name="ids" value={JSON.stringify(notifications.map((n: any) => n._id))} />
				<button type="submit" class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm hover:bg-muted">{(data as any)?.content?.notifications?.markAllRead || "Mark all as read"}</button>
			</form>
		{/if}
	</div>
</Drawer>

{@render children()}
