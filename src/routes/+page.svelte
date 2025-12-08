<section class="relative overflow-hidden">
	<div class="mx-auto max-w-7xl px-6 pt-16 pb-12 sm:pt-24 sm:pb-16">
		<div class="mx-auto max-w-3xl text-center">
			<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
				Find the right doctor. Book online in minutes.
			</h1>
			<p class="mt-4 text-muted-foreground">
				Medlink helps you discover trusted doctors, compare profiles, and schedule
				appointments online — no more calling clinics or waiting in lines.
			</p>
		</div>

		<!-- Search form (static, no JavaScript) -->
		<form method="GET" action="/search" class="mx-auto mt-10 max-w-5xl rounded-xl border bg-card p-6 shadow-sm">
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="space-y-2">
					<label class="text-sm font-medium" for="specialty">Specialty</label>
					<input id="specialty" name="specialty" placeholder="Dermatologist, Dentist..." class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="location">Location</label>
					<input id="location" name="location" placeholder="City or Area" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
				</div>
				<div class="space-y-2">
					<label class="text-sm font-medium" for="date">Preferred date</label>
					<input id="date" name="date" type="date" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
				</div>
				<div class="flex items-end">
					<button type="submit" class="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-secondary dark:text-secondary-foreground">
						Search doctors
					</button>
				</div>
			</div>
			<p class="mt-3 text-xs text-muted-foreground">Tip: Try "Cardiologist" in "Casablanca".</p>
		</form>

		<!-- Quick stats -->
		<div class="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="rounded-lg border bg-card p-4 text-center">
				<div class="text-2xl font-semibold">500+</div>
				<div class="text-sm text-muted-foreground">Verified doctors</div>
			</div>
			<div class="rounded-lg border bg-card p-4 text-center">
				<div class="text-2xl font-semibold">50+</div>
				<div class="text-sm text-muted-foreground">Specialties</div>
			</div>
			<div class="rounded-lg border bg-card p-4 text-center">
				<div class="text-2xl font-semibold">24/7</div>
				<div class="text-sm text-muted-foreground">Online booking</div>
			</div>
		</div>
	</div>
</section>

<!-- Featured Doctors -->
<section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
	<div class="mb-6 flex items-end justify-between">
		<h2 class="text-2xl font-semibold">Featured doctors</h2>
		<a href="/doctors" class="text-sm font-medium text-primary underline-offset-4 hover:underline">Browse all</a>
	</div>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- Doctor Card 1 -->
		<div class="rounded-xl border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold">AM</div>
				<div>
					<div class="font-medium">Dr. Amina Mansour</div>
					<div class="text-xs text-muted-foreground">Cardiologist • 8 yrs exp.</div>
				</div>
			</div>
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<span class="inline-flex items-center rounded-md border px-2 py-1 text-xs">Heart Health</span>
				<span class="inline-flex items-center rounded-md border px-2 py-1 text-xs">Hypertension</span>
			</div>
			<div class="mt-4 text-sm text-muted-foreground">Downtown Clinic • Casablanca</div>
			<div class="mt-3 flex items-center gap-2 text-sm"><span class="text-yellow-500">★★★★★</span><span class="text-muted-foreground">4.9 (120)</span></div>
		</div>

		<!-- Doctor Card 2 -->
		<div class="rounded-xl border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold">YK</div>
				<div>
					<div class="font-medium">Dr. Yassine Karim</div>
					<div class="text-xs text-muted-foreground">Dermatologist • 6 yrs exp.</div>
				</div>
			</div>
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<span class="inline-flex items-center rounded-md border px-2 py-1 text-xs">Acne</span>
				<span class="inline-flex items-center rounded-md border px-2 py-1 text-xs">Eczema</span>
			</div>
			<div class="mt-4 text-sm text-muted-foreground">SkinCare Center • Rabat</div>
			<div class="mt-3 flex items-center gap-2 text-sm"><span class="text-yellow-500">★★★★☆</span><span class="text-muted-foreground">4.6 (98)</span></div>
		</div>

		<!-- Doctor Card 3 -->
		<div class="rounded-xl border bg-card p-5 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-semibold">SB</div>
				<div>
					<div class="font-medium">Dr. Salma Bensaid</div>
					<div class="text-xs text-muted-foreground">Pediatrician • 10 yrs exp.</div>
				</div>
			</div>
			<div class="mt-4 flex flex-wrap items-center gap-2">
				<span class="inline-flex items-center rounded-md border px-2 py-1 text-xs">Child Care</span>
				<span class="inline-flex items-center rounded-md border px-2 py-1 text-xs">Vaccination</span>
			</div>
			<div class="mt-4 text-sm text-muted-foreground">Family Clinic • Marrakech</div>
			<div class="mt-3 flex items-center gap-2 text-sm"><span class="text-yellow-500">★★★★★</span><span class="text-muted-foreground">5.0 (75)</span></div>
		</div>
	</div>
