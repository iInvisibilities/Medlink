<script lang="ts">
  let { data } = $props();
</script>

<section class="border-b bg-background/40">
  <div class="mx-auto max-w-7xl px-6 py-10 sm:py-12">
    <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
      {data?.content?.search?.title || "Clinic search"}
    </h1>
    <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
      {data?.content?.search?.description || "Clinics that match your filters."}
    </p>

    <!-- Search form (same fields as home, but pre-filled) -->
    <form method="GET" action="/search" class="mt-8 rounded-xl border bg-card p-6 shadow-sm">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="space-y-2">
          <label class="text-sm font-medium" for="specialty">{data?.content?.home?.specialty || "Specialty"}</label>
          <input
            id="specialty"
            name="specialty"
            value={data.filters.specialty}
            placeholder={data?.content?.home?.specialtyPlaceholder || "Dermatologist, Dentist..."}
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium" for="location">{data?.content?.home?.location || "Location"}</label>
          <input
            id="location"
            name="location"
            value={data.filters.location}
            placeholder={data?.content?.home?.locationPlaceholder || "City or Area"}
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium" for="date">{data?.content?.home?.preferredDate || "Preferred date"}</label>
          <input
            id="date"
            name="date"
            type="date"
            value={data.filters.date}
            class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div class="flex items-end">
          <button
            type="submit"
            class="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-secondary dark:text-secondary-foreground"
          >
            {data?.content?.home?.searchButton || "Search doctors"}
          </button>
        </div>
      </div>
      <p class="mt-3 text-xs text-muted-foreground">{data?.content?.home?.searchTip || "Tip: Try \"Cardiologist\" in \"Casablanca\"."}</p>
    </form>
  </div>
</section>

<section class="mx-auto max-w-7xl px-6 py-10 sm:py-12">
  {#if data.rateLimited}
    <div class="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
      <h2 class="text-sm font-medium text-foreground">
        {data?.content?.search?.rateLimitedTitle || "Too many searches"}
      </h2>
      <p class="mt-1 text-xs text-muted-foreground">
        {(data?.content?.search?.rateLimitedBody || "You can search again in {seconds} seconds.").replace(
          "{seconds}",
          String(data.retrySeconds ?? 30)
        )}
      </p>
    </div>
  {/if}

  {#if !data.hasFilters}
    <div class="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
      <h2 class="text-base font-medium text-foreground">
        {data?.content?.search?.emptyStateTitle || "Search for clinics"}
      </h2>
      <p class="mt-1">
        {data?.content?.search?.emptyStateBody || "Use the filters above to search by specialty, location, and date."}
      </p>
    </div>
  {:else if data.clinics.length === 0}
    <div class="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
      <h2 class="text-base font-medium text-foreground">
        {data?.content?.search?.noResultsTitle || "No clinics found"}
      </h2>
      <p class="mt-1">
        {data?.content?.search?.noResultsBody || "Try changing the specialty, location, or date."}
      </p>
    </div>
  {:else}
    <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold">
          {data?.content?.search?.resultsTitle || "Search results"}
        </h2>
        <p class="mt-1 text-sm text-muted-foreground">
          {(data?.content?.search?.resultsSummary || "{count} clinics found").replace("{count}", String(data.clinics.length))}
        </p>
      </div>
      {#if data.filters.specialty || data.filters.location || data.filters.date}
        <div class="text-xs text-muted-foreground">
          <span class="font-medium">
            {data?.content?.search?.filtersLabel || "Filters:"}
          </span>
          {#if data.filters.specialty}
            <span class="ml-1">{data?.content?.home?.specialty || "Specialty"}: {data.filters.specialty}</span>
          {/if}
          {#if data.filters.location}
            <span class="ml-2">{data?.content?.home?.location || "Location"}: {data.filters.location}</span>
          {/if}
          {#if data.filters.date}
            <span class="ml-2">{data?.content?.home?.preferredDate || "Preferred date"}: {data.filters.date}</span>
          {/if}
        </div>
      {/if}
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.clinics as clinic}
        <article class="flex flex-col justify-between rounded-xl border bg-card p-5 text-sm shadow-sm">
          <div>
            <h3 class="text-base font-semibold leading-snug">{clinic.name}</h3>
            <p class="mt-1 text-xs text-muted-foreground">
              {data?.content?.search?.specialtyLabel || "Specialty"}: {clinic.specialty}
            </p>
            <p class="mt-1 text-xs text-muted-foreground">
              {data?.content?.search?.locationLabel || "Location"}: {clinic.city}
            </p>
          </div>
          {#if data.filters.date && data.dateFilterApplied}
            <p class="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
              {data?.content?.search?.openOnDateLabel || "Open on the selected date"}
            </p>
          {/if}
        </article>
      {/each}
    </div>
  {/if}
</section>
