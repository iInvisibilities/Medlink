<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "$lib/components/ui/table/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  let { data, form } = $props();
</script>

<section class="mx-auto max-w-7xl px-6 py-10 space-y-6">
  <div>
    <h1 class="text-2xl font-semibold">Admin Dashboard</h1>
    <p class="text-sm text-muted-foreground">Manage clinics (create, edit, delete).</p>
  </div>

  {#if (form as any)?.error}
    <Alert variant="destructive" class="border-none">
      <AlertTitle>Action failed</AlertTitle>
      <AlertDescription>{(form as any).error}</AlertDescription>
    </Alert>
  {/if}

  <Card>
    <CardHeader>
      <div class="flex items-start justify-between gap-2">
        <div>
          <CardTitle>Register New Clinic</CardTitle>
          <CardDescription>Add a clinic to the directory.</CardDescription>
        </div>
        <form method="POST" action="?/clearLoaded">
          <Button type="submit" variant="outline" size="sm">Clear</Button>
        </form>
      </div>
    </CardHeader>
    <form method="POST" action="?/createClinic" class="contents">
      <CardContent class="grid gap-3 sm:grid-cols-4">
        {#if (form as any)?.loaded?._id}
          <input type="hidden" name="id_loaded" value={(form as any).loaded._id} />
        {/if}
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input id="name" name="name" placeholder="e.g., MedLink Clinic" class="h-10" required value={(form as any)?.loaded?.name || ''} />
        </div>
        <div class="space-y-2">
          <Label for="specialty">Specialty</Label>
          <Input id="specialty" name="specialty" placeholder="Cardiology" class="h-10" required value={(form as any)?.loaded?.specialty || ''} />
        </div>
        <div class="space-y-2">
          <Label for="city">City</Label>
          <Input id="city" name="city" placeholder="Casablanca" class="h-10" required value={(form as any)?.loaded?.city || ''} />
        </div>
        <div class="space-y-2 sm:col-span-4">
          <Label>Open Hours</Label>
          <div class="grid gap-2 sm:grid-cols-3">
            {#each [0,1,2,3,4,5,6] as d}
              <div class="rounded-md border p-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</span>
                  <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name={`oh_enabled_${d}`} checked={(form as any)?.loaded?.open_hours?.some((h: any) => Number(h.day) === d) || false} /> Enable</label>
                </div>
                <div class="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <Label for={`oh_start_${d}`}>Start</Label>
                    <Input id={`oh_start_${d}`} name={`oh_start_${d}`} type="time" class="h-9" value={(form as any)?.loaded?.open_hours?.find((h: any) => Number(h.day) === d)?.start || ''} />
                  </div>
                  <div>
                    <Label for={`oh_end_${d}`}>End</Label>
                    <Input id={`oh_end_${d}`} name={`oh_end_${d}`} type="time" class="h-9" value={(form as any)?.loaded?.open_hours?.find((h: any) => Number(h.day) === d)?.end || ''} />
                  </div>
                </div>
              </div>
            {/each}
          </div>
          <p class="text-xs text-muted-foreground">Select days and set start/end times. Only enabled days are saved.</p>
        </div>
        <div class="sm:col-span-4">
          <Button type="submit" class="w-full">{(form as any)?.loaded?._id ? 'Save changes' : 'Create clinic'}</Button>
        </div>
      </CardContent>
    </form>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Clinics</CardTitle>
      <CardDescription>Editable clinic list. Save row to persist changes.</CardDescription>
    </CardHeader>
    <CardContent>
      {#if (data as any).clinics.length === 0}
        <p class="text-sm text-muted-foreground">No clinics found.</p>
      {:else}
        <div class="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-44">Actions</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Open hours (JSON)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each (data as any).clinics as c}
                <TableRow>
                  <TableCell>
                  <TableHead>Invite Token</TableHead>
                  <TableHead>Invite Status</TableHead>
                    <div class="flex gap-2">
                      <Button type="submit" form={`update-${c._id}`} size="sm">Save</Button>
                      <form method="POST" action="?/loadClinic">
                        <input type="hidden" name="id" value={c._id} />
                        <Button type="submit" size="sm" variant="outline">Load</Button>
                      </form>
                      <form method="POST" action="?/deleteClinic" onsubmit={(e) => { if (!confirm('Delete this clinic?')) e.preventDefault(); }}>
                        <input type="hidden" name="id" value={c._id} />
                        <Button type="submit" size="sm" variant="destructive">Delete</Button>
                      </form>
                    </div>
                    <TableCell><code class="text-xs">{c.invite_token || "—"}</code></TableCell>
                    <TableCell>
                      {#if c.invite_claimed}
                        <span class="text-xs text-muted-foreground">claimed</span>
                      {:else}
                        <span class="text-xs">not claimed</span>
                      {/if}
                    </TableCell>
                  </TableCell>
                  <TableCell>
                    <input name="name" form={`update-${c._id}`} value={c.name} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" />
                  </TableCell>
                  <TableCell>
                    <input name="specialty" form={`update-${c._id}`} value={c.specialty} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" />
                  </TableCell>
                  <TableCell>
                    <input name="city" form={`update-${c._id}`} value={c.city} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" />
                  </TableCell>
                  <TableCell>
                    <input name="open_hours" form={`update-${c._id}`} value={JSON.stringify(c.open_hours || [])} class="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" />
                  </TableCell>

                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
        <!-- Hidden update forms rendered outside the table to avoid invalid form placement inside <tr> -->
        {#each (data as any).clinics as c}
          <form id={`update-${c._id}`} method="POST" action="?/updateClinic">
            <input type="hidden" name="id" value={c._id} />
          </form>
        {/each}
      {/if}
    </CardContent>
  </Card>
</section>