</section>

<!-- How it works -->
<section class="bg-muted/40 py-12 sm:py-16">
	<div class="mx-auto max-w-7xl px-6">
		<h2 class="text-center text-2xl font-semibold">How Medlink works</h2>
		<div class="mt-8 grid gap-6 sm:grid-cols-3">
			<div class="rounded-xl border bg-card p-6">
				<div class="text-sm font-medium">1. Search</div>
				<p class="mt-2 text-sm text-muted-foreground">Filter by specialty, location, availability, and more.</p>
			</div>
			<div class="rounded-xl border bg-card p-6">
				<div class="text-sm font-medium">2. Compare</div>
				<p class="mt-2 text-sm text-muted-foreground">Review profiles, experience, ratings, and clinic details.</p>
			</div>
			<div class="rounded-xl border bg-card p-6">
				<div class="text-sm font-medium">3. Book</div>
				<p class="mt-2 text-sm text-muted-foreground">Pick a time that works and confirm instantly.</p>
			</div>
		</div>
	</div>
	</section>

<!-- Testimonials -->
<section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
	<h2 class="mb-6 text-2xl font-semibold">What patients say</h2>
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<figure class="rounded-xl border bg-card p-6">
			<blockquote class="text-sm text-muted-foreground">“Booking with Medlink was so easy—found a great doctor and avoided waiting lines.”</blockquote>
			<figcaption class="mt-4 text-sm font-medium">— Sara E.</figcaption>
		</figure>
		<figure class="rounded-xl border bg-card p-6">
			<blockquote class="text-sm text-muted-foreground">“I loved comparing profiles before choosing. The online appointment saved me time.”</blockquote>
			<figcaption class="mt-4 text-sm font-medium">— Hicham R.</figcaption>
		</figure>
		<figure class="rounded-xl border bg-card p-6">
			<blockquote class="text-sm text-muted-foreground">“Clean interface and clear information. I’ll use it for my family, too.”</blockquote>
			<figcaption class="mt-4 text-sm font-medium">— Laila K.</figcaption>
		</figure>
	</div>
</section>

<!-- Call to Action -->
<section class="relative isolate">
	<div class="mx-auto max-w-7xl px-6 pb-20">
		<div class="rounded-2xl border bg-primary text-primary-foreground dark:bg-secondary dark:text-secondary-foreground shadow-sm">
			<div class="px-8 py-10 sm:px-12 sm:py-12">
				<div class="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h3 class="text-xl font-semibold">Ready to find your doctor?</h3>
						<p class="mt-1 text-sm opacity-90">Join Medlink and book your next appointment online.</p>
					</div>
					<a href="/signup" class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary-foreground px-4 text-sm font-medium text-primary transition-colors hover:bg-primary-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:text-secondary">
						Get started
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="border-t">
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
		<div>© {new Date().getFullYear()} Medlink. All rights reserved.</div>
		<div class="flex items-center gap-4">
			<a href="/privacy" class="hover:underline">Privacy</a>
			<a href="/terms" class="hover:underline">Terms</a>
			<a href="/contact" class="hover:underline">Contact</a>
		</div>
	</div>
</footer>

