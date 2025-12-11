<script lang="ts">
  import { onMount } from "svelte";
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  import { Drawer } from "$lib/components/ui/drawer/index.js";
  import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "$lib/components/ui/table/index.js";

  let { data, form } = $props();
  let drawerOpen = $state(false);
  let selectedClinicId = $state<string>("");
  let selectedClinicName = $state<string>("");
  let appointments = $state<any[]>([]);
  let billing = $state<any>(null);
  let billingStale = $state(false);
  let billingRefreshing = $state(false);
  const currency = $derived((data as any)?.content?.common?.currencySymbol || "DT");

  const formatDateLabel = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  };

  const formatBillingText = (template: string | undefined, map: Record<string, string>) => {
    let out = template || "";
    for (const [key, value] of Object.entries(map)) {
      out = out.replace(`{${key}}`, value);
    }
    return out;
  };

  $effect(() => { if ((form as any)?.results) drawerOpen = true; });
  $effect(() => {
    if ((form as any)?.doctor?.id) {
      selectedClinicId = (form as any).doctor.id;
      selectedClinicName = (form as any).doctor.name;
    }
  });
  $effect(() => {
    appointments = (data as any)?.appointments || [];
    billing = (data as any)?.billing ?? null;
  });

  function onCloseDrawer() { drawerOpen = false; }
  function nextAfterSelect() { drawerOpen = false; }
  function formatDateForInput(iso: string) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  onMount(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent)?.detail;
      if (detail && Array.isArray(detail.appointments)) {
        appointments = detail.appointments;
      }
    };
    window.addEventListener("dashboard:appointments:update", handler as EventListener);
    return () => window.removeEventListener("dashboard:appointments:update", handler as EventListener);
  });
</script>

