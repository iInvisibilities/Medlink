<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  let { form, data } = $props();
  // access form directly in markup; avoid local capture warnings
</script>

<section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
  <div class="mx-auto max-w-md">
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>{data?.content?.signup?.title || "Create your account"}</CardTitle>
        <CardDescription>{data?.content?.signup?.description || "Join Medlink and book appointments online."}</CardDescription>
      </CardHeader>
      <form method="POST" action="/signup" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="name">{data?.content?.signup?.nameLabel || "Full name"}</Label>
            <Input id="name" name="name" placeholder={data?.content?.signup?.namePlaceholder || "Your name"} class="h-10" value={(form as any)?.values?.name} aria-invalid={Boolean((form as any)?.errors?.name)} aria-errormessage="name-error" />
            {#if (form as any)?.errors?.name}
              <p id="name-error" class="text-xs text-destructive">{(form as any).errors.name}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="email">{data?.content?.signup?.emailLabel || "Email"}</Label>
            <Input id="email" name="email" type="email" placeholder={data?.content?.signup?.emailPlaceholder || "you@example.com"} class="h-10" value={(form as any)?.values?.email} aria-invalid={Boolean((form as any)?.errors?.email)} aria-errormessage="email-error" />
            {#if (form as any)?.errors?.email}
              <p id="email-error" class="text-xs text-destructive">{(form as any).errors.email}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="password">{data?.content?.signup?.passwordLabel || "Password"}</Label>
            <Input id="password" name="password" type="password" placeholder={data?.content?.signup?.passwordPlaceholder || "••••••••"} class="h-10" aria-invalid={Boolean((form as any)?.errors?.password)} aria-errormessage="password-error" />
            {#if (form as any)?.errors?.password}
              <p id="password-error" class="text-xs text-destructive">{(form as any).errors.password}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="confirm">{data?.content?.signup?.confirmLabel || "Confirm password"}</Label>
            <Input id="confirm" name="confirm" type="password" placeholder={data?.content?.signup?.confirmPlaceholder || "••••••••"} class="h-10" aria-invalid={Boolean((form as any)?.errors?.confirm)} aria-errormessage="confirm-error" />
            {#if (form as any)?.errors?.confirm}
              <p id="confirm-error" class="text-xs text-destructive">{(form as any).errors.confirm}</p>
            {/if}
          </div>
          <div class="space-y-2">
            <Label for="invite_token">{data?.content?.signup?.inviteTokenLabel || "Clinic invite token (optional)"}</Label>
            <Input id="invite_token" name="invite_token" placeholder={data?.content?.signup?.inviteTokenPlaceholder || "Paste invite token"} class="h-10" value={(form as any)?.values?.invite_token} />
            {#if (form as any)?.errors?.invite_token}
              <p class="text-xs text-destructive">{(form as any).errors.invite_token}</p>
            {/if}
          </div>
            <div class="text-xs text-muted-foreground">{data?.content?.signup?.termsAgreement || "By signing up, you agree to our"} <a class="underline" href="/terms">{data?.content?.signup?.terms || "Terms"}</a> {data?.content?.signup?.and || "and"} <a class="underline" href="/privacy">{data?.content?.signup?.privacy || "Privacy"}</a>.</div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
          <Button type="submit" class="w-full">{data?.content?.signup?.signupButton || "Create account"}</Button>
          <p class="text-xs text-muted-foreground">{data?.content?.signup?.haveAccount || "Already have an account?"}
            <a href="/login" class="font-medium text-primary underline-offset-4 hover:underline">{data?.content?.signup?.login || "Log in"}</a>
          </p>
          {#if (form as any)?.error || (form as any)?.errors}
            <Alert variant="destructive" class="mb-4 border-none">
                <AlertTitle>{data?.content?.signup?.signupFailed || "There was a problem"}</AlertTitle>
                <AlertDescription>{(form as any)?.error || (data?.content?.signup?.signupFailedMessage || "Please check the fields and try again.")}</AlertDescription>
            </Alert>
          {/if}
        </CardFooter>
      </form>
    </Card>
  </div>
</section>
