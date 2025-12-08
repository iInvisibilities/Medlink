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
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>Enter your email to receive a reset link.</CardDescription>
      </CardHeader>
      <form method="POST" action="/reset" class="contents">
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" class="h-10" value={(form as any)?.values?.email} />
          </div>
        </CardContent>
        <CardFooter class="flex flex-col gap-3">
            <Button type="submit" class="w-full">Send reset link</Button>
            {#if (form as any)?.error}
            <Alert variant="destructive" class="mb-4 border-none">
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription>{(form as any).error}</AlertDescription>
            </Alert>
            {/if}
            {#if (form as any)?.success}
            <Alert class="mb-4 border-none">
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>{(form as any).success}</AlertDescription>
            </Alert>
            {/if}
        </CardFooter>
      </form>
    </Card>
    <p class="mt-4 text-xs text-muted-foreground">For demo, we will display the link after request.</p>
  </div>
</section>