<section class="mx-auto max-w-7xl px-6 py-10">
  <div class="mb-6">
    <h1 class="text-2xl font-semibold">{(data as any)?.content?.dashboard?.welcome || "Welcome,"} {(data as any)?.user?.name}</h1>
    <p class="text-sm text-muted-foreground">{(data as any)?.content?.dashboard?.manageAppointments || "Manage your appointments."}</p>
    {#if (form as any)?.updated}
      <div class="mt-3">
        <Alert class="border-none">
          <AlertTitle>{(data as any)?.content?.dashboard?.appointmentUpdated || "Appointment updated"}</AlertTitle>
          <AlertDescription>{(data as any)?.content?.dashboard?.appointmentUpdatedMessage || "Your changes were saved successfully."}</AlertDescription>
        </Alert>
      </div>
    {/if}
    {#if (form as any)?.deleted}
      <div class="mt-3">
        <Alert class="border-none">
          <AlertTitle>{(data as any)?.content?.dashboard?.appointmentDeleted || "Appointment deleted"}</AlertTitle>
          <AlertDescription>{(data as any)?.content?.dashboard?.appointmentDeletedMessage || "The appointment was removed."}</AlertDescription>
        </Alert>
      </div>
    {/if}
  </div>

  <div class="grid gap-6 lg:grid-cols-3">
    <!-- Appointments -->
    <Card class="lg:col-span-2 border-none">
      <CardHeader>
        <CardTitle>{(data as any).user?.clinic ? (data as any)?.content?.dashboard?.clinicAppointments || "Clinic Appointments" : (data as any)?.content?.dashboard?.currentAppointments || "Current Appointments"}</CardTitle>
        <CardDescription>{(data as any).user?.clinic ? (data as any)?.content?.dashboard?.clinicAppointmentsDesc || "Appointments linked to your clinic." : (data as any)?.content?.dashboard?.appointmentsDesc || "Your upcoming and past bookings."}</CardDescription>
      </CardHeader>
      <CardContent>
        {#if appointments.length === 0}
          <p class="text-sm text-muted-foreground">{(data as any)?.content?.dashboard?.noAppointments || "No appointments yet."}</p>
        {:else}
          {#if (data as any).user?.clinic}
            <div class="space-y-4">
              {#each appointments as appt}
                <div class="rounded-lg bg-accent-foreground/5 p-3">
                  <div class="mb-1 text-sm font-medium">{appt.user_name} • {new Date(appt.date).toLocaleString()}</div>
                  {#if appt.user_phone}
                    <div class="text-xs text-muted-foreground">{(data as any)?.content?.dashboard?.phoneLabel || "Phone"}: {appt.user_phone}</div>
                  {/if}
                  <div class="mb-2 text-xs text-muted-foreground">{(data as any)?.content?.dashboard?.notes || "Notes"}: {appt.notes || "—"}</div>
                  <div class="flex items-center gap-2">
                    <form method="POST" action="?/updateAppointment" class="flex items-center gap-2 flex-wrap">
                      <input type="hidden" name="id" value={appt._id} />
                      <div class="space-y-1">
                        <Input id={`date-${appt._id}`} name="date" type="datetime-local" class="h-9" value={formatDateForInput(appt.date)} />
                      </div>
                      <Button type="submit" size="sm">{(data as any)?.content?.dashboard?.saveButton || "Save"}</Button>
                    </form>
                    <form method="POST" action="?/deleteAppointment" class="flex items-end" onsubmit={(e: SubmitEvent) => { if (!confirm((data as any)?.content?.dashboard?.deleteConfirm || 'Delete this appointment?')) e.preventDefault(); }}>
                      <input type="hidden" name="id" value={appt._id} />
                      <Button type="submit" variant="destructive" size="sm">{(data as any)?.content?.dashboard?.deleteButton || "Delete"}</Button>
                    </form>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="space-y-3">
              {#each appointments as appt}
                <div class="flex items-center justify-between rounded-lg border bg-card p-3">
                  <div>
                    <div class="font-medium">{appt.doctor_name} • {appt.specialty}</div>
                    <div class="text-xs text-muted-foreground">{new Date(appt.date).toLocaleString()} • {(data as any)?.content?.dashboard?.notes || "Notes"}: {appt.notes}</div>
                  </div>
                  <form method="POST" action="?/cancelAppointment" class="flex items-center" onsubmit={(e: SubmitEvent) => { if (!confirm((data as any)?.content?.dashboard?.deleteConfirm || 'Delete this appointment?')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={appt._id} />
                    <Button type="submit" variant="destructive" size="sm">{(data as any)?.content?.dashboard?.deleteButton || "Delete"}</Button>
                  </form>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
      </CardContent>
    </Card>

    <!-- Right column: booking or management -->
    {#if !(data as any).user?.clinic}
    <Card class="border-none">
      <CardHeader>
        <CardTitle>{(data as any)?.content?.dashboard?.findClinicTitle || "Find a Clinic"}</CardTitle>
        <CardDescription>{(data as any)?.content?.dashboard?.findClinicDescription || "Search clinics, pick one, then choose a time."}</CardDescription>
      </CardHeader>
      <form method="POST" action="?/searchClinics" class="contents">
        <CardContent class="space-y-3">
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="space-y-2">
              <Label for="q">{(data as any)?.content?.dashboard?.searchClinicNameLabel || "Clinic or doctor name"}</Label>
              <Input id="q" name="q" placeholder={(data as any)?.content?.dashboard?.searchClinicNamePlaceholder || "Clinic or doctor name"} class="h-10" />
            </div>
            <div class="space-y-2">
              <Label for="specialty">{(data as any)?.content?.dashboard?.searchClinicSpecialtyLabel || "Specialty"}</Label>
              <Input id="specialty" name="specialty" placeholder={(data as any)?.content?.dashboard?.searchClinicSpecialtyPlaceholder || "Cardiology"} class="h-10" />
            </div>
            <div class="space-y-2">
              <Label for="location">{(data as any)?.content?.dashboard?.searchClinicLocationLabel || "Location"}</Label>
              <Input id="location" name="location" placeholder={(data as any)?.content?.dashboard?.searchClinicLocationPlaceholder || "City (e.g., Casablanca)"} class="h-10" />
            </div>
          </div>
          <Button type="submit" class="w-full">{(data as any)?.content?.dashboard?.searchClinicsButton || "Search clinics"}</Button>
          {#if (form as any)?.error}
            <Alert variant="destructive" class="mb-2 border-none w-fit text-wrap">
              <AlertTitle>{(data as any)?.content?.dashboard?.requestFailedTitle || "Request failed"}</AlertTitle>
              <AlertDescription>{(form as any).error}</AlertDescription>
            </Alert>
          {/if}
        </CardContent>
      </form>

      <CardContent class="space-y-3">
        <form method="POST" action="?/availableDays" class="space-y-3">
          <input type="hidden" name="doctor_id" value={selectedClinicId} />
          {#if selectedClinicId}
            <p class="text-sm">{(data as any)?.content?.dashboard?.selectedClinicPrefix || "Selected:"} <span class="font-medium">{selectedClinicName}</span></p>
          {:else}
            <p class="text-sm text-muted-foreground">{(data as any)?.content?.dashboard?.selectClinicPrompt || "Select a clinic from search results."}</p>
          {/if}
          <Button type="submit" class="w-full" disabled={!selectedClinicId}>{(data as any)?.content?.dashboard?.loadAvailableDaysButton || "Load available days"}</Button>
        </form>

        {#if (form as any)?.availableDays}
          <div class="space-y-2">
            <Label for="date">{(data as any)?.content?.dashboard?.availableDayLabel || "Available day"}</Label>
            <select id="date" name="date" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" form="find-slots-form">
              {#each (form as any).availableDays as d}
                <option value={d}>{new Date(d).toLocaleDateString()}</option>
              {/each}
            </select>
          </div>
          {#if !(form as any).availableDays.length}
            <p class="text-sm text-destructive">{((data as any)?.content?.dashboard?.noAvailableDaysMessage || "No available days in the next 14 days for {name}. Please try a different clinic or later.").replace('{name}', selectedClinicName)}</p>
          {/if}
        {/if}

        <form id="find-slots-form" method="POST" action="?/findSlots" class="space-y-3">
          <input type="hidden" name="doctor_id" value={selectedClinicId} />
          <Button type="submit" class="w-full" disabled={!selectedClinicId || !(form as any)?.availableDays?.length}>{(data as any)?.content?.dashboard?.findAvailableTimesButton || "Find available times"}</Button>
        </form>
      </CardContent>
      {#if (form as any)?.slots}
        <form method="POST" action="?/addAppointment" class="contents">
          <CardContent class="space-y-3">
            <input type="hidden" name="doctor_id" value={(form as any).doctor.id} />
            <div class="space-y-2">
              <Label for="slot">{((data as any)?.content?.dashboard?.availableTimesFor || "Available times for {name}").replace('{name}', (form as any).doctor.name)}</Label>
              <select id="slot" name="slot" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {#each (form as any).slots as s}
                  <option value={s}>{new Date(s).toLocaleString()}</option>
                {/each}
              </select>
            </div>
            <div class="space-y-2">
              <Label for="notes">{(data as any)?.content?.dashboard?.notesLabel || "Notes"}</Label>
              <Input id="notes" name="notes" placeholder={(data as any)?.content?.dashboard?.notesPlaceholder || "Optional notes"} class="h-10" />
            </div>
            <Button type="submit" class="w-full">{(data as any)?.content?.dashboard?.bookAppointmentButton || "Book appointment"}</Button>
          </CardContent>
        </form>
      {/if}
    </Card>
    {:else}
    <div class="space-y-4">
      <Card class="border-none">
        <CardHeader>
          <CardTitle>{(data as any)?.content?.dashboard?.billingTitle || "Billing"}</CardTitle>
          <CardDescription>{(data as any)?.content?.dashboard?.billingDescription || "Track free usage and monthly charges for your clinic."}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          {#if billing}
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-md border bg-card/50 p-3">
                <div class="text-xs uppercase text-muted-foreground">{(data as any)?.content?.dashboard?.billingFreeLabel || "Free tier"}</div>
                <div class="text-sm font-medium">
                  {formatBillingText((data as any)?.content?.dashboard?.billingFreeStatus || "{used}/{threshold} used", {
                    used: String(billing.freeUsed || 0),
                    threshold: String(billing.freeThreshold || 50)
                  })}
                </div>
                <div class="text-xs text-muted-foreground">
                  {formatBillingText((data as any)?.content?.dashboard?.billingFreeRemaining || "{remaining} free left", {
                    remaining: String(billing.freeRemaining ?? 0)
                  })}
                </div>
              </div>
              <div class="rounded-md border bg-card/50 p-3">
                <div class="text-xs uppercase text-muted-foreground">{(data as any)?.content?.dashboard?.billingRateLabel || "Rate"}</div>
                <div class="text-sm font-medium">
                  {formatBillingText((data as any)?.content?.dashboard?.billingRate || "{rate} {currency} per appointment after free tier", {
                    rate: String(billing.ratePerAppointment || 2),
                    currency
                  })}
                </div>
              </div>
            </div>

            {#if billing.paidStartDate}
              <div class="rounded-md border bg-card/50 p-3 space-y-1">
                <div class="text-sm font-semibold">{(data as any)?.content?.dashboard?.billingCurrentTitle || "Current month"}</div>
                <div class="text-xs text-muted-foreground">
                  {formatBillingText((data as any)?.content?.dashboard?.billingCurrentPeriod || "Since {start}", {
                    start: formatDateLabel(billing.currentPeriodStart)
                  })}
                </div>
                <div class="text-sm">
                  {formatBillingText((data as any)?.content?.dashboard?.billingCurrentCount || "Billable appointments: {count}", {
                    count: String(billing.currentPeriodPaidAppointments || 0)
                  })}
                </div>
                <div class="text-sm font-semibold">
                  {formatBillingText((data as any)?.content?.dashboard?.billingAmountDue || "Estimated next invoice: {amount} {currency}", {
                    amount: String(billing.currentPeriodAmountDue || 0),
                    currency
                  })}
                </div>
                <div class="text-xs text-muted-foreground">
                  {formatBillingText((data as any)?.content?.dashboard?.billingStartedOn || "Billing started on {date}", {
                    date: formatDateLabel(billing.paidStartDate)
                  })}
                </div>
                <div class="text-xs text-muted-foreground">
                  {formatBillingText((data as any)?.content?.dashboard?.billingLifetimePaid || "Lifetime billable appointments: {count}", {
                    count: String(billing.lifetimePaidAppointments || 0)
                  })}
                </div>
              </div>
            {:else}
              <p class="text-sm text-muted-foreground">
                {formatBillingText((data as any)?.content?.dashboard?.billingNotStarted || "You have {remaining} free appointments left. Billing starts after you reach {threshold}.", {
                  remaining: String(billing.freeRemaining ?? 0),
                  threshold: String(billing.freeThreshold || 50)
                })}
              </p>
            {/if}
          {:else}
            <p class="text-sm text-muted-foreground">{(data as any)?.content?.dashboard?.billingUnavailable || "Billing data unavailable."}</p>
          {/if}
        </CardContent>
      </Card>

      <Card class="hidden lg:block h-min border-none">
        <CardHeader>
          <CardTitle>{(data as any)?.content?.dashboard?.manageAppointmentsTitle || "Manage Appointments"}</CardTitle>
          <CardDescription>{(data as any)?.content?.dashboard?.manageAppointmentsDescription || "Update or delete existing appointments for your clinic."}</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">{(data as any)?.content?.dashboard?.manageAppointmentsHelper || "Use the controls in the list to edit or remove appointments. Creating new appointments is disabled for clinic accounts."}</p>
        </CardContent>
      </Card>
    </div>
    {/if}
  </div>
</section>

<Drawer open={drawerOpen} on:close={onCloseDrawer}>
  <div class="mb-3">
    <h3 class="text-lg font-semibold">{(data as any)?.content?.dashboard?.drawerTitle || "Select a clinic"}</h3>
    <p class="text-sm text-muted-foreground">{(data as any)?.content?.dashboard?.drawerDescription || "Choose one from the list, then click Next."}</p>
  </div>
  {#if (form as any)?.results?.length}
    <div class="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">{(data as any)?.content?.dashboard?.drawerPick || "Pick"}</TableHead>
            <TableHead>{(data as any)?.content?.dashboard?.drawerName || "Name"}</TableHead>
            <TableHead>{(data as any)?.content?.dashboard?.drawerSpecialty || "Specialty"}</TableHead>
            <TableHead>{(data as any)?.content?.dashboard?.drawerCity || "City"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each (form as any).results as c}
            <TableRow onclick={() => { selectedClinicId = c._id; selectedClinicName = c.name; }}>
              <TableCell>
                <input type="radio" name="clinic" value={c._id} bind:group={selectedClinicId} onchange={() => (selectedClinicName = c.name)} />
              </TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.specialty}</TableCell>
              <TableCell>{c.city}</TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>
  {:else}
    <p class="text-sm text-muted-foreground">{(data as any)?.content?.dashboard?.drawerNoClinics || "No clinics found. Try different filters."}</p>
  {/if}
  <div class="mt-4 flex justify-end gap-2">
    <button type="button" class="h-10 rounded-md border border-input bg-background px-4 text-sm" onclick={onCloseDrawer}>{(data as any)?.content?.dashboard?.drawerCancel || "Cancel"}</button>
    <button type="button" class="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50" onclick={nextAfterSelect} disabled={!selectedClinicId}>{(data as any)?.content?.dashboard?.drawerNext || "Next"}</button>
  </div>
</Drawer>
