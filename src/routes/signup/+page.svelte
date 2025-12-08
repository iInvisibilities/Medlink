<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  let { form } = $props();
  // access form directly in markup; avoid local capture warnings
</script>

<section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
  <div class="mx-auto max-w-md">
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Join Medlink and book appointments online.</CardDescription>
      </CardHeader>
      <form method="POST" action="/signup" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Full name</Label>
            <Input id="name" name="name" placeholder="Your name" class="h-10" value={(form as any)?.values?.name} aria-invalid={Boolean((form as any)?.errors?.name)} aria-errormessage="name-error" />
            {#if (form as any)?.errors?.name}
              <p id="name-error" class="text-xs text-destructive">{(form as any).errors.name}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" class="h-10" value={(form as any)?.values?.email} aria-invalid={Boolean((form as any)?.errors?.email)} aria-errormessage="email-error" />
            {#if (form as any)?.errors?.email}
              <p id="email-error" class="text-xs text-destructive">{(form as any).errors.email}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" class="h-10" aria-invalid={Boolean((form as any)?.errors?.password)} aria-errormessage="password-error" />
            {#if (form as any)?.errors?.password}
              <p id="password-error" class="text-xs text-destructive">{(form as any).errors.password}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="confirm">Confirm password</Label>
            <Input id="confirm" name="confirm" type="password" placeholder="••••••••" class="h-10" aria-invalid={Boolean((form as any)?.errors?.confirm)} aria-errormessage="confirm-error" />
            {#if (form as any)?.errors?.confirm}
              <p id="confirm-error" class="text-xs text-destructive">{(form as any).errors.confirm}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="invite_token">Clinic invite token (optional)</Label>
            <Input id="invite_token" name="invite_token" placeholder="Paste invite token" class="h-10" value={(form as any)?.values?.invite_token} />
            {#if (form as any)?.errors?.invite_token}
              <p class="text-xs text-destructive">{(form as any).errors.invite_token}</p>
            {/if}
          </div>
            <div class="text-xs text-muted-foreground">By signing up, you agree to our <a class="underline" href="/terms">Terms</a> and <a class="underline" href="/privacy">Privacy</a>.</div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
          <Button type="submit" class="w-full">Create account</Button>
          <p class="text-xs text-muted-foreground">Already have an account?
            <a href="/login" class="font-medium text-primary underline-offset-4 hover:underline">Log in</a>
          </p>
          {#if (form as any)?.error || (form as any)?.errors}
            <Alert variant="destructive" class="mb-4 border-none">
                <AlertTitle>There was a problem</AlertTitle>
                <AlertDescription>{(form as any)?.error || "Please check the fields and try again."}</AlertDescription>
            </Alert>
          {/if}
        </CardFooter>
      </form>
    </Card>
  </div>
</section>
