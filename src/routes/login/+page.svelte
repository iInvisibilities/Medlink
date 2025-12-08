<script lang="ts">
  import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "$lib/components/ui/card/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Alert, AlertTitle, AlertDescription } from "$lib/components/ui/alert/index.js";
  let { form } = $props();
</script>

<section class="mx-auto max-w-7xl px-6 py-12 sm:py-16">
  <div class="mx-auto max-w-md">
    <Card class="rounded-2xl">
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Access your Medlink account.</CardDescription>
      </CardHeader>
      <form method="POST" action="/login" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" class="h-10" value={(form as any)?.values?.email} />
          </div>
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" class="h-10" />
          </div>
          <div class="flex items-center justify-between text-xs">
            <a href="/reset" class="underline">Forgot password?</a>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
          <Button type="submit" class="w-full">Log in</Button>
          <p class="text-xs text-muted-foreground">New to Medlink?
            <a href="/signup" class="font-medium text-primary underline-offset-4 hover:underline">Create an account</a>
          </p>
          {#if (form as any)?.error}
            <Alert variant="destructive" class="mb-4 border-none">
                <AlertTitle>Login failed</AlertTitle>
                <AlertDescription>{(form as any)?.error || "Check your email and password."}</AlertDescription>
            </Alert>
          {/if}
        </CardFooter>
      </form>
    </Card>
  </div>
</section>
